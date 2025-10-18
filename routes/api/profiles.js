const express = require("express");
const router = express.Router();

const {
  uploadAvatar,
  list,
  get,
  create,
  update,
  remove,
  updateImage,
  listAvatars,
} = require("../../controllers/profiles");

// Order matters: put /avatars BEFORE /:id
router.get("/", list);
router.get("/avatars", listAvatars);     // <-- move above
router.get("/:id", get);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);

// upload avatar (multipart/form-data, input name="image")
router.put("/:id/image", uploadAvatar, updateImage);

module.exports = router;
