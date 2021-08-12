const router = require('express').Router();
const WebhookResponse = require('@jambonz/node-client').WebhookResponse;

router.post('/', (req, res) => {
  const {logger} = req.app.locals;
  logger.debug({payload: req.body}, 'POST /dial/time');
  try {
    const app = new WebhookResponse();
    app.dial({
      answerOnBridge: true,
      target: [
        {
          type: 'phone',
          number: '13034997111'
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
