const { movies } = require("../models/movies");

exports.render = (req, res) => {
  res.render("feed", { feeds: movies });       // renders views/feed.ejs
};


// Create a new feed
function createFeed(req, res) {
    const newFeed = {
        ...req.body,
        id: movies.length + 1,
    };
    movies.push(newFeed);
    res.json(newFeed);
}


// Get all feeds
function getAllFeeds(req, res) {
    res.json(movies);
}

// Get a feed by ID
function getFeedById(req, res) {
    const id = Number(req.params.id);
    const selectedMovie = movies.find((movie) => movie.id === id);

    if (!selectedMovie) {
        return res.status(404).json({ error: "Movie not found" });
    }

    res.json(selectedMovie);
}

// Update a feed by ID
function updateMovieById(req, res) {
    const id = Number(req.params.id);
    const movieIndex = movies.findIndex((movie) => movie.id === id);

    if (movieIndex === -1) {
        return res.status(404).json({ error: "Movie not found" });
    }

    const { title, content, author, image } = req.body;
    const updatedMovie = {
        ...movies[movieIndex],
        title: title !== undefined ? title : movies[movieIndex].title,
        content: content !== undefined ? content : movies[movieIndex].content,
        author: author !== undefined ? author : movies[movieIndex].author,
        image: image !== undefined ? image : movies[movieIndex].image,
    };

    movies[movieIndex] = updatedMovie;
    res.json(updatedMovie);
}

// Delete a movie by ID
function deleteMovieById(req, res) {
    const id = Number(req.params.id);
    const movieIndex = movies.findIndex((movie) => movie.id === id);

    if (movieIndex === -1) {
        return res.status(404).json({ error: "Movie not found" });
    }

    const deletedMovie = movies.splice(movieIndex, 1)[0];
    res.json({ message: "Movie deleted", movie: deletedMovie });
}

module.exports = {
    render,
    createMovie,
    getAllMovies,
    getMovieById,
    updateMovieById,
    deleteMovieById,
};