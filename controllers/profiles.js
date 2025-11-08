// controllers/profiles.js

const fs = require("fs");
const path = require("path");

const Profile = require("../models/mongo/Profile");
const User = require("../models/mongo/users");

// list - return only profiles visible to the logged-in user
exports.list = async (req, res, next) => {
  try {
    // DEBUG: log basic session info to help debug which user is requesting profiles
    try {
      const dbgSession = { hasSession: !!req.session, userId: req.session?.userId, userEmail: req.session?.userEmail, usernumber: req.session?.usernumber };
      console.log('DEBUG GET /api/profiles - session:', dbgSession);
    } catch (e) { console.error('DEBUG session read error', e); }

    if (!req.session || !req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
    const user = await User.findById(req.session.userId).lean();
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    // New ownership model: user document stores an array `profiles` with numeric profile ids
    let filter = {};
    if (Array.isArray(user.profiles) && user.profiles.length > 0) {
      filter = { id: { $in: user.profiles } };
    } else {
      // nothing to show for this user
      console.log('DEBUG GET /api/profiles - user has no profiles array or it is empty');
      return res.json([]);
    }

    console.log('DEBUG GET /api/profiles - computed filter (by ids):', JSON.stringify(filter));

    const docs = await Profile.find(filter).sort({ id: 1 }).lean();
    console.log('DEBUG GET /api/profiles - returning', Array.isArray(docs) ? docs.length : 0, 'profiles');
    res.json(docs);
  }
  catch (e) { next(e); }
};

// get
exports.get = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
    const user = await User.findById(req.session.userId).lean();
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const id = Number(req.params.id);
    const p = await Profile.findOne({ id }).lean();
    if (!p) return res.status(404).json({ error: "Not found" });

  // allow if the profile id is in user's profiles array or the user is admin
  const isAdmin = user.email === 'admin@example.com' || user.usernumber === 3;
  const userProfileIds = Array.isArray(user.profiles) ? user.profiles.map(p => Number(p)) : [];
  if (!isAdmin && !userProfileIds.includes(id)) return res.status(403).json({ error: 'Forbidden' });
    res.json(p);
  } catch (e) { next(e); }
};

// create
exports.create = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const last = await Profile.findOne().sort({ id: -1 }).lean();
    const nextId = last ? last.id + 1 : 1;
    const p = await Profile.create({
      id: nextId,
      name: (req.body?.name || "New Profile").trim() || "New Profile",
      image: "/images/profile/default.jpg",
      liked: [], watched: [], topGenres: [],
      // legacy field preserved
      usernumber: user.usernumber || 0
    });
    // add new profile id to the creating user's profiles array
    await User.findByIdAndUpdate(user._id, { $addToSet: { profiles: nextId } });
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
    // only admin or owner (owner if user's profiles array includes the profile id)
  const isAdmin = user.email === 'admin@example.com' || user.usernumber === 3;
  const userProfileIds = Array.isArray(user.profiles) ? user.profiles.map(p => Number(p)) : [];
  if (!isAdmin && !userProfileIds.includes(id)) return res.status(403).json({ error: 'Forbidden' });

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
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const id = Number(req.params.id);
    const existing = await Profile.findOne({ id }).lean();
    if (!existing) return res.status(404).json({ error: 'Not found' });
  const isAdmin = user.email === 'admin@example.com' || user.usernumber === 3;
  const userProfileIds = Array.isArray(user.profiles) ? user.profiles.map(p => Number(p)) : [];
  if (!isAdmin && !userProfileIds.includes(id)) return res.status(403).json({ error: 'Forbidden' });

    const out = await Profile.findOneAndDelete({ id }).lean();
    // remove the id from the user's profiles array
    await User.findByIdAndUpdate(user._id, { $pull: { profiles: id } });
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
    const isAdmin = user.email === 'admin@example.com' || user.usernumber === 3;
    if (!isAdmin && !(Array.isArray(user.profiles) && user.profiles.includes(id))) return res.status(403).json({ error: 'Forbidden' });

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
