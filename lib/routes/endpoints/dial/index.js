const router = require('express').Router();

router.use('/two-stage', require('./two-stage'));
router.use('/attended-transfer', require('./attended-transfer'));
router.use('/time', require('./dial-time'));

module.exports = router;
