const express = require("express");
const router = express.Router();
const { render } = require("../../controllers/signin");

router.get("/", render);

module.exports = router;
