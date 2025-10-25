// middleware/avatarUpload.js
const path = require("path");
const multer = require("multer");
const { v4: uuid } = require("uuid");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, path.join(__dirname, "..", "public", "images", "profile"));
  },
  filename: (req, file, cb) => {
    cb(null, `${uuid()}${path.extname(file.originalname).toLowerCase()}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

module.exports = function avatarUpload(req, res, next) {
  // the form/input field name must be "image"
  const single = upload.single("image");
  single(req, res, (err) => {
    if (err) return next(err);
    if (req.file) {
      // this is what controllers/profiles.updateImage reads
      req.file.webPath = `/images/profile/${req.file.filename}`;
    }
    next();
  });
};
