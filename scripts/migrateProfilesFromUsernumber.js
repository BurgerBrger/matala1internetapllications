(async ()=>{
  // Migrate existing Profile.usernumber -> User.profiles arrays
  require('dotenv').config();
  const mongoose = require('mongoose');
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('MONGODB_URI missing'); process.exit(1); }
  await mongoose.connect(uri);
  const User = require('../models/mongo/users');
  const Profile = require('../models/mongo/Profile');

  const profiles = await Profile.find({}).lean();
  console.log('Found', profiles.length, 'profiles');

  // Map usernumber -> profile ids
  const byUsernumber = {};
  profiles.forEach(p => {
    const un = p.usernumber || 0;
    if (!byUsernumber[un]) byUsernumber[un] = [];
    byUsernumber[un].push(p.id);
  });

  const users = await User.find({}).lean();
  for (const u of users) {
    const un = u.usernumber || 0;
    const ids = byUsernumber[un] || [];
    await User.updateOne({ _id: u._id }, { $set: { profiles: ids } });
    console.log('Updated user', u.email, '-> profiles', ids);
  }
  console.log('Migration complete');
  process.exit(0);
})();
