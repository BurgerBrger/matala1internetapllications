const router = require("express").Router();
const c = require("../../controllers/content");

router.get("/",       c.getAllContents);
router.get("/random", c.getRandomContent); // must be above :id
router.get("/:id",    c.getContentById);

router.post("/:id/like",   c.likeContent);
router.post("/:id/unlike", c.unlikeContent);

module.exports = router;
