// controllers/content.js
const Content = require("../models/mongo/Content");
const Profile = require("../models/mongo/Profile");
const tmdb = require("../lib/tmdb");

// helper: update content doc with TMDB info (search by title/year when needed)
async function ensureTmdbRating(doc) {
  try {
    if (!doc) return null;
    // if we already have a cached rating, return it
    if (doc.tmdbRating !== undefined && doc.tmdbRating !== null) {
      return { tmdbId: doc.tmdbId, rating: doc.tmdbRating, votes: doc.tmdbVoteCount };
    }
    // try to find via title/year
    const info = await tmdb.findRating(doc.type === 'tv' ? 'tv' : 'movie', doc.name, doc.year);
    if (!info) return null;
    // persist to DB
    await Content.updateOne({ _id: doc._id }, { $set: { tmdbId: info.tmdbId, tmdbRating: info.rating, tmdbVoteCount: info.votes, tmdbLastUpdated: new Date() } });
    return { tmdbId: info.tmdbId, rating: info.rating, votes: info.votes };
  } catch (e) {
    console.error('ensureTmdbRating error', e && e.message ? e.message : e);
    return null;
  }
}

// GET /api/content
exports.getAllContents = async (req, res, next) => {
  try {
    // support grouped top-N per type (e.g. ?groupby=typeTop)
    if (req.query && req.query.groupby === 'typeTop') {
      // aggregate top 5 by numberOfLikes per type (movie, tv, etc.)
      const agg = await Content.aggregate([
        { $sort: { numberOfLikes: -1 } },
        { $group: { _id: "$type", items: { $push: "$$ROOT" } } },
        { $project: { _id: 0, type: "$_id", items: { $slice: ["$items", 5] } } }
      ]).exec();
      return res.json(agg);
    }

    const list = await Content.find({}).sort({ id: 1 }).lean();
    // attach cached tmdbRating if available, and start background fetches for missing ratings
    const missing = [];
    const out = list.map(doc => {
      const copy = Object.assign({}, doc);
      if (doc.tmdbRating !== undefined && doc.tmdbRating !== null) {
        copy.tmdb = { id: doc.tmdbId, rating: doc.tmdbRating, votes: doc.tmdbVoteCount };
      } else {
        copy.tmdb = null;
        missing.push(copy);
      }
      return copy;
    });
    // background fill missing ratings (no await)
    (async () => {
      for (const d of missing) {
        try { await ensureTmdbRating(d); } catch (e) { /* ignore */ }
      }
    })();
    res.json(out);
  } catch (e) { next(e); }
};

// GET /api/content/random
exports.getRandomContent = async (_req, res, next) => {
  try {
    // try true random first
    const [doc] = await Content.aggregate([{ $sample: { size: 1 } }]);
    if (doc) return res.json(doc);

    // fallback if sample finds none (e.g. empty collection or wrong name)
    const first = await Content.findOne({}).sort({ id: 1 }).lean();
    if (first) return res.json(first);

    // truly empty DB
    return res.status(404).json({ error: "No content" });
  } catch (e) { next(e); }
};


// GET /api/content/:id
exports.getContentById = async (req, res, next) => {
  try {
    let item = await Content.findOne({ id: Number(req.params.id) }).lean();
    if (!item) return res.status(404).json({ error: "Not found" });
    // ensure rating (synchronously for single item)
    const tm = await ensureTmdbRating(item);
    if (tm) item = Object.assign({}, item, { tmdb: { id: tm.tmdbId, rating: tm.rating, votes: tm.votes } });
    else item = Object.assign({}, item, { tmdb: item.tmdbRating ? { id: item.tmdbId, rating: item.tmdbRating, votes: item.tmdbVoteCount } : null });
    res.json(item);
  } catch (e) { next(e); }
};

// POST /api/content/:id/like
exports.likeContent = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const profileId = Number(req.body.profileId || req.query.profileId || 0);

    const content = await Content.findOneAndUpdate(
      { id }, { $inc: { numberOfLikes: 1 } }, { new: true }
    ).lean();
    if (!content) return res.status(404).json({ error: "Not found" });

    if (profileId) {
      await Profile.updateOne({ id: profileId }, { $addToSet: { liked: id } });
    }
    res.json({ ok: true, content });
  } catch (e) { next(e); }
};

// POST /api/content/:id/unlike
exports.unlikeContent = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const profileId = Number(req.body.profileId || req.query.profileId || 0);

    const content = await Content.findOneAndUpdate(
      { id, numberOfLikes: { $gt: 0 } }, { $inc: { numberOfLikes: -1 } }, { new: true }
    ).lean();
    if (!content) return res.status(404).json({ error: "Not found" });

    if (profileId) {
      await Profile.updateOne({ id: profileId }, { $pull: { liked: id } });
    }
    res.json({ ok: true, content });
  } catch (e) { next(e); }
};
