const router = require('express').Router();
const WebhookResponse = require('@jambonz/node-client').WebhookResponse;

router.post('/', (req, res) => {
  const {logger} = req.app.locals;
  logger.debug({payload: req.body}, 'POST /dial/user');
  try {
    const app = new WebhookResponse();
    app
      .say({text: 'please hold while we connect you'})
      .dial({
        answerOnBridge: true,
        callerId: '+15083728299',
        target: [{type: 'user', number: 'daveh@daveh.sip.jambonz.me'}],
      });
    res.status(200).json(app);
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(503);
  }
});

router.post('/transcription', (req, res) => {
  res.sendStatus(200);
  const {logger} = req.app.locals;
  const payload = req.body;
  logger.info({payload}, '/dial/time/transcription');
});

router.post('/amd', (req, res) => {
  res.sendStatus(200);
  const {logger} = req.app.locals;
  const payload = req.body;
  logger.info({payload}, '/dial/time/amd');
});

module.exports = router;
