// index.js
require("dotenv").config();
// log process-level events so we can diagnose unexpected exits
process.on('exit', (code) => console.log('process exit event, code=', code));
process.on('uncaughtException', (err) => { console.error('uncaughtException', err && err.stack ? err.stack : err); });
process.on('unhandledRejection', (reason) => { console.error('unhandledRejection', reason); });
const path = require("path");
const express = require("express");
const { connectDB } = require("./db");
const { ensureAdminProfile } = require("./controllers/profiles");

const app = express();

// core middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static & views
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// sessions
const session = require("express-session");
const MongoStore = require("connect-mongo");
app.use(session({
  secret: process.env.SESSION_SECRET || "change-me",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: { httpOnly: true, maxAge: 1000*60*60*24 }
}));

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
app.use("/api/watch", require("./routes/api/watch"));
app.use('/api/tmdb', require('./routes/api/tmdb'));

const User = require('./models/mongo/users');

// GET /api/me - return basic session user info
app.get('/api/me', async (req, res) => {
  try {
    if (!req.session || !req.session.userId) return res.json({ loggedIn: false });
    const user = await User.findById(req.session.userId).lean();
    if (!user) return res.json({ loggedIn: false });
  res.json({ loggedIn: true, id: String(user._id), email: user.email, usernumber: user.usernumber || 0, profiles: Array.isArray(user.profiles) ? user.profiles : [] });
  } catch (e) {
    console.error('GET /api/me error', e);
    res.status(500).json({ loggedIn: false });
  }
});

// logout endpoint (client should POST to this)
app.post('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) return res.status(500).json({ ok: false });
      res.json({ ok: true });
    });
  } else res.json({ ok: true });
});


// debug: log each unmatched request path (temporary)
app.use((req, res, next) => {
  console.log('[REQ]', req.method, req.path);
  next();
});

// 404 + error handler
app.use((req, res) => res.status(404).send("Not found"));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).send("Server error");
});


// start server only after DB connects
(async () => {
  await connectDB(process.env.MONGODB_URI);
  try { await ensureAdminProfile(); } catch (e) { console.error("ensureAdminProfile failed:", e); }
  const PORT = process.env.PORT || 5050;
  app.listen(PORT, () => console.log("server is running", PORT));
})();
