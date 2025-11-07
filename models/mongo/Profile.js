// models/mongo/Profile.js
const { Schema, model } = require("mongoose");

const ProfileSchema = new Schema(
  {
    id: { type: Number, index: true, unique: true }, // keep numeric id
    name: { type: String, required: true },
    image: { type: String, default: "/images/profile/default.jpg" },
    liked:   [{ type: Number }], // store content ids
    watched: [{ type: Number }],
    topGenres: [{ type: String }]
  },
  { timestamps: true }
);

module.exports = model("Profile", ProfileSchema);
