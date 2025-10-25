// index.js
require("dotenv").config();
const path = require("path");
const express = require("express");
const { connectDB } = require("./db");

const app = express();

// core middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static & views
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// page routes
app.use("/signin", require("./routes/pages/signin"));
app.use("/feed", require("./routes/pages/feed"));
app.use("/profile", require("./routes/pages/profilepage"));
app.use("/player", require("./routes/pages/player"));
app.use("/admin/content", require("./routes/pages/adminContent"));

// health
app.get("/", (_req, res) => res.redirect("/signin"));

// API routes
app.use("/api/content", require("./routes/api/content"));
app.use("/api/profiles", require("./routes/api/profiles"));


// 404 + error handler
app.use((req, res) => res.status(404).send("Not found"));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).send("Server error");
});

// start server only after DB connects
(async () => {
  await connectDB(process.env.MONGODB_URI);
  const PORT = process.env.PORT || 5050;
  app.listen(PORT, () => console.log("server is running", PORT));
})();
