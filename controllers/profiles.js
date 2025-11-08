// controllers/profiles.js

const fs = require("fs");
const path = require("path");

const Profile = require("../models/mongo/Profile");
const User = require("../models/mongo/users");

// list - return only profiles visible to the logged-in user
exports.list = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
    const user = await User.findById(req.session.userId).lean();
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    let filter = {};
    if (user.usernumber === 0) {
      filter = {};
    } else if (typeof user.usernumber === 'number') {
      filter = { usernumber: user.usernumber };
    } else {
      return res.json([]);
    }

    const docs = await Profile.find(filter).sort({ id: 1 }).lean();
    res.json(docs);
  }
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
    if (!req.session || !req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
    const user = await User.findById(req.session.userId).lean();
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const last = await Profile.findOne().sort({ id: -1 }).lean();
    const nextId = last ? last.id + 1 : 1;
    const p = await Profile.create({
      id: nextId,
      name: (req.body?.name || "New Profile").trim() || "New Profile",
      image: "/images/profile/default.jpg",
      liked: [], watched: [], topGenres: [],
      usernumber: user.usernumber || 0
    });
    res.status(201).json(p.toObject());
  } catch (e) { next(e); }
};

// update (name / image)
exports.update = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
    const user = await User.findById(req.session.userId).lean();
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const id = Number(req.params.id);
    const existing = await Profile.findOne({ id }).lean();
    if (!existing) return res.status(404).json({ error: 'Not found' });
    // only admin or owner can modify
    if (user.usernumber !== 0 && existing.usernumber !== user.usernumber) return res.status(403).json({ error: 'Forbidden' });

    const patch = {};
    if (req.body?.name  !== undefined) patch.name  = req.body.name;
    if (req.body?.image !== undefined) patch.image = req.body.image;
    const p = await Profile.findOneAndUpdate({ id }, patch, { new: true }).lean();
    res.json(p);
  } catch (e) { next(e); }
};

// delete
exports.remove = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
    const user = await User.findById(req.session.userId).lean();
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const id = Number(req.params.id);
    const existing = await Profile.findOne({ id }).lean();
    if (!existing) return res.status(404).json({ error: 'Not found' });
    if (user.usernumber !== 0 && existing.usernumber !== user.usernumber) return res.status(403).json({ error: 'Forbidden' });

    const out = await Profile.findOneAndDelete({ id }).lean();
    res.json({ ok: true });
  } catch (e) { next(e); }
};

// avatar upload (keep your existing multer middleware)
exports.uploadAvatar = require("../middleware/avatarUpload"); // if you have it
exports.updateImage = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
    const user = await User.findById(req.session.userId).lean();
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const id = Number(req.params.id);
    const existing = await Profile.findOne({ id }).lean();
    if (!existing) return res.status(404).json({ error: 'Not found' });
    if (user.usernumber !== 0 && existing.usernumber !== user.usernumber) return res.status(403).json({ error: 'Forbidden' });

    const p = await Profile.findOneAndUpdate(
      { id }, { image: req.file?.webPath || req.body.image }, { new: true }
    ).lean();
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
