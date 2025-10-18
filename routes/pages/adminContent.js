// routes/pages/adminContent.js
const express = require("express");
const router = express.Router();
const methodOverride = require("method-override");
const {
  uploadFields,
  listPage,
  newPage,
  editPage,
  createItem,
  updateItem,
  deleteItem,
} = require("../../controllers/adminContent");

// Allow ?_method=PUT / ?_method=DELETE from HTML forms
router.use(methodOverride("_method"));

router.get("/", listPage);
router.get("/new", newPage);
router.get("/:id/edit", editPage);

router.post("/", uploadFields, createItem);
router.put("/:id", uploadFields, updateItem);
router.delete("/:id", deleteItem);

module.exports = router;
