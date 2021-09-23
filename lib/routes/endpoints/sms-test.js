const router = require('express').Router();
const WebhookResponse = require('@jambonz/node-client').WebhookResponse;
router.post('/', (req, res) => {
  const {logger} = req.app.locals;
  logger.debug({payload: req.body}, 'POST /tts-test');
  try {
    const app = new WebhookResponse();
    app.message({
      to: '15083084809',
      from: '4073071599',
      text: 'roger that',
      actionHook: '/sms/result'
    });
    res.status(200).json(app);
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(503);
  }
});

module.exports = router;
