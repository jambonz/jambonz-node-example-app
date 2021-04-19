require('dotenv').config();
const express = require('express');
const app = express();
const {WebhookResponse} = require('@jambonz/node-client');
const basicAuth = require('express-basic-auth');
const opts = Object.assign({
  timestamp: () => {
    return `, "time": "${new Date().toISOString()}"`;
  }
}, {
  level: process.env.LOGLEVEL || 'info'
});
const logger = require('pino')(opts);
const credentials = new Map();
const {loadCredentials, calculateResponse} = require('./lib/utils')(logger);
const port = process.env.HTTP_PORT || 3000;
const routes = require('./lib/routes');

Object.assign(app.locals, {
  logger,
  credentials,
  calculateResponse,
  client: require('@jambonz/node-client')(process.env.JAMBONZ_ACCOUNT_SID, process.env.JAMBONZ_API_KEY, {
    baseUrl: process.env.JAMBONZ_REST_API_BASE_URL
  })
});

/*
if (process.env.HTTP_USERNAME && process.env.HTTP_PASSWORD) {
  const users = {};
  users[process.env.HTTP_USERNAME] = process.env.HTTP_PASSWORD;
  app.use(basicAuth({users}));
}
*/
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

app.listen(port, () => {
  logger.info(`Example jambonz app listening at http://localhost:${port}`);
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
readSipCredentialsFromGoogleSheet(logger);

