const { movies } = require("../models/movies");

function render(req, res) {
  // 'movies' comes from models/movies.js
  // 'feed' corresponds to views/feed.ejs
  res.render("feed", { feeds: movies });
}

function createMovie(req, res) {
  const newMovie = { ...req.body, id: movies.length + 1 };
  movies.push(newMovie);
  res.json(newMovie);
}

function getAllMovies(req, res) {
  res.json(movies);
}

function getMovieById(req, res) {
  const id = Number(req.params.id);
  const selectedMovie = movies.find((m) => m.id === id);
  if (!selectedMovie) return res.status(404).json({ error: "Movie not found" });
  res.json(selectedMovie);
}

function updateMovieById(req, res) {
  const id = Number(req.params.id);
  const i = movies.findIndex((m) => m.id === id);
  if (i === -1) return res.status(404).json({ error: "Movie not found" });

  const { title, content, author, image } = req.body;
  movies[i] = {
    ...movies[i],
    ...(title !== undefined && { title }),
    ...(content !== undefined && { content }),
    ...(author !== undefined && { author }),
    ...(image !== undefined && { image }),
  };
  res.json(movies[i]);
}

function deleteMovieById(req, res) {
  const id = Number(req.params.id);
  const i = movies.findIndex((m) => m.id === id);
  if (i === -1) return res.status(404).json({ error: "Movie not found" });
  const deleted = movies.splice(i, 1)[0];
  res.json({ message: "Movie deleted", movie: deleted });
}

module.exports = {
  render,
  createMovie,
  getAllMovies,
  getMovieById,
  updateMovieById,
  deleteMovieById,
};
