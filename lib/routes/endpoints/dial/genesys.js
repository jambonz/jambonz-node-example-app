const router = require('express').Router();
const WebhookResponse = require('@jambonz/node-client').WebhookResponse;
const axios = require('axios');
// eslint-disable-next-line max-len
const apiKey = 'XXXX38383838383fef4870f6c12b2ddeef57540ca973c11de02e055a1eb64ab06b602012d991815fa9fd5005b6b45addbd223e681c938d49226916c39d0f';
const URLToken = 'XXXXX9dbb43838338e3126e7f99645bf5438ecf0b2f05b235ecbb270791fa85d74486';
const baseURL = 'https://foo.bar';

router.post('/', (req, res) => {
  const {logger} = req.app.locals;
  const {call_sid} = req.body;
  logger.debug({payload: req.body, call_sid}, 'POST /dial/gensys');
  try {
    const app = new WebhookResponse();
    app
      .dial({
        callerId: '+447441444111',
        answerOnBridge: true,
        target: [
          {
            type: 'phone',
            number: '+4999999999991',
            trunk: 'Genesys Cloud',
            headers: {
              'User-To-User': `01${call_sid};encoding=ascii`
            }
          }
        ],
        transcribe: {
          transcriptionHook: '/dial/genesys/transcribe',
          recognizer: {
            vendor: 'microsoft',
            outputFormat: 'simple',
            hints: ['Genesys', 'IVR', 'agent', 'queue', 'iphone']
          }
        },
        listen: {
          url: '/record',
          mixType: 'stereo',
          metadata: {
            botSessionId: call_sid,
            originalCallerNumber: req.body.from,
            originalCalledNumber: req.body.to
          }
        }
      });
    res.status(200).json(app);
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(503);
  }
});

router.post('/transcribe', (req, res) => {
  const {logger} = req.app.locals;
  const {speech, call_sid} = req.body;
  logger.debug({speech}, 'POST /dial/gensys/transcribe');
  res.sendStatus(200);

  if (speech.is_final && speech.alternatives.length) {
    const text = speech.alternatives[0].transcript;
    logger.info(`injecting ${text}`);
    axios({
      method: 'POST',
      url: '/new/v2.0/endpoint/inject',
      baseURL,
      headers: { 'X-API-Key': apiKey},
      data: {
        userId: call_sid,
        text,
        URLToken,
        sessionId: call_sid
      }
    })
      .then((response) => {
        return logger.info({data: response.data}, `got response ${response.status}`);
      })
      .catch((err) => {
        logger.info({err}, 'Error');
      });
  }
});

module.exports = router;
