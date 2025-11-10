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

    let similar = [];
    const genres = item.genre || [];
    if (genres.length) {
      similar = await Content.find({
        id: { $ne: item.id },
        genre: { $in: genres }
      })
        .limit(12)       // at most 12 items
        .lean();
    }

    const epIndex = Number(req.query.ep || 0) || 0; // for TV shows
    // Fire-and-forget: record a view event when page is rendered (episodeIndex for shows)
    recordViewEvent(req, item.id, epIndex).catch(err => console.warn('recordViewEvent failed', err));
    return res.render("player", { item, epIndex, similar });
  } catch (err) {
    console.error("PLAYER RENDER ERROR:", err);
    return next(err);
  }
};

// helper to record view events (simple aggregation source for daily views)
async function recordViewEvent(req, contentId, episodeIndex) {
  try {
    if (!req.session || !req.session.userId) return; // only track authenticated
    const profileId = Number(req.query.profileId || req.body?.profileId || req.session.selectedProfileId || 0) || null;
    const mongoose = require('mongoose');
    const ViewEvent = getViewEventModel();
    await ViewEvent.create({ contentId: Number(contentId), profileId, episodeIndex: Number(episodeIndex)||0 });
  } catch (e) { /* silent */ }
}

function getViewEventModel() {
  const mongoose = require('mongoose');
  if (mongoose.models.ViewEvent) return mongoose.models.ViewEvent;
  const schema = new mongoose.Schema({
    contentId: { type: Number, index: true },
    profileId: { type: Number, index: true, default: null },
    episodeIndex: { type: Number, default: 0 },
  }, { timestamps: { createdAt: true, updatedAt: false } });
  schema.index({ createdAt: 1 });
  return mongoose.model('ViewEvent', schema);
}
