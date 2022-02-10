const router = require('express').Router();
const assert = require('assert');
const WebhookResponse = require('@jambonz/node-client').WebhookResponse;

router.post('/', async(req, res) => {
  const {logger} = req.app.locals;
  logger.debug({payload: req.body}, 'POST /cognigy');
  try {
    assert(process.env.COGNIGY_URL);
    assert(process.env.COGNIGY_TOKEN);

    const app = new WebhookResponse();
    app.cognigy({
      url: process.env.COGNIGY_URL,
      token: process.env.COGNIGY_TOKEN,
      actionHook: '/cognigy/action',
      data: {
        foo: 'bar'
      }
    });

    res.status(200).json(app);
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(503);
  }
});

router.post('/action', async(req, res) => {
  const {logger} = req.app.locals;
  logger.debug({payload: req.body}, 'POST /cognigy/action');
  res.sendStatus(200);
});

module.exports = router;

/*
router.post('/event', async(req, res) => {
  const {logger} = req.app.locals;
  const payload = req.body;
  logger.debug({payload}, 'POST /cognigy/event');
  try {
    if (payload.event === 'userMessage' && payload.message.includes('agent')) {
      const app = new WebhookResponse();
      app.say({text: 'Please hold while we connect you to an agent'});
      return res.status(200).json(app);
    }
    res.sendStatus(200);
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(503);
  }
});
*/
