const router = require('express').Router();

router.use('/moderator', require('./moderator'));
router.use('/non-moderator', require('./non-moderator'));
router.use('/status', require('./status'));
router.use('/hold', require('./hold'));

module.exports = router;
