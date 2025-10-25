require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { connectDB } = require("../db");
const Content = require("../models/mongo/Content");
const Profile = require("../models/mongo/Profile");

(async () => {
  await connectDB(process.env.MONGODB_URI);

  const contentPath = path.join(__dirname, "..", "data", "content.json");
  const profilesPath = path.join(__dirname, "..", "data", "profiles.json");

  const content = JSON.parse(fs.readFileSync(contentPath, "utf8"));
  const profiles = JSON.parse(fs.readFileSync(profilesPath, "utf8"));

  // normalize likes field name
  for (const c of content) {
    if (c.numberoflikes != null && c.numberOfLikes == null) {
      c.numberOfLikes = c.numberoflikes;
      delete c.numberoflikes;
    }
  }
  for (const p of profiles) {
    if (!Array.isArray(p.liked))     p.liked = [];
    if (!Array.isArray(p.watched))   p.watched = [];
    if (!Array.isArray(p.topGenres)) p.topGenres = [];
  }

  await Content.deleteMany({});
  await Profile.deleteMany({});
  await Content.insertMany(content);
  await Profile.insertMany(profiles);

  console.log("✅ Seeded content & profiles");
  process.exit(0);
})();
