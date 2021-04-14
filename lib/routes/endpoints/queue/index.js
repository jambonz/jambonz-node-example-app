const router = require('express').Router();

router.use('/park', require('./park'));
router.use('/moh', require('./moh'));
router.use('/enqueue', require('./enqueue'));
router.use('/dequeue', require('./dequeue'));
router.use('/dequeue-result', require('./dequeue-result'));

module.exports = router;
