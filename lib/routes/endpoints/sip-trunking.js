const router = require('express').Router();
const WebhookResponse = require('@jambonz/node-client').WebhookResponse;
const text = `Thank you for calling.
Would you be willing to do a brief survey now?
It should take only 5 minutes of your time,`;

router.post('/', (req, res) => {
  const {logger} = req.app.locals;
  logger.debug({payload: req.body}, 'POST /sip-trunking');
  try {
    const app = new WebhookResponse();
    app
      .dial({
        callerId: process.env.OUTBOUND_CALLER_ID,
        answerOnBridge: true,
        dtmfCapture: ['*2', '*3'],
        dtmfHook: '/sip-trunking/dtmf',
        target: [
          {
            type: 'phone',
            number: req.body.to
          }
        ]
      })
      .say({text});
    res.status(200).json(app);
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(503);
  }
});

router.post('/dtmf', (req, res) => {
  const {logger} = req.app.locals;
  logger.debug({payload: req.body}, 'POST /dtmf');
  res.sendStatus(200);
});

module.exports = router;
