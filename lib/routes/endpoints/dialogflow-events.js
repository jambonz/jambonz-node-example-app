const router = require('express').Router();
const WebhookResponse = require('@jambonz/node-client').WebhookResponse;

router.post('/', (req, res) => {
  const {logger} = req.app.locals;
  logger.debug({payload: req.body}, 'dialogflow event');

  try {

    /* check to see if we got a call transfer request -- if so, dial out to the agent */
    if (req.body.event === 'intent') {
      const qo = req.body.data.query_result;
      const transfer = qo.fulfillment_messages
        .find((fm) => fm.platform === 'TELEPHONY' && fm.telephony_transfer_call);
      if (transfer) {
        const app = new WebhookResponse();
        app
          .say({text: 'Please hold while we transfer your call'})
          .dial({
            callerId: process.env.DIALOGFLOW_CALL_TRANSFER_CALLER_ID,
            target: [
              {
                type: 'phone',
                number: transfer.telephony_transfer_call.phone_number
              }
            ]
          });
        return res.status(200).json(app);
      }
    }
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(500);
  }
});

module.exports = router;
