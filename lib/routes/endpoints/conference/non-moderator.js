const router = require('express').Router();
const WebhookResponse = require('@jambonz/node-client').WebhookResponse;

const conferenceHold = async(logger, client, call_sid, hold) => {
  try {
    logger.info(`sending conf_hold_status ${hold}`);
    await client.calls.update(call_sid, {
      conf_hold_status: hold ? 'hold' : 'unhold',
      wait_hook : '/conference/hold'
    });
  } catch (err) {
    logger.error({err}, 'Error placing conference participant on hold');
  }
};

router.post('/', (req, res) => {
  const {logger, client} = req.app.locals;
  logger.debug({payload: req.body, query: req.query}, 'POST /conference/non-moderator');

  try {
    const app = new WebhookResponse();
    app
      .say({text: 'Your conference will begin when the moderator arrives'})
      .conference({
        name: process.env.CONFERENCE_NAME || 'test-conf',
        statusEvents: [
          'start',
          'end',
          'join',
          'leave'
        ],
        statusHook:'/conference/status',
        startConferenceOnEnter: false,
        endConferenceOnExit: false
      });
    res.status(200).json(app);

    const fn = conferenceHold.bind(null, logger, client, req.body.call_sid);
    setTimeout(() => {
      logger.debug('time to mute party');
      fn(true);
      setTimeout(() => {
        logger.debug('time to unmute party');
        fn(false);
      }, 5000);
    }, 10000);
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(503);
  }
});

module.exports = router;
