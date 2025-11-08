// controllers/signin.js
const User = require('../models/mongo/users');
const bcrypt = require('bcryptjs');

exports.render = (req, res) => {
  res.render('signin', { error: null });
};

// POST /signin - authenticate user and redirect to profiles page
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    // basic validation
    if (!email || !password) {
      return res.status(400).render('signin', { error: 'Email and password are required' });
    }

    // find user by email
    const user = await User.findOne({ email }).lean();
    if (!user) {
      return res.status(401).render('signin', { error: 'Invalid email or password' });
    }

    const stored = user.passwordHash || '';

    // compare password (assume stored is a bcrypt hash)
    const match = await bcrypt.compare(password, stored);
    if (!match) return res.status(401).render('signin', { error: 'Invalid email or password' });

    // authentication succeeded — set session and redirect to profiles page
    // ensure we have the canonical user document (not lean) so we can update usernumber for special admin
    const userDoc = await User.findOne({ email });
    if (!userDoc) return res.status(500).render('signin', { error: 'Server error' });

    // if there's a special admin email that should have usernumber 3, enforce it
    if (userDoc.email === 'admin@example.com') {
      if (userDoc.usernumber !== 3) {
        userDoc.usernumber = 3;
      }
      // ensure admin user includes the admin profile id (0)
      if (!Array.isArray(userDoc.profiles)) userDoc.profiles = [];
      if (!userDoc.profiles.includes(0)) userDoc.profiles.push(0);
      await userDoc.save();
    }

    if (req.session) {
      req.session.userId = String(userDoc._id);
      req.session.userEmail = userDoc.email;
      req.session.usernumber = userDoc.usernumber || 0;
      req.session.profiles = Array.isArray(userDoc.profiles) ? userDoc.profiles : [];
    }
    return res.redirect('/profile');
  } catch (e) { next(e); }
};