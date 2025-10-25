const router = require("express").Router();
const admin = require("../../controllers/adminContent");

// list & form pages
router.get("/", admin.listPage);
router.get("/new", admin.newPage);
router.get("/:id/edit", admin.editPage);

// create / update / delete (with uploads where relevant)
router.post("/", admin.uploadFields, admin.createItem);
router.post("/:id", admin.uploadFields, admin.updateItem);
router.post("/:id/delete", admin.deleteItem);

module.exports = router;
