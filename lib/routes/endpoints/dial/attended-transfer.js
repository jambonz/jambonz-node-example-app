const router = require('express').Router();
const WebhookResponse = require('@jambonz/node-client').WebhookResponse;

/**
 * This file provides an example of an attended transfer call scenario.
 * It uses the REST api to perform live call control and operates on both the
 * parent call as well as the child call.  The sequence of events is:
 *
 * - An A party dials B.
 * - A parks B in a queue, and then dials C.
 * - A and C speak, then A connects C to B by dequeing B.
 *
 * Note: the queue acts as a parking slot for B.  A parking slot is simply
 * a queue which only ever holds one member.  The simplest way to create
 * such a queue is to generate a unique name.  In this case, we simply use
 * the A party's call sid as the queue name, since it meets our requirements
 * of a globally unique queue name.  However, this is just an example, and we
 * could have equally well generated a unique temporary queue name, or maintained
 * a pool of "parking slots" that we chose from.
 */
const gatherTN = {
  actionHook: '/dial/attended-transfer/collect',
  input: ['digits'],
  finishOnKey: '#',
  numDigits: 11,
  timeout: 20,
  say: {
    text: 'Please enter the ten digit phone number you would like to dial, followed by the pound sign.'
  }
};

/**
 * simple application that prompts for and dials a telephone number
 */
router.post('/', (req, res) => {
  const {logger} = req.app.locals;
  logger.debug({payload: req.body, query: req.query}, 'POST /dial/attended-transfer');

  try {
    const app = new WebhookResponse();
    app.gather(gatherTN);
    res.status(200).json(app);
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(503);
  }
});

/**
 * Response from a gather verb
 * If the caller entered a telephone number, dial it
 */
router.post('/collect', (req, res) => {
  const {logger} = req.app.locals;
  const payload = req.body;
  logger.debug({payload}, 'POST /dial/attended-transfer/collect');
  try {
    const app = new WebhookResponse();
    if (payload.digits) {
      const tel = payload.digits.length === 10 ? `1${payload.digits}` : payload.digits;
      app
        .say({
          text:
          `<speak>
            Please hold while we connect you to <say-as interpret-as="characters">${payload.digits}</say-as>
          </speak>`
        })
        .dial({
          callerId: process.env.OUTBOUND_CALLER_ID || payload.from,
          answerOnBridge: true,
          dtmfCapture: ['*2', '*3'],
          dtmfHook: '/dial/attended-transfer/dtmf',
          target: [
            {
              type: 'phone',
              number: tel
            }
          ]
        });
    }
    else {
      app
        .say({text: 'Are you there?  We did not collect any input.'})
        .gather(gatherTN);
    }
    res.status(200).json(app);
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(503);
  }
});


/**
 * on dtmf entry during a call:
 *  *2 - park the connected call, prompt and dial a new number
 *  *3 - connect the called party to the parked call and drop ourselves
 */
router.post('/dtmf', async(req, res) => {
  const {logger, client} = req.app.locals;
  logger.debug({payload: req.body}, 'POST /dial/attended-transfer/dtmf');

  const dtmf = req.body.dtmf;
  let obj ;
  if ('*2' === dtmf) {
    obj = {
      child_call_hook: `/dial/attended-transfer/park?parkingSlot=${req.body.call_sid}`,
      call_hook: '/dial/attended-transfer'
    };
  }
  else if ('*3' === dtmf) {
    obj = {
      child_call_hook: `/dial/attended-transfer/complete-transfer?parkingSlot=${req.body.call_sid}`
    };
  }
  else return res.sendStatus(200);

  try {
    await client.calls.update(req.body.call_sid, obj);
    res.sendStatus(200);
  } catch (err) {
    logger.error({err}, 'Error performing Live Call Control');
    res.sendStatus(500);
  }
});

/**
 * "park" the call by putting it in the specified queue.
 * N.B.: a parking slot is simply a queue which only will ever have one member
 */
router.post('/park', async(req, res) => {
  const {logger} = req.app.locals;
  logger.debug({payload: req.body, query: req.query}, 'POST /dial/attended-transfer/park');

  try {
    const {parkingSlot} = req.query;
    const app = new WebhookResponse();
    app.enqueue({name: parkingSlot});
    res.status(200).json(app);
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(503);
  }
});

/**
 * Complete the attended transfer by connecting the dialed party
 * to the parked call
 */
router.post('/complete-transfer', async(req, res) => {
  const {logger} = req.app.locals;
  const payload = req.body;
  logger.debug({payload, query: req.query}, 'POST /dial/attended-transfer/complete-transfer');
  try {
    const {parkingSlot} = req.query;
    const app = new WebhookResponse();
    app.dequeue({name: parkingSlot});
    res.status(200).json(app);
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(503);
  }
});

module.exports = router;
