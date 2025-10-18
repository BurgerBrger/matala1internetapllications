const express = require("express");
const router = express.Router();

const {
  getAllContents,
  getContentById,
  getRandomContent,
  likeContent,
  unlikeContent,
} = require("../../controllers/content");

router.get("/", getAllContents);
router.get("/random", getRandomContent);
router.get("/:id", getContentById);

// like/unlike
router.post("/:id/like", likeContent);
router.post("/:id/unlike", unlikeContent);

module.exports = router;
