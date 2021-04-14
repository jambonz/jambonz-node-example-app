const router = require('express').Router();
const WebhookResponse = require('@jambonz/node-client').WebhookResponse;

router.post('/', (req, res) => {
  const {logger} = req.app.locals;
  logger.debug({payload: req.body}, 'POST /dequeue');
  try {
    const app = new WebhookResponse();
    app
      .dequeue({
        name: 'support',
        beep: true,
        timeout: 30,
        actionHook: '/queue/dequeue-result'
      });
    res.status(200).json(app);
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(503);
  }
});

module.exports = router;
