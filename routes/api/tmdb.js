const router = require('express').Router();
const Content = require('../../models/mongo/Content');
const tmdb = require('../../lib/tmdb');

// GET /api/tmdb/content/:id -> { rating, votes, tmdbId }
router.get('/content/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    console.log('[api/tmdb] GET /content/:id hit, id=', req.params.id);
    const doc = await Content.findOne({ id }).lean();
    if (!doc) {
      console.log('[api/tmdb] content not found for id=', id);
      return res.status(404).json({ error: 'Not found' });
    }

    // prefer an explicit tmdbId if present
    if (doc.tmdbId) {
      const details = await tmdb.fetchDetailsById(doc.type === 'tv' ? 'tv' : 'movie', doc.tmdbId);
      return res.json({ tmdbId: doc.tmdbId, rating: details.vote_average || null, votes: details.vote_count || null });
    }

  // lookup via TMDB only
  const info = await tmdb.findRating(doc.type === 'tv' ? 'tv' : 'movie', doc.name, doc.year);
  if (!info) return res.json({ tmdbId: null, rating: null, votes: null });
  return res.json({ tmdbId: info.tmdbId, rating: info.rating, votes: info.votes, source: 'tmdb' });
  } catch (e) { next(e); }
});

// POST /api/tmdb/contents -> { results: { <id>: { tmdbId, rating, votes } } }
router.post('/contents', async (req, res, next) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids.map(Number).filter(n => !Number.isNaN(n)) : [];
    if (!ids.length) return res.status(400).json({ error: 'ids required' });

    // load content docs
    const docs = await Content.find({ id: { $in: ids } }).lean();
    const byId = Object.fromEntries(docs.map(d => [d.id, d]));

    // process in sequence with limited concurrency to avoid too many TMDB requests
    const results = {};
    const concurrency = 6;
    const queue = ids.slice();

    async function worker() {
      while (queue.length) {
        const id = queue.shift();
        const doc = byId[id];
        try {
          if (!doc) { results[id] = { tmdbId: null, rating: null, votes: null }; continue; }
          if (doc.tmdbId) {
            const details = await tmdb.fetchDetailsById(doc.type === 'tv' ? 'tv' : 'movie', doc.tmdbId);
            results[id] = { tmdbId: doc.tmdbId, rating: details.vote_average || null, votes: details.vote_count || null, source: 'tmdb' };
          } else {
            const info = await tmdb.findRating(doc.type === 'tv' ? 'tv' : 'movie', doc.name, doc.year);
            if (!info) results[id] = { tmdbId: null, rating: null, votes: null };
            else results[id] = { tmdbId: info.tmdbId, rating: info.rating, votes: info.votes, source: 'tmdb' };
          }
        } catch (e) {
          results[id] = { tmdbId: null, rating: null, votes: null };
        }
      }
    }

    await Promise.all(Array.from({ length: concurrency }, () => worker()));
    res.json({ results });
  } catch (e) { next(e); }
});

module.exports = router;
