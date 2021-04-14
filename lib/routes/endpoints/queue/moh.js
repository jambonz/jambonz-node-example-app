const router = require('express').Router();
const WebhookResponse = require('@jambonz/node-client').WebhookResponse;

router.post('/', (req, res) => {
  const {logger} = req.app.locals;
  logger.debug({payload: req.body}, 'POST /park');
  try {
    const app = new WebhookResponse();
    app
      .say({
        text: 'Please hold.  We will be with you shortly',
        synthesizer: {
          vendor: 'google',
          language: 'en-US'
        }
      })
      .pause({
        length: 20
      });
    res.status(200).json(app);
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(503);
  }
});

module.exports = router;
