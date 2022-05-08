const router = require('express').Router();
const WebhookResponse = require('@jambonz/node-client').WebhookResponse;
const text = 'Hi there.  Please say something and I will try to transcribe it for you';

router.post('/', async(req, res) => {
  const {logger} = req.app.locals;
  logger.debug({payload: req.body}, 'POST /gather');

  try {
    const app = new WebhookResponse();
    app
      .gather({
        input: ['speech'],
        actionHook: '/gather/action',
        timeout: 10,
        say: { text: 'Please say something or other and I will repeat what you said' },
        recognizer: {
          vendor: 'default',
          language: 'default',
          vad: {
            enable: true,
            mode: 2
          }
        }
      })
      .redirect({actionHook: '/gather'});
    res.status(200).json(app);
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(503);
  }
});

router.post('/action', (req, res) => {
  const {logger} = req.app.locals;
  logger.debug({payload: req.body}, '/gather/action');
  const app = new WebhookResponse();
  if (req.body.speech) {
    app.say({text: `You said: ${req.body.speech.alternatives[0].transcript}`});
  }
  app.redirect({actionHook: '/gather'});
  res.status(200).json(app);
});

module.exports = router;
