exports.render = (req, res) => {
  res.render("profilepage");  // renders views/profilepage.ejs
};


function render(req, res) {
  // 'contents' comes from models/contents.js
  // 'feed' corresponds to views/feed.ejs
  res.render("feed", { feeds: contents });
}