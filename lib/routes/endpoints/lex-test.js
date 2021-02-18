const router = require('express').Router();
const assert = require('assert');
const WebhookResponse = require('@jambonz/node-client').WebhookResponse;

router.post('/', (req, res) => {
  const {logger} = req.app.locals;
  logger.debug({payload: req.body}, 'POST /lex-test');
  try {
    assert(process.env.LEX_BOT_ID);
    assert(process.env.LEX_BOT_ALIAS_ID);
    assert(process.env.AWS_ACCESS_KEY_ID);
    assert(process.env.AWS_SECRET_ACCESS_KEY);
    assert(process.env.AWS_REGION);

    const app = new WebhookResponse();
    app.lex({
      botId: process.env.LEX_BOT_ID,
      botAlias: process.env.LEX_BOT_ALIAS_ID,
      eventHook: '/lex-events',
      region: process.env.AWS_REGION,
      locale: 'en_US',
      credentials: {
        accessKey: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      },
      welcomeMessage:
      'Hi there, I can help you book a hotel or rent a car.  Tell me what you would like me to assist with',
      passDtmf: true,
      bargein: true,
      noInputTimeout: 10,
      tts: {
        vendor: 'google',
        language: 'en-US',
        voice: 'en-US-Wavenet-C'
      }
    });
    res.status(200).json(app);
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(503);
  }
});

module.exports = router;
