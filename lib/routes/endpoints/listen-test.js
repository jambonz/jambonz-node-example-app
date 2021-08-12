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
  logger.debug({payload: req.body}, 'POST /listen-test');
  try {
    const app = new WebhookResponse();
    app.pause({length: 1});
    app.say({
      text: 'Hi there.  Please leave a message, and we will get back to you shortly.',
      synthesizer: {
        vendor: 'google',
        language: 'en-US'
      }
    });
    app.listen({
      url: 'wss://test-apps.jambonz.us/record'
    });
    res.status(200).json(app);
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(503);
  }
});

module.exports = router;
