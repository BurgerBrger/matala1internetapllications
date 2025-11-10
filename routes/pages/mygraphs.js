// routes/pages/mygraphs.js
const router = require('express').Router();

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) return next();
  return res.redirect('/signin');
}

router.get('/', requireAuth, (req, res) => {
  // Placeholder render; implement graphs later
  res.render('mygraphs');
});

module.exports = router;
