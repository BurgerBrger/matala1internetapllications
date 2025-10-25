const router = require("express").Router();
const c = require("../../controllers/signin");
router.get("/", c.render);
module.exports = router;
