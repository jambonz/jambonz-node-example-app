const router = require('express').Router();
const assert = require('assert');
const {readFile} = require('fs').promises;
const WebhookResponse = require('@jambonz/node-client').WebhookResponse;

router.post('/', async(req, res) => {
  const {logger} = req.app.locals;
  logger.debug({payload: req.body}, 'POST /dialogflow-test');
  try {
    assert(process.env.DIALOGFLOW_GOOGLE_CREDENTIALS_FILE);
    assert(process.env.DIALOGFLOW_PROJECT_ID);

    const gcreds = process.env.DIALOGFLOW_GOOGLE_CREDENTIALS_FILE;
    const path = gcreds.startsWith('/') ? gcreds : `${__dirname}/../../../${gcreds}`;
    const credentials = await readFile(path, {encoding: 'utf8'});

    const app = new WebhookResponse();
    app.dialogflow({
      project: process.env.DIALOGFLOW_PROJECT_ID,
      credentials,
      lang: 'en-US',
      welcomeEvent: process.env.DIALOGFLOW_WELCOME_INTENT,
      eventHook: '/dialogflow-events',
      actionHook: '/dialogflow-action'
    });
    res.status(200).json(app);
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(503);
  }
});

module.exports = router;
