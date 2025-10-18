const express = require("express");
const router = express.Router();
const controller = require("../../controllers/feed");
router.get("/", controller.render);
module.exports = router;
