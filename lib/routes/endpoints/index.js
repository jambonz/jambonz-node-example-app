const router = require('express').Router();

router.use('/auth', require('./auth'));
router.use('/call-status', require('./call-status'));
router.use('/tts-test', require('./tts-test'));
router.use('/lex-test', require('./lex-test'));
router.use('/lex-events', require('./lex-events'));
router.use('/dialogflow-test', require('./dialogflow-test'));
router.use('/dialogflow-events', require('./dialogflow-events'));
router.use('/dialogflow-action', require('./dialogflow-action'));
router.use('/lcc-test', require('./lcc-test'));  // lcc = live call control
router.use('/lcc-dtmf', require('./lcc-dtmf'));

module.exports = router;
