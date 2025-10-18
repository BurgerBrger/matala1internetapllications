const express = require("express");
const router = express.Router();
const { render } = require("../../controllers/profilepage");

router.get("/", render);

module.exports = router;
