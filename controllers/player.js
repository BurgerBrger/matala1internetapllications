// controllers/player.js
const Content = require("../models/mongo/Content");

exports.render = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const item = await Content.findOne({ id }).lean();
    if (!item) return res.status(404).send("Content not found");
    res.render("player", { item });
  } catch (e) { next(e); }
};
