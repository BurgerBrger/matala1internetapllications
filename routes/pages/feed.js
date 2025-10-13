const express = require("express");
const router = express.Router();
const { render } = require("../../controllers/feed");

router.get("/", render);

module.exports = router;