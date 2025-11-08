// scripts/hashPassword.js
// Usage: node scripts/hashPassword.js user@example.com newPassword
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/mongo/users');
require('dotenv').config();

async function run() {
  const [,, email, password] = process.argv;
  if (!email || !password) {
    console.error('Usage: node scripts/hashPassword.js user@example.com newPassword');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  try {
    const hash = await bcrypt.hash(password, 12);
    const u = await User.findOneAndUpdate({ email }, { passwordHash: hash }, { new: true, upsert: false });
    if (!u) {
      console.error('User not found:', email);
      process.exit(2);
    }
    console.log('Updated user:', u.email);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(3);
  }
}

run();
