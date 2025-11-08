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

    // New ownership model: user has `profiles` array with numeric profile ids
    let profiles = [];
    if (Array.isArray(user.profiles) && user.profiles.length > 0) {
      profiles = await Profile.find({ id: { $in: user.profiles } }).lean();
    } else {
      profiles = [];
    }
    profiles.sort((a, b) => (a.id === 0 ? -1 : b.id === 0 ? 1 : a.id - b.id));
    res.render("profilepage", { profiles }); // view must exist: views/profilepage.ejs
  } catch (e) { next(e); }
};
