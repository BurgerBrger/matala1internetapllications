const express = require("express");

const path = require("path");

const signinViewRouter = require("./routes/pages/signin");
const profilepageViewRouter = require("./routes/pages/profilepage");
const feedViewRouter = require("./routes/pages/feed");

const apiMoviesRouter = require("./routes/api/movies");

const app = express();

// view engine + where your .ejs files are:
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", require("./routes/pages/signin"));
app.use("/profile", require("./routes/pages/profilepage"));
app.use("/feed", require("./routes/pages/feed"));
app.use("/api/movies", require("./routes/api/movies"));

app.use("/api/movies", require("./routes/api/movies"));

app.use(express.json());                 // JSON bodies
app.use(express.urlencoded({ extended: false })); // form posts

app.listen(5050, () => console.log("server is running"));


// index.js  (replace the middle of the file with this)

