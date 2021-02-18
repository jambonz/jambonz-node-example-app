const router = require('express').Router();
const WebhookResponse = require('@jambonz/node-client').WebhookResponse;

router.post('/', (req, res) => {
  const {logger} = req.app.locals;
  logger.debug({payload: req.body}, 'lex event');

  /**
   * if the intent has been confirmed and is ready for fulfillment, then hang up.
   * We could also do some fulfillment at this point (though we might prefer to do
   * that as part of the Lex app itself), prompt for another intent, or whatever..
  */
  if (req.body.event === 'intent') {
    const {sessionState} = req.body.data;
    if (sessionState.dialogAction.type === 'Close' &&
      sessionState.intent.intentState === 'ReadyForFulfillment' &&
      sessionState.intent.confirmationState === 'Confirmed') {

      logger.info('lex-event: hanging up call; intent has been confirmed');
      const app = new WebhookResponse();
      app.hangup();
      return res.status(200).json(app);
    }
  }
  res.sendStatus(200);
});

module.exports = router;
