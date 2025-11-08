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
  console.log('User:', user.email, 'usernumber=', user.usernumber);
  let filter = {};
  if (user.usernumber === 0) filter = {};
  else if (typeof user.usernumber === 'number') filter = { usernumber: user.usernumber };
  else { console.log('Invalid usernumber, returning empty'); console.log([]); process.exit(0); }
  const docs = await Profile.find(filter).sort({ id: 1 }).lean();
  console.log('Profiles visible to', email, JSON.stringify(docs, null, 2));
  process.exit(0);
})();
