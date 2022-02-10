const router = require('express').Router();
const WebhookResponse = require('@jambonz/node-client').WebhookResponse;
const text = 'Please hold while we transfer you to an agent';

router.post('/', (req, res) => {
  const {logger} = req.app.locals;
  logger.debug({payload: req.body}, 'POST /refer');
  try {
    const app = new WebhookResponse();
    app
      .pause({length: 1.5})
      .say({text})
      .sip_refer({
        referTo: process.env.REFER_TO_NUMBER,
        actionHook: '/refer/action',
        eventHook: '/refer/event'
      });
    res.status(200).json(app);
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(503);
  }
});

router.post('/action', (req, res) => {
  const {logger} = req.app.locals;
  logger.debug({payload: req.body}, 'POST /refer/action');
  res.sendStatus(200);
});

router.post('/event', (req, res) => {
  const {logger} = req.app.locals;
  logger.debug({payload: req.body}, 'POST /refer/event');
  res.sendStatus(200);
});


module.exports = router;
