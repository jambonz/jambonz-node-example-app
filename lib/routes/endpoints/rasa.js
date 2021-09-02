const router = require('express').Router();
const assert = require('assert');
const WebhookResponse = require('@jambonz/node-client').WebhookResponse;

router.post('/', async(req, res) => {
  const {logger} = req.app.locals;
  logger.debug({payload: req.body}, 'POST /rasa');
  try {
    assert(process.env.RASA_URL);

    const app = new WebhookResponse();
    app.rasa({
      url: process.env.RASA_URL,
      prompt: 'Hello there!  What can I do for you today?',
      eventHook: '/rasa/event',
      actionHook: '/rasa/action'
    });

    res.status(200).json(app);
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(503);
  }
});

router.post('/event', async(req, res) => {
  const {logger} = req.app.locals;
  const payload = req.body;
  logger.debug({payload}, 'POST /rasa/event');
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

router.post('/action', async(req, res) => {
  const {logger} = req.app.locals;
  logger.debug({payload: req.body}, 'POST /rasa/action');
  try {

    res.sendStatus(200);
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(503);
  }
});

module.exports = router;
