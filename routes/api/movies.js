
const express = require("express");
const router = express.Router();
const { getAllMovies, getMovieById, getRandomMovie } = require("../../controllers/movies");

router.get("/", getAllMovies);
router.get("/random", getRandomMovie);
router.get("/:id", getMovieById);

module.exports = router;
