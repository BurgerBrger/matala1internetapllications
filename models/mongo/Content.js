// models/mongo/Content.js
const mongoose = require("mongoose");

const ContentSchema = new mongoose.Schema(
  {
    id: { type: Number, index: true, unique: true },
    type: { type: String, enum: ["movie", "tv"], default: "movie" },
    name: { type: String, required: true },
    year: Number,
    genre: { type: [String], default: [] },
    numberOfLikes: { type: Number, default: 0 },
    image: String,      // poster (card)
    wideimage: String,  // hero wide image
    video: String,      // mp4 path (used for movies)
  // TMDB integration: optional TMDB id and cached rating
  tmdbId: Number,
  tmdbRating: Number,
  tmdbVoteCount: Number,
  tmdbLastUpdated: Date,
    episodes: {         // used for TV shows only
      type: [{
        id:   { type: Number, required: true },   // per-show episode id (e.g., 1,2,3…)
        name: { type: String,  required: true },
        video:{ type: String,  required: true }   // mp4 path
      }],
      default: []
    }
  },
  {
    timestamps: true,
    // IMPORTANT: your Mongo collection is singular "content"
    collection: "content"
  }
);

// Passing the third arg ensures the collection name is "content"
module.exports = mongoose.model("Content", ContentSchema, "content");
