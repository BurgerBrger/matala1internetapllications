/*
Populate `topActors` for each Content document (movie and tv) using TMDB credits.

Usage:
  # set TMDB_API_KEY in env (preferred)
  $env:TMDB_API_KEY = 'your_api_key_here'
  node scripts/populateTopActors.js [--force]

Options:
  --force   Overwrite existing `topActors` values. Without --force, only fills docs missing topActors.

Notes:
  - Searches TMDB by title (and year when available) to find the best match, then requests the credits
    and stores the top 3 cast names in the `topActors` array.
  - Uses limited concurrency (6) to stay within rate limits.
*/

require('dotenv').config();
const mongoose = require('mongoose');
const fetch = global.fetch || require('node-fetch');
const Content = require('../models/mongo/Content');
const tmdb = require('../lib/tmdb');

const FORCE = process.argv.includes('--force');
const CONCURRENCY = 6;

async function fetchCredits(tmdbType, tmdbId) {
  if (!tmdbId) return null;
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) throw new Error('TMDB_API_KEY not set');
  const path = tmdbType === 'tv' ? `tv/${tmdbId}/credits` : `movie/${tmdbId}/credits`;
  const url = `https://api.themoviedb.org/3/${path}?api_key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`credits fetch failed ${res.status} ${res.statusText} ${txt}`);
  }
  return res.json();
}

async function populateOne(doc) {
  try {
    // if not forcing and already present with length > 0, skip
    if (!FORCE && Array.isArray(doc.topActors) && doc.topActors.length) return { ok: false, reason: 'exists' };

    // find tmdb id by searching
    const type = doc.type === 'tv' ? 'tv' : 'movie';
    const info = await tmdb.findRating(type, doc.name, doc.year);
    const tmdbId = info?.tmdbId || doc.tmdbId || null;
    if (!tmdbId) return { ok: false, reason: 'no-tmdb-id' };

    // fetch credits
    const credits = await fetchCredits(type, tmdbId);
    const cast = Array.isArray(credits?.cast) ? credits.cast : [];
    if (!cast.length) return { ok: false, reason: 'no-cast' };
    // take top 3 names
    const names = cast.slice(0, 3).map(c => c.name).filter(Boolean);
    if (!names.length) return { ok: false, reason: 'no-names' };

    await Content.updateOne({ _id: doc._id }, { $set: { topActors: names, tmdbId: tmdbId } });
    return { ok: true, names };
  } catch (e) {
    return { ok: false, reason: e && e.message ? e.message : String(e) };
  }
}

(async function main() {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      console.error('TMDB_API_KEY not set. Set it and re-run.');
      process.exit(2);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const filter = { type: { $in: ['movie', 'tv'] } };
    if (!FORCE) filter.$or = [{ topActors: { $exists: false } }, { topActors: { $size: 0 } }];

    const docs = await Content.find(filter).lean();
    console.log('Found', docs.length, 'docs to process (force=', !!FORCE, ')');

    const queue = docs.slice();
    let idx = 0, updated = 0, skipped = 0, errors = 0;

    async function worker() {
      while (queue.length) {
        const doc = queue.shift();
        idx++;
        process.stdout.write(`Processing ${idx}/${docs.length}: id=${doc.id} name=${doc.name}\r`);
        const r = await populateOne(doc);
        if (r.ok) updated++; else if (r.reason === 'exists' || r.reason === 'no-tmdb-id' || r.reason === 'no-cast' || r.reason === 'no-names') skipped++; else errors++;
        if (idx % 50 === 0) console.log(`\nProgress: ${idx}/${docs.length} updated=${updated} skipped=${skipped} errors=${errors}`);
      }
    }

    await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
    console.log('\nDone. Summary:');
    console.log({ total: docs.length, updated, skipped, errors });
    process.exit(0);
  } catch (e) {
    console.error('Fatal error', e && e.message ? e.message : e);
    process.exit(1);
  }
})();
