const router = require('express').Router();

router.use('/genesys', require('./genesys'));
router.use('/two-stage', require('./two-stage'));
router.use('/attended-transfer', require('./attended-transfer'));
router.use('/time', require('./dial-time'));
router.use('/user', require('./dial-user'));
router.use('/amd-test', require('./dial-amd-test'));
router.use('/confirm', require('./dial-confirm'));

module.exports = router;
