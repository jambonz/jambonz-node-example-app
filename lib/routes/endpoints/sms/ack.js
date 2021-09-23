const router = require('express').Router();
const WebhookResponse = require('@jambonz/node-client').WebhookResponse;

router.post('/', (req, res) => {
  const {logger} = req.app.locals;
  logger.debug({payload: req.body}, 'POST /sms/ack');
  try {
    const app = new WebhookResponse();
    app.message({
      to: req.body.from,
      from: req.body.to,
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
