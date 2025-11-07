const mongoose = require("mongoose");

async function connectDB(uri) {
  if (!uri) throw new Error("MONGODB_URI missing");
  await mongoose.connect(uri);                 // <-- no dbName override
  console.log("✅ Mongo connected:", mongoose.connection.name);
}

module.exports = { connectDB };
