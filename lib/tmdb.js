const fetch = global.fetch || require('node-fetch');
const TMDB_API_KEY = process.env.TMDB_API_KEY || 'f1c10e9a04b75080f8cf95b94b95caed';
// don't hardcode a token fallback; use token only when provided via env
const TMDB_TOKEN = process.env.TMDB_TOKEN || undefined;

function buildUrl(path, params = {}) {
  const base = 'https://api.themoviedb.org/3';
  const url = new URL(`${base}${path}`);
  // attach api_key if available (prefer API key when present)
  const apiKey = process.env.TMDB_API_KEY || TMDB_API_KEY;
  if (apiKey) url.searchParams.set('api_key', apiKey);
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null) url.searchParams.set(k, v); });
  return url.toString();
}

async function tmdbFetch(path, params) {
  const url = buildUrl(path, params);
  const headers = {};
  // include Authorization header only if TMDB_TOKEN env var provided
  const token = process.env.TMDB_TOKEN || TMDB_TOKEN;
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`TMDB request failed ${res.status} ${res.statusText} ${txt}`);
  }
  return res.json();
}

async function searchTMDB(type, query, year) {
  const q = query || '';
  const yearParam = year ? String(year) : undefined;
  const path = type === 'tv' ? '/search/tv' : '/search/movie';
  return tmdbFetch(path, { query: q, year: yearParam });
}

async function fetchDetailsById(type, tmdbId) {
  const path = type === 'tv' ? `/tv/${tmdbId}` : `/movie/${tmdbId}`;
  return tmdbFetch(path);
}

// Find a TMDB id by searching and return rating info
async function findRating(type, title, year) {
  if (!title) return null;
  try {
    const data = await searchTMDB(type, title, year);
    const results = data.results || [];
    if (!results.length) return null;
    const best = results[0];
    const id = best.id;
    const details = await fetchDetailsById(type, id);
    const rating = details.vote_average || null;
    const votes = details.vote_count || null;
    return { tmdbId: id, rating, votes };
  } catch (e) {
    console.error('TMDB findRating error', e && e.message ? e.message : e);
    return null;
  }
}

module.exports = { findRating, fetchDetailsById };
