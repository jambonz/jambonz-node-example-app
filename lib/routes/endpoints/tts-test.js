const router = require('express').Router();
const WebhookResponse = require('@jambonz/node-client').WebhookResponse;
const text = `<speak>
<prosody volume="loud">Hi there,</prosody> and welcome to jambones! 
jambones is the <sub alias="seapass">CPaaS</sub> designed with the needs
of communication service providers in mind.
This is an example of simple text-to-speech, but there is so much more you can do.
Try us out!
</speak>`;
router.post('/', (req, res) => {
  const {logger} = req.app.locals;
  logger.debug({payload: req.body}, 'POST /tts-test');
  try {
    const app = new WebhookResponse();
    app.pause({length: 1.5});
    app.say({
      text,
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
