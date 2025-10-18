// models/profilesStore.js
const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "data", "profiles.json");

// In-memory list
const profiles = [];

// Load from JSON if present; otherwise start empty
try {
  if (fs.existsSync(DATA_FILE)) {
    const loaded = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    if (Array.isArray(loaded)) profiles.push(...loaded);
    // make sure newer fields exist
    for (const p of profiles) {
      if (!Array.isArray(p.liked))   p.liked = [];
      if (!Array.isArray(p.watched)) p.watched = [];
      if (!Array.isArray(p.topGenres)) p.topGenres = [];
    }
    console.log("Loaded profiles from data/profiles.json");
  } else {
    console.log("No profiles.json found; starting with empty profiles array.");
  }
} catch (e) {
  console.warn("Failed to read profiles.json:", e.message);
}

function saveAll() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(profiles, null, 2), "utf8");
}

function nextId() {
  return profiles.length ? Math.max(...profiles.map(p => Number(p.id))) + 1 : 1;
}

module.exports = { profiles, saveAll, nextId };
