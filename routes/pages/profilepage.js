// routes/pages/profilepage.js
const router = require('express').Router();
const c = require('../../controllers/profilepage');

function requireAuth(req, res, next) {
	if (req.session && req.session.userId) return next();
	return res.redirect('/signin');
}

router.get('/', requireAuth, c.render);   // GET /profile -> protected page
module.exports = router;
