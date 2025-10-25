// controllers/content.js
const Content = require("../models/mongo/Content");
const Profile = require("../models/mongo/Profile");

// GET /api/content
exports.getAllContents = async (req, res, next) => {
  try {
    const list = await Content.find({}).sort({ id: 1 }).lean();
    res.json(list);
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
    const item = await Content.findOne({ id: Number(req.params.id) }).lean();
    if (!item) return res.status(404).json({ error: "Not found" });
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
