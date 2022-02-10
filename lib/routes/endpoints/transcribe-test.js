const router = require('express').Router();
const WebhookResponse = require('@jambonz/node-client').WebhookResponse;
const text = 'Hi there.  Please say something and I will try to transcribe it for you';

router.post('/', async(req, res) => {
  const {logger} = req.app.locals;
  logger.debug({payload: req.body}, 'POST /transcribe');

  try {
    const app = new WebhookResponse();
    app
      .play({url: 'silence_stream://1000'})
      .transcribe({
        transcriptionHook: '/transcribe/transcription',
        recognizer: {
          vendor: 'microsoft',
          language: 'en-US',
          profanityOption: 'masked',
          requestSnr: true,
          outputFormat: 'detailed'
        }
      });
    res.status(200).json(app);
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(503);
  }
});

router.post('/transcription', (req, res) => {
  const {logger} = req.app.locals;
  logger.debug({payload: req.body}, '/transcribe/transcription');
  res.sendStatus(200);
});

module.exports = router;
