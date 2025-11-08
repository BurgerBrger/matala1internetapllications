// models/mongo/Profile.js
const { Schema, model } = require("mongoose");

const ProfileSchema = new Schema(
  {
    id: { type: Number, index: true, unique: true }, // keep numeric id
    name: { type: String, required: true },
    image: { type: String, default: "/images/profile/default.avif" },
    liked:   [{ type: Number }], // store content ids the profile liked
    watched: [{ type: Number }], // fully watched content ids
    topGenres: [{ type: String }], // genres the profile tends to like/watch
    watchProgress: [{
      contentId:   { type: Number, required: true },
      episodeIndex:{ type: Number, default: 0 }, // 0 for movie, or episode index for shows
      position:    { type: Number, default: 0 }, // seconds
      duration:    { type: Number, default: 0 }, // seconds
      completed:   { type: Boolean, default: false },
      updatedAt:   { type: Date, default: Date.now }
    }]

  },
  { timestamps: true }
);

module.exports = model("Profile", ProfileSchema);
