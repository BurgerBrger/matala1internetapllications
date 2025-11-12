// controllers/stats.js
const Profile = require("../models/mongo/Profile");


function lastNDays(n) {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
    const label = d.toLocaleDateString("he-IL", {
      day: "2-digit",
      month: "2-digit",
    });
    days.push({ key, label });
  }
  return days;
}

/**
 * LEFT GRAPH:
 * GET /api/stats/time-watched?profileId=123
 * → time watched per day (minutes) for last 14 days
 */
exports.timeWatched = async (req, res, next) => {
  try {
    const profileId = Number(req.query.profileId || 0);
    if (!profileId) {
      return res.status(400).json({ labels: [], data: [] });
    }

    const profile = await Profile.findOne({ id: profileId }).lean();
    if (!profile) {
      return res.json({ labels: [], data: [] });
    }

    const progress = Array.isArray(profile.watchProgress)
      ? profile.watchProgress
      : [];

    if (!progress.length) {
      return res.json({ labels: [], data: [] });
    }

    // Setup buckets for last 14 days
    const days = lastNDays(14);
    const buckets = {};
    days.forEach((d) => {
      buckets[d.key] = 0; // seconds
    });

    const oldestKey = days[0].key;
    const oldestDate = new Date(oldestKey);
    oldestDate.setHours(0, 0, 0, 0);

    // Sum watch time (seconds) per day within the last 14 days
    for (const item of progress) {
      if (!item.updatedAt) continue;
      const d = new Date(item.updatedAt);
      if (d < oldestDate) continue;

      d.setHours(0, 0, 0, 0);
      const key = d.toISOString().slice(0, 10);

      if (!(key in buckets)) continue;

      const seconds = Number(item.position || item.duration || 0);
      if (!seconds || seconds < 0) continue;

      buckets[key] += seconds;
    }

    const labels = [];
    const data = [];

    days.forEach((d) => {
      labels.push(d.label);
      const secs = buckets[d.key] || 0;
      data.push(Math.round(secs / 60)); // minutes
    });

    res.json({ labels, data });
  } catch (err) {
    next(err);
  }
};

/**
 * RIGHT GRAPH (you already have / will have this):
 * GET /api/stats/liked-genres?profileId=123
 * → genre distribution from profile.liked + Content.genre
 */
const Content = require("../models/mongo/Content");

exports.likedGenres = async (req, res, next) => {
  try {
    const profileId = Number(req.query.profileId || 0);
    if (!profileId) {
      return res.status(400).json({ labels: [], data: [] });
    }

    const profile = await Profile.findOne({ id: profileId }).lean();
    if (!profile) {
      return res.json({ labels: [], data: [] });
    }

    const likedIds = Array.isArray(profile.liked) ? profile.liked : [];
    if (!likedIds.length) {
      return res.json({ labels: [], data: [] });
    }

    const contents = await Content.find(
      { id: { $in: likedIds } },
      { id: 1, genre: 1 }
    ).lean();

    const counts = {};
    contents.forEach((c) => {
      (c.genre || []).forEach((g) => {
        if (!g) return;
        counts[g] = (counts[g] || 0) + 1;
      });
    });

    const labels = Object.keys(counts);
    const data = labels.map((g) => counts[g]);

    res.json({ labels, data });
  } catch (err) {
    next(err);
  }
};
