(async ()=>{
  // This script connects to the DB, finds a user by email and lists profiles visible to them
  const [,, email] = process.argv;
  if (!email) { console.error('Usage: node scripts/testDbProfiles.js <email>'); process.exit(1); }
  require('dotenv').config();
  const mongoose = require('mongoose');
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('MONGODB_URI missing'); process.exit(2); }
  await mongoose.connect(uri);
  const User = require('../models/mongo/users');
  const Profile = require('../models/mongo/Profile');
  const user = await User.findOne({ email }).lean();
  if (!user) { console.error('User not found:', email); process.exit(3); }
  console.log('User:', user.email, 'usernumber=', user.usernumber, 'profiles=', user.profiles);
  let filter = {};
  if (Array.isArray(user.profiles) && user.profiles.length > 0) {
    filter = { id: { $in: user.profiles } };
  } else {
    console.log('User has no profiles -> returning empty');
    console.log([]);
    process.exit(0);
  }
  const docs = await Profile.find(filter).sort({ id: 1 }).lean();
  console.log('Profiles visible to', email, JSON.stringify(docs, null, 2));
  process.exit(0);
})();
