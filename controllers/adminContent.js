// controllers/adminContent.js  (Mongo version)
const path = require("path");
const { v4: uuid } = require("uuid");
const multer = require("multer");
const Content = require("../models/mongo/Content");

// ---------- uploads (poster/wide image/video) ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isImage = file.mimetype.startsWith("image/");
    const isVideo = file.mimetype === "video/mp4";
    if (isImage) {
      const sub = file.fieldname === "wideimage" ? "wide" : "card";
      cb(null, path.join(process.cwd(), "public", "images", sub));
    } else if (isVideo) {
      cb(null, path.join(process.cwd(), "public", "videos"));
    } else {
      cb(new Error("Only images or MP4 videos are allowed"));
    }
  },
  filename: (req, file, cb) => {
    cb(null, `${uuid()}${path.extname(file.originalname).toLowerCase()}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// expose one middleware that matches your form field names
const uploadFields = upload.fields([
  { name: "poster",    maxCount: 1 }, // goes to /public/images/card
  { name: "wideimage", maxCount: 1 }, // goes to /public/images/wide
  { name: "trailer",   maxCount: 1 }  // goes to /public/videos
]);

// ---------- helpers ----------
async function nextId() {
  const last = await Content.findOne().sort({ id: -1 }).lean();
  return last ? last.id + 1 : 1;
}
function splitGenres(str = "") {
  return String(str)
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}

// ---------- page renderers ----------
async function listPage(_req, res, next) {
  try {
    const items = await Content.find({}).sort({ id: 1 }).lean();
    res.render("admin/list", { items });
  } catch (e) { next(e); }
}
function newPage(_req, res) {
  res.render("admin/form", { item: null });
}
async function editPage(req, res, next) {
  try {
    const item = await Content.findOne({ id: Number(req.params.id) }).lean();
    if (!item) return res.status(404).send("Not found");
    res.render("admin/form", { item });
  } catch (e) { next(e); }
}

// ---------- actions ----------
async function createItem(req, res, next) {
  try {
    const id = await nextId();
    const { name, year, type, genres, numberOfLikes } = req.body;

    const poster  = req.files?.poster?.[0];
    const wide    = req.files?.wideimage?.[0];
    const trailer = req.files?.trailer?.[0];

    await Content.create({
      id,
      name: (name || "").trim(),
      year: year ? Number(year) : null,
      type: (type || "movie").toLowerCase(),
      genre: splitGenres(genres),
      numberOfLikes: Number(numberOfLikes || 0),
      image:     poster  ? `/images/card/${poster.filename}` : "",
      wideimage: wide    ? `/images/wide/${wide.filename}` : "",
      video:     trailer ? `/videos/${trailer.filename}`   : ""
    });

    res.redirect("/admin/content");
  } catch (e) { next(e); }
}

async function updateItem(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { name, year, type, genres, numberOfLikes } = req.body;

    const patch = {};
    if (name !== undefined)          patch.name = String(name).trim();
    if (year !== undefined)          patch.year = year ? Number(year) : null;
    if (type !== undefined)          patch.type = String(type).toLowerCase();
    if (genres !== undefined)        patch.genre = splitGenres(genres);
    if (numberOfLikes !== undefined) patch.numberOfLikes = Number(numberOfLikes);

    const poster  = req.files?.poster?.[0];
    const wide    = req.files?.wideimage?.[0];
    const trailer = req.files?.trailer?.[0];
    if (poster)  patch.image     = `/images/card/${poster.filename}`;
    if (wide)    patch.wideimage = `/images/wide/${wide.filename}`;
    if (trailer) patch.video     = `/videos/${trailer.filename}`;

    const updated = await Content.findOneAndUpdate({ id }, patch, { new: true });
    if (!updated) return res.status(404).send("Not found");

    res.redirect("/admin/content");
  } catch (e) { next(e); }
}

async function deleteItem(req, res, next) {
  try {
    const id = Number(req.params.id);
    const deleted = await Content.findOneAndDelete({ id });
    if (!deleted) return res.status(404).send("Not found");
    res.redirect("/admin/content");
  } catch (e) { next(e); }
}

module.exports = {
  // middleware
  uploadFields,
  // pages
  listPage,
  newPage,
  editPage,
  // actions
  createItem,
  deleteItem,
  updateItem
};
