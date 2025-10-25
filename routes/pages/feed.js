const router = require("express").Router();
const controller = require("../../controllers/feed");
router.get("/", controller.render);
module.exports = router;
