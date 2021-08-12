const assert = require('assert');
assert.ok(process.env.JAMBONZ_ACCOUNT_SID, 'You must define the JAMBONZ_ACCOUNT_SID env variable');
assert.ok(process.env.JAMBONZ_API_KEY, 'You must define the JAMBONZ_API_KEY env variable');
assert.ok(process.env.JAMBONZ_REST_API_BASE_URL, 'You must define the JAMBONZ_REST_API_BASE_URL env variable');
assert.ok(process.env.WS_RECORD_PATH, 'You must define the WS_RECORD_PATH env variable');

const express = require('express');
const app = express();
const Websocket = require('ws');
const {WebhookResponse} = require('@jambonz/node-client');
const basicAuth = require('express-basic-auth');
const opts = Object.assign({
  timestamp: () => `, "time": "${new Date().toISOString()}"`,
  level: process.env.LOGLEVEL || 'info'
});
const logger = require('pino')(opts);
const {loadCredentials, calculateResponse} = require('./lib/utils')(logger);
const port = process.env.HTTP_PORT || 3000;
const routes = require('./lib/routes');
app.locals = {
  ...app.locals,
  logger,
  calculateResponse,
  client: require('@jambonz/node-client')(process.env.JAMBONZ_ACCOUNT_SID, process.env.JAMBONZ_API_KEY, {
    baseUrl: process.env.JAMBONZ_REST_API_BASE_URL
  })
};

/* set up a websocket server to receive audio from the 'listen' verb */
const {recordAudio} = require('./lib/utils')(logger);
logger.info(`setting up record path at ${process.env.WS_RECORD_PATH}`);
const wsServer = new Websocket.Server({ noServer: true });
wsServer.setMaxListeners(0);
wsServer.on('connection', recordAudio.bind(null, logger));
if (process.env.HTTP_USERNAME && process.env.HTTP_PASSWORD) {
  const users = {};
  users[process.env.HTTP_USERNAME] = process.env.HTTP_PASSWORD;
  app.use(basicAuth({users}));
}
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
if (process.env.WEBHOOK_SECRET) {
  app.use(WebhookResponse.verifyJambonzSignature(process.env.WEBHOOK_SECRET));
}
app.use('/', routes);
app.use((err, req, res, next) => {
  logger.error(err, 'burped error');
  res.status(err.status || 500).json({msg: err.message});
});

const server = app.listen(port, () => {
  logger.info(`Example jambonz app listening at http://localhost:${port}`);
});
server.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, (socket) => {
    if (request.url !== process.env.WS_RECORD_PATH) return socket.destroy();
    wsServer.emit('connection', socket, request);
  });
});

const readSipCredentialsFromGoogleSheet = async(logger) => {
  try {
    const credentials = await loadCredentials(logger);
    app.locals.credentials = credentials;
  } catch (err) {
    logger.error({err}, 'Error loading credentials, retry in 60 secs');
  }
  setTimeout(readSipCredentialsFromGoogleSheet.bind(null, logger), 60000);
};
if (process.env.GOOGLE_SHEET_ID && process.env.GOOGLE_SHEET_CREDENTIALS_FILE) {
  readSipCredentialsFromGoogleSheet(logger);
}
