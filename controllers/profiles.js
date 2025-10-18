const path = require("path");
const multer = require("multer");
const { v4: uuid } = require("uuid");
const { profiles, saveAll, nextId } = require("../models/profilesStore");

const fs = require("fs");

// ---- uploads: /public/images/profile ----
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) return cb(new Error("Only images"), null);
    cb(null, path.join(__dirname, "..", "public", "images", "profile"));
  },
  filename: (req, file, cb) => cb(null, uuid() + path.extname(file.originalname).toLowerCase()),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
const uploadAvatar = upload.single("image"); // <input name="image">

// ---- helpers ----
function findIndex(id) {
  return profiles.findIndex(p => Number(p.id) === Number(id));
}

// ---- CRUD ----
function list(req, res) {
  res.json(profiles);
}

function get(req, res) {
  const i = findIndex(req.params.id);
  if (i === -1) return res.status(404).json({ error: "Profile not found" });
  res.json(profiles[i]);
}

function create(req, res) {
  const { name } = req.body;
  const p = {
    id: nextId(),
    name: (name || "").trim() || "New Profile",
    image: "/images/profile/default.avif",               // filled by upload if provided
    watched: [],             // content IDs the user watched
    liked: [],               // content IDs the user liked
    topGenres: [],           // 2 genres computed or edited
  };
  profiles.push(p);
  saveAll();
  res.status(201).json(p);
}

// controllers/profiles.js
function update(req, res) {
  const i = findIndex(req.params.id);
  if (i === -1) return res.status(404).json({ error: "Profile not found" });

  const { name, watched, liked, topGenres, image } = req.body; // <-- add image
  const p = profiles[i];

  if (name !== undefined) p.name = String(name).trim();
  if (watched !== undefined) p.watched = Array.isArray(watched) ? watched : p.watched;
  if (liked !== undefined) p.liked = Array.isArray(liked) ? liked : p.liked;
  if (topGenres !== undefined) p.topGenres = Array.isArray(topGenres) ? topGenres.slice(0, 2) : p.topGenres;

  // allow selecting from the library (no upload)
  if (typeof image === "string" && image.startsWith("/images/profile/")) {
    p.image = image;
  }

  profiles[i] = p; saveAll();
  res.json(p);
}

function remove(req, res) {
  const i = findIndex(req.params.id);
  if (i === -1) return res.status(404).json({ error: "Profile not found" });
  const deleted = profiles.splice(i, 1)[0];
  saveAll();
  res.json({ ok: true, deleted });
}

// ---- avatar upload (PUT /:id/image) ----
function updateImage(req, res) {
  const i = findIndex(req.params.id);
  if (i === -1) return res.status(404).json({ error: "Profile not found" });
  // multer populated req.file
  if (!req.file) return res.status(400).json({ error: "No image uploaded" });
  profiles[i].image = `/images/profile/${req.file.filename}`;
  saveAll();
  res.json(profiles[i]);
}

function listAvatars(req, res) {
  const dir = path.join(__dirname, "..", "public", "images", "profile");
  fs.readdir(dir, (err, files) => {
    if (err) return res.status(500).json({ error: "Failed to read avatar folder" });
    const allowed = new Set([".jpg", ".jpeg", ".png", ".webp"]);
    const urls = files
      .filter(f => allowed.has(path.extname(f).toLowerCase()))
      .map(f => `/images/profile/${f}`);
    res.json(urls);
  });
}

module.exports = {
  uploadAvatar,
  list, get, create, update, remove, updateImage,
  listAvatars, // <-- export it
};
