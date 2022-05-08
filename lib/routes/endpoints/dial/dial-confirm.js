const router = require('express').Router();
const WebhookResponse = require('@jambonz/node-client').WebhookResponse;
const greeting = 'Hi there.  Please hold while we connect your call';

router.post('/', (req, res) => {
  const {logger} = req.app.locals;
  logger.debug({payload: req.body}, 'POST /dial/time');
  try {
    const app = new WebhookResponse();
    app
      .say({
        text: greeting
      })
      .dial({
        answerOnBridge: true,
        callerId: '+15083728299',
        confirmHook: '/dial/confirm/confirm',
        target: [
          {
            type: 'phone',
            number: '15083084809'
          }
        ]
      });
    res.status(200).json(app);
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(503);
  }
});

router.post('/confirm', (req, res) => {
  const app = new WebhookResponse();
  app.say({text: 'hi there.  Please press one to continue'});
  res.status(200).json(app);
});

module.exports = router;
