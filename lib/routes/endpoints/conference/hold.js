const router = require('express').Router();
const WebhookResponse = require('@jambonz/node-client').WebhookResponse;
const text = `
You have been placed on brief hold while we try to find a team member to help you.
We shall search far and wide to find just the right person for you.
So please do continue to wait just a bit longer, if you would.`;

router.post('/', (req, res) => {
  const {logger} = req.app.locals;
  logger.debug({payload: req.body, query: req.query}, 'POST /conference/hold');

  try {
    const app = new WebhookResponse();
    app
      .say({text})
      .pause({length: 10});
    res.status(200).json(app);
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(503);
  }
});

module.exports = router;
