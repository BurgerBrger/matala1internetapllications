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
    video: String       // mp4 path
  },
  {
    timestamps: true,
    // IMPORTANT: your Mongo collection is singular "content"
    collection: "content"
  }
);

// Passing the third arg ensures the collection name is "content"
module.exports = mongoose.model("Content", ContentSchema, "content");
