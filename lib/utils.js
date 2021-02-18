const crypto = require('crypto');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
let sheet;

module.exports = (logger) => {
  const loadCredentials = async() => {
    const credentials = new Map();

    const gcreds = process.env.GOOGLE_SHEET_CREDENTIALS_FILE;
    const path = gcreds.startsWith('/') ? gcreds : `${__dirname}/../${gcreds}`;
    await doc.useServiceAccountAuth(require(path));
    await doc.loadInfo();
    sheet = await doc.sheetsByIndex[0];
    const rows = await sheet.getRows();
    rows.forEach((row) => {
      const {realm, user, password} = row;
      logger.debug({realm, user, password}, 'read sip credential');
      credentials.set(`${row.realm}:${row.user}`, row.password);
    });
    return credentials;
  };

  const calculateResponse = ({username, realm, method, nonce, uri, nc, cnonce, qop}, password) => {
    const ha1 = crypto.createHash('md5');
    ha1.update([username, realm, password].join(':'));
    const ha2 = crypto.createHash('md5');
    ha2.update([method, uri].join(':'));

    // Generate response hash
    const response = crypto.createHash('md5');
    const responseParams = [
      ha1.digest('hex'),
      nonce
    ];

    if (cnonce) {
      responseParams.push(nc);
      responseParams.push(cnonce);
    }

    if (qop) {
      responseParams.push(qop);
    }
    responseParams.push(ha2.digest('hex'));
    response.update(responseParams.join(':'));

    return response.digest('hex');
  };

  return {
    loadCredentials,
    calculateResponse
  };
};
