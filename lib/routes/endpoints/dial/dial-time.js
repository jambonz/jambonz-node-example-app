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
        referHook: '/dial/time/refer',
        target: [
          {
          /*
          type: 'phone',
          number: '15083084809',
          */
            type: 'user',
            name: 'daveh@daveh.sip.jambonz.xyz'
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
  res.sendStatus(200);

  // TODO: REST outdial party to transfer call to
});

module.exports = router;
