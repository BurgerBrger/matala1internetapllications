// routes/api/watch.js
const router = require("express").Router();
const w = require("../../controllers/watch");

// all saved episodes for one profile + title
router.get("/:profileId/content/:contentId", w.getForContent);

// upsert progress of one movie/episode
router.post("/", w.saveProgress);

module.exports = router;
