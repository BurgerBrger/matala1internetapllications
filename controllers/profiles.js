// controllers/profiles.js

const fs = require("fs");
const path = require("path");

const Profile = require("../models/mongo/Profile");

// list
exports.list = async (_req, res, next) => {
  try { res.json(await Profile.find({}).sort({ id: 1 }).lean()); }
  catch (e) { next(e); }
};

// get
exports.get = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const p = await Profile.findOne({ id }).lean();
    if (!p) return res.status(404).json({ error: "Not found" });
    res.json(p);
  } catch (e) { next(e); }
};

// create
exports.create = async (req, res, next) => {
  try {
    const last = await Profile.findOne().sort({ id: -1 }).lean();
    const nextId = last ? last.id + 1 : 1;
    const p = await Profile.create({
      id: nextId,
      name: (req.body?.name || "New Profile").trim() || "New Profile",
      image: "/images/profile/default.jpg",
      liked: [], watched: [], topGenres: []
    });
    res.status(201).json(p.toObject());
  } catch (e) { next(e); }
};

// update (name / image)
exports.update = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const patch = {};
    if (req.body?.name  !== undefined) patch.name  = req.body.name;
    if (req.body?.image !== undefined) patch.image = req.body.image;
    const p = await Profile.findOneAndUpdate({ id }, patch, { new: true }).lean();
    if (!p) return res.status(404).json({ error: "Not found" });
    res.json(p);
  } catch (e) { next(e); }
};

// delete
exports.remove = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const out = await Profile.findOneAndDelete({ id }).lean();
    if (!out) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) { next(e); }
};

// avatar upload (keep your existing multer middleware)
exports.uploadAvatar = require("../middleware/avatarUpload"); // if you have it
exports.updateImage = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const p = await Profile.findOneAndUpdate(
      { id }, { image: req.file?.webPath || req.body.image }, { new: true }
    ).lean();
    if (!p) return res.status(404).json({ error: "Not found" });
    res.json(p);
  } catch (e) { next(e); }
};

// ensure there is an admin/profile with id 0 (used at app startup)
exports.ensureAdminProfile = async () => {
  try {
    const existing = await Profile.findOne({ id: 0 }).lean();
    if (!existing) {
      await Profile.create({ id: 0, name: 'Admin', image: '/images/profile/default.avif', liked: [], watched: [], topGenres: [] });
    }
  } catch (e) {
    // rethrow so caller can log
    throw e;
  }
};

exports.avatarLibrary = (req, res, next) => {
  try {
    const dir = path.join(process.cwd(), "public", "images", "profile");
    const urls = fs.readdirSync(dir)
      .filter(n => /\.(png|jpe?g|webp|avif|gif|svg)$/i.test(n))
      .sort()
      .map(n => `/images/profile/${n}`);
    res.json(urls);
  } catch (e) { next(e); }
};
