const mongoose = require('mongoose');
require('dotenv').config();
(async ()=>{
  const uri = process.env.MONGODB_URI;
  if (!uri) return console.error('MONGODB_URI missing');
  await mongoose.connect(uri);
  const User = require('../models/mongo/users');
  const Profile = require('../models/mongo/Profile');
  console.log('Users:');
  const users = await User.find({}).lean();
  users.forEach(u=> console.log(u.email, '-> usernumber=', u.usernumber || 0));
  console.log('\nProfiles:');
  const profiles = await Profile.find({}).lean();
  profiles.forEach(p=> console.log('id=',p.id,'name=',p.name,'usernumber=',p.usernumber));
  process.exit(0);
})();
