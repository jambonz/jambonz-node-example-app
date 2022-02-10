const router = require('express').Router();
const WebhookResponse = require('@jambonz/node-client').WebhookResponse;
const greeting = 'Hi there.  Please hold while we connect you to a PBX using g7 11 a law';

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
        target: [
          {
            type: 'phone',
            number: '441234567890',
            trunk: 'Vibe 3cx'
          }
        ]
      });
    res.status(200).json(app);
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(503);
  }
});

module.exports = router;
