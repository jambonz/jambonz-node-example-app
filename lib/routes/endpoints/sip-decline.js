const router = require('express').Router();
const WebhookResponse = require('@jambonz/node-client').WebhookResponse;
router.post('/', (req, res) => {
  const app = new WebhookResponse();
  app.sip_decline({status: 480});
  res.status(200).json(app);
});

module.exports = router;
