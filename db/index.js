// db/index.js
const mongoose = require("mongoose");

async function connectDB(uri) {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { autoIndex: true });
  console.log("✅ Mongo connected:", uri);
}

module.exports = { connectDB };
