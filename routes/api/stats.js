// routes/api/stats.js
const router = require('express').Router();
const s = require('../../controllers/stats');

router.get('/daily-views', s.dailyViews);
router.get('/popular-genres', s.popularGenres);

module.exports = router;