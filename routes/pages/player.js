const router = require("express").Router();
const controller = require("../../controllers/player");
router.get("/:id", controller.render);
module.exports = router;
