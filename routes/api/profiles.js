const router = require("express").Router();
const p = require("../../controllers/profiles");

router.get("/", p.list);
router.get("/:id", p.get);
router.post("/", p.create);
router.put("/:id", p.update);
router.delete("/:id", p.remove);

// upload avatar (multipart/form-data with field "image")
router.put("/:id/image", p.uploadAvatar, p.updateImage);

module.exports = router;
