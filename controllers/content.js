// controllers/content.js
const { content, saveAll: saveContent } = require("../models/contentStore");
const { profiles, saveAll: saveProfiles } = require("../models/profilesStore");

// ---- helpers ----
function ensureLikedArray(p) { if (!Array.isArray(p.liked)) p.liked = []; return p.liked; }
function findContent(id)     { return content.find(c => Number(c.id) === Number(id)); }
function findProfile(id)     { return profiles.find(p => Number(p.id) === Number(id)); }
function likesField(item)    { return "numberOfLikes" in item ? "numberOfLikes" : "numberoflikes"; }

// ---- read endpoints ----
function getAllContents(req, res)      { res.json(content); }
function getContentById(req, res)      {
  const item = findContent(req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
}
function getRandomContent(req, res)    {
  if (!content.length) return res.status(404).json({ error: "No content" });
  const item = content[Math.floor(Math.random() * content.length)];
  res.json(item);
}

// ---- like / unlike ----
function likeContent(req, res) {
  const contentId = Number(req.params.id);
  const { profileId } = req.body || {};
  const item = findContent(contentId);
  const prof = findProfile(profileId);
  if (!item || !prof) return res.status(404).json({ error: "Not found" });

  const liked = ensureLikedArray(prof);
  if (!liked.includes(contentId)) liked.push(contentId);

  const field = likesField(item);
  item[field] = Math.max(0, Number(item[field] || 0) + 1);

  saveProfiles(); saveContent();
  res.json({ id: contentId, numberOfLikes: item[field], liked: true });
}

function unlikeContent(req, res) {
  const contentId = Number(req.params.id);
  const { profileId } = req.body || {};
  const item = findContent(contentId);
  const prof = findProfile(profileId);
  if (!item || !prof) return res.status(404).json({ error: "Not found" });

  const field = likesField(item);
  item[field] = Math.max(0, Number(item[field] || 0) - 1);

  const liked = ensureLikedArray(prof);
  const i = liked.indexOf(contentId);
  if (i !== -1) liked.splice(i, 1);

  saveProfiles(); saveContent();
  res.json({ id: contentId, numberOfLikes: item[field], liked: false });
}

// export everything we use
module.exports = {
  getAllContents,
  getContentById,
  getRandomContent,
  likeContent,
  unlikeContent,
};
