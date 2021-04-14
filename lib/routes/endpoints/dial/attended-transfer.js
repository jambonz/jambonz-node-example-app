const router = require('express').Router();
const WebhookResponse = require('@jambonz/node-client').WebhookResponse;

router.post('/', (req, res) => {
  const {logger} = req.app.locals;
  logger.debug({payload: req.body}, 'POST /dial/attended-transfer');
  try {
    const app = new WebhookResponse();
    app.dial({
      callerId: process.env.OUTBOUND_CALLER_ID,
      answerOnBridge: true,
      dtmfCapture: ['*2'],
      dtmfHook: '/dial/attended-transfer/dtmf',
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

router.post('/dtmf', async(req, res) => {
  const {logger, client} = req.app.locals;
  logger.debug({payload: req.body}, 'POST /dial/attended-transfer/dtmf');

  const dtmf = req.body.dtmf;
  let obj ;
  if ('*2' === dtmf) {
    obj = {
      child_call_hook: '/dial/attended-transfer/park',
      call_hook: '/dial/two-stage/gather'
    };
  }
  else if ('*3' === dtmf) {
    obj = {
      call_hook: '/dial/attended-transfer/drop',
      child_call_hook: '/dial/attended-transfer/complete-transfer'
    };
  }
  else return res.sendStatus(200);

  try {
    await client.calls.update(req.body.call_sid, obj);
    res.sendStatus(200);
  } catch (err) {
    logger.error({err}, 'Error performing Live Call Control');
    res.sendStatus(500);
  }
});

router.post('/park', async(req, res) => {
  const {logger} = req.app.locals;
  logger.debug({payload: req.body}, 'POST /dial/attended-transfer/park');
  try {
    const app = new WebhookResponse();
    app
      .enqueue({
        name: 'parking_slot_700'
      });
    res.status(200).json(app);
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(503);
  }
});

router.post('/complete-transfer', async(req, res) => {
  const {logger} = req.app.locals;
  logger.debug({payload: req.body}, 'POST /dial/attended-transfer/complete-transfer');
  try {
    const app = new WebhookResponse();
    app
      .dequeue({
        name: 'parking_slot_700'
      });
    res.status(200).json(app);
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(503);
  }
});

router.post('/drop', async(req, res) => {
  const {logger} = req.app.locals;
  logger.debug({payload: req.body}, 'POST /dial/attended-transfer/drop');
  try {
    const app = new WebhookResponse();
    app.hangup();
    res.status(200).json(app);
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(503);
  }
});

module.exports = router;
