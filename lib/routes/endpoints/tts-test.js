const router = require('express').Router();
const WebhookResponse = require('@jambonz/node-client').WebhookResponse;

router.post('/', (req, res) => {
  const {logger} = req.app.locals;
  logger.debug({payload: req.body}, 'POST /tts-test');
  try {
    const app = new WebhookResponse();
    app.pause({length: 1.5});
    app.say({
      text: 'Good morning. This is a simple test of text to speech functionality.  That is all.  Goodbye',
      synthesizer: {
        vendor: 'google',
        language: 'en-US'
      }
    });
    res.status(200).json(app);
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(503);
  }
});

module.exports = router;
