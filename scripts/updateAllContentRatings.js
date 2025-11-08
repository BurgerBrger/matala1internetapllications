/*
Update all Content documents (movie and tv) with TMDB ratings.

Usage:
  # set your TMDB API key in the environment for this run
  $env:TMDB_API_KEY = 'your_api_key_here'
  node scripts/updateAllContentRatings.js [--force]

Options:
  --force   Overwrite existing tmdbId/tmdbRating/tmdbVoteCount even if present

Notes:
  - Uses the project's `lib/tmdb.js` helper which prefers TMDB_API_KEY (query param).
  - Limits concurrency to avoid hitting rate limits.
*/

require('dotenv').config();
const mongoose = require('mongoose');
const tmdb = require('../lib/tmdb');
const Content = require('../models/mongo/Content');

const FORCE = process.argv.includes('--force');
const CONCURRENCY = 6;

async function updateOne(doc) {
  try {
    const info = await tmdb.findRating(doc.type === 'tv' ? 'tv' : 'movie', doc.name, doc.year);
    if (!info) return { updated: false, reason: 'not-found' };
    const update = { tmdbId: info.tmdbId, tmdbRating: info.rating, tmdbVoteCount: info.votes };
    await Content.updateOne({ _id: doc._id }, { $set: update });
    return { updated: true, info };
  } catch (e) {
    return { updated: false, reason: e && e.message ? e.message : String(e) };
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

    // load docs to process
    const filter = { type: { $in: ['movie', 'tv'] } };
    if (!FORCE) {
      // only those missing tmdbId or tmdbRating
      filter.$or = [ { tmdbId: { $exists: false } }, { tmdbRating: { $exists: false } } ];
    }
    const docs = await Content.find(filter).lean();
    console.log('Found', docs.length, 'docs to process (force=', !!FORCE, ')');

    let idx = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    const queue = docs.slice();

    async function worker() {
      while (queue.length) {
        const doc = queue.shift();
        idx++;
        process.stdout.write(`Processing ${idx}/${docs.length}: id=${doc.id} name=${doc.name}\r`);
        const res = await updateOne(doc);
        if (res.updated) updated++;
        else if (res.reason === 'not-found') skipped++;
        else errors++;
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
