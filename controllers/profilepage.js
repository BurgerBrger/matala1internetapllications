// controllers/profilepage.js
const Profile = require("../models/mongo/Profile"); // if you list profiles on the page

exports.render = async (req, res, next) => {
  try {
    const profiles = await Profile.find().lean();
    profiles.sort((a, b) => (a.id === 0 ? -1 : b.id === 0 ? 1 : a.id - b.id));
    res.render("profilepage", { profiles }); // view must exist: views/profilepage.ejs
  } catch (e) { next(e); }
};
