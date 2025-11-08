const router = require('express').Router();
const c = require('../../controllers/signin');

router.get('/', c.render);
router.post('/', c.login);

module.exports = router;
