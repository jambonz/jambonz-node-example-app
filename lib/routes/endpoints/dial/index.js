const router = require('express').Router();

router.use('/two-stage', require('./two-stage'));
router.use('/attended-transfer', require('./attended-transfer'));

module.exports = router;
