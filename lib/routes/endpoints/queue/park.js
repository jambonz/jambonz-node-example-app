const router = require('express').Router();
const WebhookResponse = require('@jambonz/node-client').WebhookResponse;
const short = require('short-uuid');
const translator = short();

router.post('/', (req, res) => {
  const MY_SLOT = translator.new();
  const {logger} = req.app.locals;
  logger.debug({payload: req.body}, `POST /park slot ${MY_SLOT}`);
  try {
    const app = new WebhookResponse();
    app
      .tag({
        data: {
          slot: MY_SLOT
        }
      })
      .enqueue({
        name: MY_SLOT,
        waitHook: '/queue/moh'
      });
    res.status(200).json(app);
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(503);
  }
});

module.exports = router;
