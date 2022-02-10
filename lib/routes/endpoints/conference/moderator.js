const router = require('express').Router();
const WebhookResponse = require('@jambonz/node-client').WebhookResponse;

router.post('/', (req, res) => {
  const {logger} = req.app.locals;
  logger.debug({payload: req.body, query: req.query}, 'POST /conference/moderator');

  try {
    const app = new WebhookResponse();
    app
      .say({text: 'we will now begin the conference'})
      .conference({
        name: process.env.CONFERENCE_NAME || 'test-conf',
        statusEvents: [
          'start',
          'end',
          'join',
          'leave'
        ],
        statusHook:'/conference/status',
        startConferenceOnEnter: true,
        endConferenceOnExit:true,
        record: {
          url: 'http://foo.bar'
        }
      });
    res.status(200).json(app);
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(503);
  }
});

module.exports = router;
