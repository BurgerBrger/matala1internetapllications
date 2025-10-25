// routes/pages/profilepage.js
const router = require("express").Router();
const c = require("../../controllers/profilepage");
router.get("/", c.render);   // GET /profile -> page
module.exports = router;
