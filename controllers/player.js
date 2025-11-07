// controllers/player.js
const Content = require("../models/mongo/Content"); // adjust relative path if needed

exports.render = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    const idNum   = Number(idParam);

    // handle both numeric and string ids just in case
    const item = await Content.findOne({
      $or: [{ id: idNum }, { id: idParam }]
    }).lean();

    if (!item) {
      // Don’t render player.ejs with a null item (that causes 500)
      return res.status(404).send("Not found");
    }

    const epIndex = Number(req.query.ep || 0) || 0; // for TV shows
    return res.render("player", { item, epIndex });
  } catch (err) {
    console.error("PLAYER RENDER ERROR:", err);
    return next(err);
  }
};
