// routes/api/stats.js
const router = require("express").Router();
const s = require("../../controllers/stats");

// LEFT graph: time watched (last 14 days)
router.get("/time-watched", s.timeWatched);

// RIGHT graph: liked genres
router.get("/liked-genres", s.likedGenres);

module.exports = router;
