// controllers/profilepage.js
const Profile = require("../models/mongo/Profile"); // if you list profiles on the page
const User = require("../models/mongo/users");

exports.render = async (req, res, next) => {
  try {
    // require authentication
    if (!req.session || !req.session.userId) return res.redirect('/signin');

    // find the user and determine their usernumber
    const user = await User.findById(req.session.userId).lean();
    if (!user) return res.redirect('/signin');

    // admin (usernumber 0) sees all profiles
    let profiles = [];
    if (user.usernumber === 0) {
      profiles = await Profile.find({}).lean();
    } else if (typeof user.usernumber === 'number') {
      // only profiles with a matching numeric usernumber
      profiles = await Profile.find({ usernumber: user.usernumber }).lean();
    } else {
      // no valid usernumber -> no profiles
      profiles = [];
    }
    profiles.sort((a, b) => (a.id === 0 ? -1 : b.id === 0 ? 1 : a.id - b.id));
    res.render("profilepage", { profiles }); // view must exist: views/profilepage.ejs
  } catch (e) { next(e); }
};
