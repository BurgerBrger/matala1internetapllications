(async ()=>{
  require('dotenv').config();
  const mongoose = require('mongoose');
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('MONGODB_URI missing'); process.exit(1); }
  await mongoose.connect(uri);
  const Content = require('../models/mongo/Content');
  const res = await Content.updateMany({}, { $set: { tmdbRating: 0, tmdbVoteCount: 0 } });
  console.log('Updated docs:', res.modifiedCount || res.nModified || res.modified || res);
  process.exit(0);
})();
