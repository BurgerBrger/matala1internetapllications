const { movies } = require("../models/movies");

function getAllMovies(req, res) {
  res.json(movies);
}

function getMovieById(req, res) {
  const id = Number(req.params.id);
  const m = movies.find(x => x.id === id);
  if (!m) return res.status(404).json({ error: "Movie not found" });
  res.json(m);
}

function getRandomMovie(req, res) {
  const m = movies[Math.floor(Math.random() * movies.length)];
  res.json(m);
}

module.exports = { getAllMovies, getMovieById, getRandomMovie };
