const router = require('express').Router();
const WebhookResponse = require('@jambonz/node-client').WebhookResponse;

router.post('/', (req, res) => {
  const {logger} = req.app.locals;
  logger.debug({payload: req.body}, 'POST /queue-test');
  try {
    const app = new WebhookResponse();
    app
      .say({text: 'Hello, now handing you over to an agent...'})
      .play({url: 'https://www.kozco.com/tech/piano2.wav'})
      .enqueue({
        name: 'support',
        waitHook: '/queue-test/queue-handler'
      });
    res.status(200).json(app);
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(503);
  }
});

router.post('/queue-handler', (req, res) => {
  const {logger} = req.app.locals;
  logger.debug({payload: req.body}, 'POST /queue-test/queue-handler');
  try {
    const app = new WebhookResponse();
    app
      .say({text: 'You are currently fifth in queue'})
      .play({url: 'https://www.kozco.com/tech/piano2.wav'})
      .play({url: 'https://www.kozco.com/tech/piano2.wav'});
    res.status(200).json(app);
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(503);
  }
});

module.exports = router;
