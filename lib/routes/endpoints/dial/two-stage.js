const router = require('express').Router();
const WebhookResponse = require('@jambonz/node-client').WebhookResponse;

router.post('/gather', (req, res) => {
  const {logger} = req.app.locals;
  logger.debug({payload: req.body}, 'POST /dial/two-stage/gather');
  try {

    const app = new WebhookResponse();
    app.gather({
      actionHook: '/dial/two-stage/results',
      input: ['digits'],
      finishOnKey: '#',
      numDigits: 11,
      timeout: 20,
      say: {
        text: 'Please enter the phone number you would like to dial, followed by the pound sign.'
      }
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
    if (payload.digits) {
      app
        .say({
          text:
          `<speak>
            Please hold while we outdial <say-as interpret-as="characters">${payload.digits}</say-as>
          </speak>`
        })
        .dial({
          callerId: process.env.OUTBOUND_CALLER_ID,
          answerOnBridge: true,
          dtmfCapture: ['*3'],
          dtmfHook: '/dial/attended-transfer/dtmf',
          target: [
            {
              type: 'phone',
              number: payload.digits
            }
          ]
        });
    }
    else {
      app.say({
        text: 'Are you there?  We did not collect any input'
      });
    }
    res.status(200).json(app);
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(503);
  }
});

module.exports = router;
