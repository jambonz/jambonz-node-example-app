const router = require('express').Router();

router.post('/', async(req, res) => {
  const {logger, client} = req.app.locals;
  logger.debug({payload: req.body}, 'lcc dtmf events');

  const dtmf = req.body.dtmf;
  const opts = {};

  switch (dtmf) {
    case '*2':
      Object.assign(opts, {mute_status: 'mute'});
      break;
    case '*3':
      Object.assign(opts, {mute_status: 'unmute'});
      break;
    case '*4':
      Object.assign(opts, {call_status: 'completed'});
      break;
    case '*5':
      Object.assign(opts, {child_call_hook: '/queue/park'});
      break;
    case '*6':
      Object.assign(opts, {
        whisper: {
          verb: 'say',
          text: 'You have 30 seconds remaining on this call.'
        }
      });
      break;
    default:
      return res.sendStatus(200);
  }

  try {
    await client.calls.update(req.body.call_sid, opts);
    res.sendStatus(200);
  } catch (err) {
    logger.error({err}, 'Error performing Live Call Control');
    res.sendStatus(500);
  }
});

module.exports = router;
