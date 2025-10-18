// controllers/adminContent.js
const path = require("path");
const { v4: uuid } = require("uuid");
const multer = require("multer");
const { content, saveAll, nextId } = require("../models/contentStore");
// ...push/remove/edit items in `content`...
// call saveAll() after changes


// ----- Multer storage & filter -----
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isImage = file.mimetype.startsWith("image/");   // <-- was "images/"
    const isVideo = file.mimetype === "video/mp4";

    if (isImage) {
      // pick subfolder by field name
      const sub = file.fieldname === "wideimage" ? "wide" : "card";
      cb(null, path.join(__dirname, "..", "public", "images", sub));
    } else if (isVideo) {
      cb(null, path.join(__dirname, "..", "public", "videos"));
    } else {
      cb(new Error("Only images or MP4 videos are allowed"), null);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    cb(null, uuid() + ext.toLowerCase());
  },
});


function fileFilter(req, file, cb) {
  const ok = file.mimetype.startsWith("image/") || file.mimetype === "video/mp4";
  cb(ok ? null : new Error("Only images or MP4 videos are allowed"), ok);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max per file; adjust as needed
  },
});

// Expose middleware to routes
const uploadFields = upload.fields([
  { name: "poster", maxCount: 1 },     // single poster image
  { name: "wideimage", maxCount: 1 },  // single wide image for hero
  { name: "trailer", maxCount: 1 },    // optional MP4
]);

// ----- Pages -----
function listPage(req, res) {
  res.render("admin/list", { items: content });
}

function newPage(req, res) {
  res.render("admin/form", { item: null });
}

function editPage(req, res) {
  const id = Number(req.params.id);
  const item = content.find(c => Number(c.id) === id);
  if (!item) return res.status(404).send("Not found");
  res.render("admin/form", { item });
}

// ----- Actions -----
function createItem(req, res) {
  const { name, year, type, genres, numberOfLikes } = req.body;
  const id = nextId();

  // Build images/videos URLs if files uploaded
  const poster = req.files?.poster?.[0];
  const wide = req.files?.wideimage?.[0];
  const trailer = req.files?.trailer?.[0];

  const newItem = {
    id,
    name: (name || "").trim(),
    year: Number(year) || null,
    type: (type || "movie").toLowerCase(), // movie | tv
    genre: (genres || "")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean),
    numberOfLikes: Number(numberOfLikes || 0),
    image: poster ? `/images/card/${poster.filename}` : "",
    wideimage: wide ? `/images/wide/${wide.filename}` : "",
    trailer: trailer ? `/videos/${trailer.filename}` : "",
  };

  content.push(newItem);
  saveAll();

  res.redirect("/admin/content");
}

function updateItem(req, res) {
  const id = Number(req.params.id);
  const idx = content.findIndex(c => Number(c.id) === id);
  if (idx === -1) return res.status(404).send("Not found");

  const item = content[idx];
  const { name, year, type, genres, numberOfLikes } = req.body;

  // Keep existing values if not provided
  item.name = name?.trim() || item.name;
  item.year = year ? Number(year) : item.year;
  item.type = type ? type.toLowerCase() : item.type;
  item.genre = genres
    ? genres.split(",").map(s => s.trim()).filter(Boolean)
    : item.genre;
  item.numberOfLikes = numberOfLikes ? Number(numberOfLikes) : item.numberOfLikes;

  // Replacements if new files uploaded
  const poster = req.files?.poster?.[0];
  const wide = req.files?.wideimage?.[0];
  const trailer = req.files?.trailer?.[0];

  if (poster) item.image = `/images/card/${poster.filename}`;
  if (wide) item.wideimage = `/images/wide/${wide.filename}`;
  if (trailer) item.trailer = `/videos/${trailer.filename}`;

  content[idx] = item;
  saveAll();

  res.redirect("/admin/content");
}

function deleteItem(req, res) {
  const id = Number(req.params.id);
  const idx = content.findIndex(c => Number(c.id) === id);
  if (idx === -1) return res.status(404).send("Not found");
  content.splice(idx, 1);
  saveAll();
  res.redirect("/admin/content");
}

module.exports = {
  uploadFields,
  listPage,
  newPage,
  editPage,
  createItem,
  updateItem,
  deleteItem,
};
