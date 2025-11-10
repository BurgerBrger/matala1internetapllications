// controllers/stats.js
const Profile = require('../models/mongo/Profile');
const Content = require('../models/mongo/Content');

// GET /api/stats/daily-views?days=14
// Counts completed watch events per day over the last N days (movies or episodes)
exports.dailyViews = async (req, res, next) => {
  try {
    const days = Math.max(1, Math.min(90, Number(req.query.days) || 14));
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Prefer ViewEvent collection if present (more accurate event stream)
    const mongoose = require('mongoose');
    let rows;
    if (mongoose.models.ViewEvent) {
      rows = await mongoose.models.ViewEvent.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "UTC" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);
    } else {
      // Fallback: derive from Profile.watchProgress completions
      rows = await Profile.aggregate([
        { $unwind: "$watchProgress" },
        { $match: { "watchProgress.completed": true, "watchProgress.updatedAt": { $gte: since } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$watchProgress.updatedAt", timezone: "UTC" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);
    }

    res.json({ days, data: (rows || []).map(r => ({ date: r._id, count: r.count })) });
  } catch (e) { next(e); }
};

// GET /api/stats/popular-genres?limit=10
// Aggregates total likes per movie genre across all Content documents
exports.popularGenres = async (req, res, next) => {
  try {
    const limit = Math.max(1, Math.min(20, Number(req.query.limit) || 10));
    const rows = await Content.aggregate([
      { $match: { type: 'movie' } },
      { $unwind: "$genre" },
      {
        $group: {
          _id: "$genre",
          likes: { $sum: { $ifNull: ["$numberOfLikes", { $ifNull: ["$numberoflikes", 0] }] } },
          count: { $sum: 1 }
        }
      },
      { $sort: { likes: -1 } },
      { $limit: limit }
    ]);

    res.json({ data: rows.map(r => ({ genre: r._id, likes: r.likes, titles: r.count })) });
  } catch (e) { next(e); }
};
