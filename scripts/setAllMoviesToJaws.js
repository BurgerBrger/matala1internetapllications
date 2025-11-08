/*
Script: setAllMoviesToJaws.js
- Usage: set TMDB_TOKEN env to your TMDB v4 access token, then run:
  $env:TMDB_TOKEN = '<<token>>'
  node scripts/setAllMoviesToJaws.js
- It will search TMDB for "Jaws", take the top result, fetch its details, then update all Content docs with type: 'movie' to set tmdbId, tmdbRating, tmdbVoteCount.
*/

require('dotenv').config();
const mongoose = require('mongoose');
const fetch = global.fetch || require('node-fetch');
const Content = require('../models/mongo/Content');

async function searchMovieByTitle(token, title) {
  const q = encodeURIComponent(title || '');
  const apiKey = process.env.TMDB_API_KEY;
  const url = apiKey
    ? `https://api.themoviedb.org/3/search/movie?query=${q}&api_key=${apiKey}`
    : `https://api.themoviedb.org/3/search/movie?query=${q}`;
  const headers = {};
  if (!apiKey && token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`TMDB search failed ${res.status} ${res.statusText} ${txt}`);
  }
  return res.json();
}

async function fetchMovieDetailsById(token, id) {
  const apiKey = process.env.TMDB_API_KEY;
  const url = apiKey
    ? `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`
    : `https://api.themoviedb.org/3/movie/${id}`;
  const headers = {};
  if (!apiKey && token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`TMDB details failed ${res.status} ${res.statusText} ${txt}`);
  }
  return res.json();
}

(async function main() {
  const token = process.env.TMDB_TOKEN;
  if (!token) {
    console.error('TMDB_TOKEN not set in environment. Set it to your TMDB v4 access token and retry.');
    process.exit(2);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('Searching TMDB for "Jaws"...');
    const search = await searchMovieByTitle(token, 'Jaws');
    const results = search.results || [];
    if (!results.length) {
      console.error('No search results for Jaws');
      process.exit(3);
    }
    const best = results[0];
    console.log('Top TMDB search result:', best.title, 'id=', best.id, 'release_date=', best.release_date);

    const details = await fetchMovieDetailsById(token, best.id);
    const rating = details.vote_average || 0;
    const votes = details.vote_count || 0;
    console.log(`Jaws rating: ${rating} (votes: ${votes}) tmdbId=${best.id}`);

    // update all movie Content docs
    const res = await Content.updateMany({ type: 'movie' }, { $set: { tmdbId: best.id, tmdbRating: rating, tmdbVoteCount: votes } });
    console.log('Update result:', res);
    const sample = await Content.findOne({ type: 'movie' }).lean();
    console.log('Sample updated doc:', { id: sample.id, name: sample.name, tmdbId: sample.tmdbId, tmdbRating: sample.tmdbRating, tmdbVoteCount: sample.tmdbVoteCount });

    console.log('Done.');
    process.exit(0);
  } catch (e) {
    console.error('Error:', e && e.message ? e.message : e);
    process.exit(1);
  }
})();
