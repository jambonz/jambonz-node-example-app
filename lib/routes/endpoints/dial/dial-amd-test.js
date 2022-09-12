const router = require('express').Router();
const WebhookResponse = require('@jambonz/node-client').WebhookResponse;
const greeting = `Hi there.  Please enter the phone number you wish to dial, 
followed by the hash key`;

router.post('/', (req, res) => {
  const {logger} = req.app.locals;
  logger.debug({payload: req.body}, 'POST /dial/amd-test');
  try {
    const app = new WebhookResponse();
    app
      .tag({data: {
        my_sid: req.body.call_sid
      }})
      .gather({
        actionHook: '/dial/amd-test/gather',
        say: {text: greeting},
        dtmfBargein: true,
        input: ['digits'],
        finishOnKey: '#',
        interDigitTimeout: 6,
        timeout: 20
      });
    res.status(200).json(app);
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(503);
  }
});

router.post('/gather', (req, res) => {
  const {logger} = req.app.locals;
  const payload = req.body;
  logger.debug({payload}, 'POST /dial/amd-test/gather');

  const app = new WebhookResponse();
  if (payload.digits && payload.digits.length > 8) {
    logger.debug(`Dialing ${payload.digits}`);
    app
      .say({text: `Please hold while we dial ${payload.digits}`})
      .dial({
        callerId: '+15083728299',
        target: [{type: 'phone', number: payload.digits}],
        amd: {
          actionHook: '/dial/amd-test/amd',
          thresholdWordCount: 7,
          recognizer: {
            vendor: 'google',
            language: 'en-US'
          }
        }
      });
  }
  else {
    app.say({text: 'I\'m sorry that is not a valid phone number.  Goodbye'});
  }
  res.status(200).json(app);
});

router.post('/amd', async(req, res) => {
  const {logger, client} = req.app.locals;

  const payload = req.body;
  logger.info({payload}, '/dial/time/amd');

  const {type, reason, customerData = {}} = payload;
  const {my_sid} = customerData;
  const app = new WebhookResponse();

  if (type === 'amd_machine_detected') {
    res.sendStatus(200);
    const r = reason === 'hint' ? 'spoken phrase' : 'long greeting';
    try {
      await client.calls.update(my_sid, {
        whisper: {
          verb: 'say',
          text: 'machine detected'
        }
      });
    } catch (err) {
      logger.error({err}, 'Error performing Live Call Control');
    }
    return;
  }
  else if (type === 'amd_human_detected') {
    res.sendStatus(200);
    try {
      await client.calls.update(my_sid, {
        whisper: {
          verb: 'say',
          text: 'Human detected'
        }
      });
    } catch (err) {
      logger.error({err}, 'Error performing Live Call Control');
    }
    return;
  }
  else if (type == 'amd_no_input') {
    app.say({text: 'We detected no speech from the called party.'});
  }
  else if (type === 'amd_decision_timeout') {
    app.say({text: 'We were not able to make a determination of human or machine.'});
  }
  else if (type === 'amd_machine_stopped_speaking') {
    res.sendStatus(200);
    try {
      await client.calls.update(my_sid, {
        whisper: {
          verb: 'say',
          text: 'Leave message now'
        }
      });
    } catch (err) {
      logger.error({err}, 'Error performing Live Call Control');
    }
    return;
  }
  else if (type === 'amd_tone_detected') {
    res.sendStatus(200);
    try {
      await client.calls.update(my_sid, {
        whisper: {
          verb: 'say',
          text: 'Beep detected'
        }
      });
    } catch (err) {
      logger.error({err}, 'Error performing Live Call Control');
    }
    return;
  }
  else {
    return res.sendStatus(200);
  }
  res.status(200).json(app);
});

module.exports = router;
