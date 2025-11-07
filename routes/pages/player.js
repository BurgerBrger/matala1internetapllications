const router = require("express").Router();
const player = require("../../controllers/player"); // path may be ../.. depending on your tree

router.get("/:id", player.render);

module.exports = router;
