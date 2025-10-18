
// controllers/player.js
const { content } = require("../models/contentStore");

function render(req, res) {
  const id = Number(req.params.id);
  const item = content.find(c => Number(c.id) === id);

  if (!item) {
    // Helpful log while you debug: see which ids exist
    console.warn("Player: content not found for id", id, "available ids:", content.map(c => c.id));
    return res.status(404).send("Content not found");
  }

  res.render("player", { item });
}

module.exports = { render };



