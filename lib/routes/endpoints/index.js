const router = require('express').Router();

router.use('/auth', require('./auth'));
router.use('/call-status', require('./call-status'));
router.use('/listen-test', require('./listen-test'));
router.use('/tts-test', require('./tts-test'));
router.use('/lex-test', require('./lex-test'));
router.use('/lex-events', require('./lex-events'));
router.use('/dialogflow-test', require('./dialogflow-test'));
router.use('/dialogflow-events', require('./dialogflow-events'));
router.use('/dialogflow-action', require('./dialogflow-action'));
router.use('/lcc-test', require('./lcc-test'));  // lcc = live call control
router.use('/lcc-dtmf', require('./lcc-dtmf'));
router.use('/callback', require('./callback'));
router.use('/callback-followup', require('./callback-followup'));
router.use('/dial-transcribe', require('./dial-transcribe'));
router.use('/call-transcriptions', require('./call-transcriptions'));
router.use('/sip-trunking', require('./sip-trunking'));
router.use('/translator', require('./translator'));
router.use('/queue', require('./queue'));
router.use('/dial', require('./dial'));
router.use('/rasa', require('./rasa'));

module.exports = router;
