const express = require("express");
const router = express.Router();
const controller = require("../../controllers/player");

router.get("/:id", controller.render);

module.exports = router;

