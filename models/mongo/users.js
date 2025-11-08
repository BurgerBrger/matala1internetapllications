const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  // numeric user identifier used to associate profiles
  usernumber: { type: Number, default: 0, index: true }
});

module.exports = mongoose.model('User', userSchema);
