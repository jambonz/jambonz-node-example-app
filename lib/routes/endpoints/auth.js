const router = require('express').Router();

/**
 * authenticate sip user by reading from a roster of users
 * kept in a google sheet
 */
router.post('/', async(req, res) => {
  const {logger, credentials, calculateResponse} = req.app.locals;
  try {
    const {realm, username} = req.body;
    const key = `${realm}:${username}`;
    if (!credentials.has(key)) {
      logger.info({payload: req.body}, 'Unknown user attempted to authenticate');
      return res.json({status: 'fail', msg: 'unknown user'});
    }
    const myResponse = calculateResponse(req.body, credentials.get(key));
    if (myResponse === req.body.response) {
      logger.info({payload: req.body}, 'sip user successfully authenticated');
      return res.json({status: 'ok'});
    }
    logger.info(`invalid password supplied for ${username}`);
  } catch (err) {
    logger.error({err}, 'Error authenticating');
    res.send({status: 'fail', msg: err.message});
  }
});

module.exports = router;
