const router = require('express').Router();
const WebhookResponse = require('@jambonz/node-client').WebhookResponse;
const text = `Good morning. How can we route your call?
You can say the name of a department, like Sales or Support, or you can say operator`;

router.post('/', (req, res) => {
  const {logger} = req.app.locals;
  logger.debug({payload: req.body}, 'POST /dial/two-stage/gather');
  try {

    const app = new WebhookResponse();
    app.gather({
      actionHook: '/dial/two-stage/results',
      input: ['speech'],
      listenDuringPrompt: false,
      timeout: 10,
      say: {text}
    });
    res.status(200).json(app);
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(503);
  }
});

router.post('/results', (req, res) => {
  const {logger} = req.app.locals;
  const payload = req.body;
  logger.debug({payload}, 'POST /dial/two-stage/results');
  try {
    const app = new WebhookResponse();
    if (payload.reason === 'speechDetected') {
      const transcript = payload.speech.alternatives[0].transcript.toLowerCase();
      let destination = 'an operator';
      if (transcript.includes('sales')) destination = 'sales';
      else if (transcript.includes('support')) destination = 'our customer support team';
      app
        .say({
          text:
          `<speak>
            Please hold while we connect to you to ${destination}</say-as>
          </speak>`
        })
        .dial({
          callerId: process.env.OUTBOUND_CALLER_ID,
          answerOnBridge: true,
          target: [
            {
              type: 'phone',
              number: '15083084809'
            }
          ]
        });
    }
    res.status(200).json(app);
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(503);
  }
});

module.exports = router;
