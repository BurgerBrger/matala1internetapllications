// controllers/profilepage.js
const Profile = require("../models/mongo/Profile"); // if you list profiles on the page

exports.render = async (req, res, next) => {
  try {
    const profiles = await Profile.find({}).sort({ id: 1 }).lean();
    res.render("profilepage", { profiles }); // view must exist: views/profilepage.ejs
  } catch (e) { next(e); }
};
