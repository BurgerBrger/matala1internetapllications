// models/contentStore.js
const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "data", "content.json");

// In-memory list
const content = [];

// Load from JSON if present; otherwise start empty
try {
  if (fs.existsSync(DATA_FILE)) {
    const loaded = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    if (Array.isArray(loaded)) content.push(...loaded);
    console.log("Loaded content from data/content.json");
  } else {
    console.log("No content.json found; starting with empty content array.");
  }
} catch (e) {
  console.warn("Failed to read content.json:", e.message);
}

// Persist everything
function saveAll() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(content, null, 2), "utf8");
}

// Simple autoincrement id
function nextId() {
  return content.length ? Math.max(...content.map(c => Number(c.id))) + 1 : 1;
}

module.exports = { content, saveAll, nextId };
