const router = require('express').Router();
const WebhookResponse = require('@jambonz/node-client').WebhookResponse;

router.post('/', (req, res) => {
  const {logger} = req.app.locals;
  logger.debug({payload: req.body}, 'POST /dial-transcribe');
  try {
    const app = new WebhookResponse();
    app.dial({
      callerId: process.env.OUTBOUND_CALLER_ID,
      answerOnBridge: true,
      target: [
        {
          type: 'phone',
          number: req.body.to
        }
      ],
      transcribe: {
        transcriptionHook: '/call-transcriptions',
        recognizer: {
          vendor: 'google',
          language: 'en-US',
          altLanguages: ['es-ES'],
          interim: false,
          dualChannel: true,
          separateRecognitionPerChannel: true,
          enhancedModel: true,
          diarization: true,
          diarizationMinSpeakers: 1,
          diarizationMaxSpeakers: 2,
          interactionType: 'phone_call'
        }
      }
    });
    res.status(200).json(app);
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(503);
  }
});

module.exports = router;
