const router = require('express').Router();

router.post('/', require('./start'));
router.post('/language-selection', require('./language-selection'));
router.use('/offer-translation', require('./offer-translation'));

module.exports = router;
