const router = require('express').Router();

router.use('/ack', require('./ack'));
router.use('/result', require('./result'));

module.exports = router;
