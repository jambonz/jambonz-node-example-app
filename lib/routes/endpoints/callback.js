const router = require('express').Router();
const WebhookResponse = require('@jambonz/node-client').WebhookResponse;

const doCallback = async(logger, client, phoneNumber) => {
  try {
    const sid = await client.calls.create({
      from: process.env.OUTBOUND_CALLER_ID,
      to: {
        type: 'phone',
        number: phoneNumber
      },
      call_hook: `${process.env.CALLBACK_BASE_URL}/callback-followup`,
      call_status_hook: `${process.env.CALLBACK_BASE_URL}/callback-followup`,
      timeout: 25,
      tag: {
        reason: 'callback'
      }
    });
    logger.info({sid}, 'launched callback call');
  } catch (err) {
    logger.error({err}, 'Error attempting callback');
  }
};

router.post('/', (req, res) => {
  const {logger, client} = req.app.locals;
  logger.debug({payload: req.body}, 'POST /callback');
  try {
    const app = new WebhookResponse();
    app
      .say({
        text: `Thanks for your call.  We will return your call to ${req.body.from} in 10 seconds`,
        earlyMedia: true
      })
      .pause({length: 1})
      .sip_decline({status: 603});
    res.status(200).json(app);

    setTimeout(doCallback.bind(null, logger, client, req.body.from), 10000);
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(503);
  }
});

module.exports = router;
