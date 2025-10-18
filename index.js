const express = require("express");

const path = require("path");

const signinViewRouter = require("./routes/pages/signin");
const profilepageViewRouter = require("./routes/pages/profilepage");
const feedViewRouter = require("./routes/pages/feed");
const adminViewRouter = require("./routes/pages/adminContent");

const apiContentsRouter = require("./routes/api/content");

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
app.use("/admin/content", require("./routes/pages/adminContent"));
app.use("/player", require("./routes/pages/player"));

app.use("/api/profiles", require("./routes/api/profiles"));
app.use("/api/content", require("./routes/api/content"));

app.listen(5050, () => console.log("server is running"));

