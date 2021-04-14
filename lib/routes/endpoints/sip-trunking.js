const router = require('express').Router();
const WebhookResponse = require('@jambonz/node-client').WebhookResponse;

router.post('/', (req, res) => {
  const {logger} = req.app.locals;
  logger.debug({payload: req.body}, 'POST /sip-trunking');
  try {
    const app = new WebhookResponse();
    app.dial({
      callerId: process.env.OUTBOUND_CALLER_ID,
      answerOnBridge: true,
      target: [
        {
          type: 'phone',
          number: req.body.to
        }
      ]
    });
    res.status(200).json(app);
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(503);
  }
});

module.exports = router;
