// controllers/watch.js
const Profile = require("../models/mongo/Profile");
const Content = require("../models/mongo/Content");

// GET /api/watch/:profileId/content/:contentId
// returns all progress rows for this profile + title
exports.getForContent = async (req, res, next) => {
  try {
    const profileId = Number(req.params.profileId);
    const contentId = Number(req.params.contentId);
    if (!profileId || !contentId) return res.json([]);

    const profile = await Profile.findOne({ id: profileId }).lean();
    if (!profile || !Array.isArray(profile.watchProgress)) return res.json([]);

    const rows = profile.watchProgress.filter(
      w => Number(w.contentId) === contentId
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
};

// POST /api/watch
// upsert a single movie/episode progress row inside Profile.watchProgress
exports.saveProgress = async (req, res, next) => {
  try {
    const {
      profileId,
      contentId,
      episodeIndex = 0,
      position = 0,
      duration = 0,
      completed = false
    } = req.body || {};

    const pid = Number(profileId);
    const cid = Number(contentId);
    const epIdx = Number(episodeIndex) || 0;

    if (!pid || !cid) {
      return res.status(400).json({ error: "profileId and contentId are required" });
    }

    const profile = await Profile.findOne({ id: pid });
    if (!profile) return res.status(404).json({ error: "Profile not found" });

    if (!Array.isArray(profile.watchProgress)) {
      profile.watchProgress = [];
    }

    let row = profile.watchProgress.find(
      w => Number(w.contentId) === cid && Number(w.episodeIndex) === epIdx
    );

    if (!row) {
      row = {
        contentId: cid,
        episodeIndex: epIdx,
        position,
        duration,
        completed: !!completed,
        updatedAt: new Date()
      };
      profile.watchProgress.push(row);
    } else {
      row.position = position;
      row.duration = duration;
      row.completed = !!completed;
      row.updatedAt = new Date();
    }

    // if completed, also maintain watched/topGenres arrays
    if (completed) {
      const content = await Content.findOne({ id: cid }).lean();
      if (content) {
        if (!profile.watched.includes(cid)) {
          profile.watched.push(cid);
        }
        if (Array.isArray(content.genre)) {
          content.genre.forEach(g => {
            if (!profile.topGenres.includes(g)) {
              profile.topGenres.push(g);
            }
          });
        }
      }
    }

    await profile.save();

    const latest = profile.watchProgress.find(
      w => Number(w.contentId) === cid && Number(w.episodeIndex) === epIdx
    );
    res.json(latest);
  } catch (e) {
    next(e);
  }
};
