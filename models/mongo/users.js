const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  // numeric user identifier used to associate profiles
  usernumber: { type: Number, default: 0, index: true },
  // list of numeric profile ids (the `id` field from Profile documents)
  profiles: { type: [Number], default: [] },
  // optional numeric id for the user (legacy)
  id: { type: Number }
});

module.exports = mongoose.model('User', userSchema);
