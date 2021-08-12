var AWS      = require('aws-sdk') ;
var S3Stream = require('s3-upload-stream');
const Websocket = require('ws');
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

  const languages = {
    google: {
      tts: [
        {name: ['arabic'], language: 'ar', voice: 'ar-XA-Wavenet-A'},
        {name: ['czech', 'check'], language: 'cs-CZ', voice: 'cs-CZ-Wavenet-A'},
        {name: ['danish', 'denmark'], language: 'da-DK', voice: 'da-DK-Standard-A'},
        {name: ['dutch', 'netherlands'], language: 'nl-NL', voice: 'nl-NL-Wavenet-A'},
        {name: ['filipino', 'phillipines'], language: 'fil-PH', voice: 'fil-PH-Wavenet-A'},
        {name: ['finish', 'finland'], language: 'fi-FI', voice: 'fi-FI-Wavenet-A'},
        {name: ['french', 'france'], language: 'fr-FR', voice: 'fr-FR-Wavenet-A'},
        {name: ['german', 'germany'], language: 'de-DE', voice: 'de-DE-Wavenet-A'},
        {name: ['greek', 'greece'], language: 'el-GR', voice: 'el-GR-Wavenet-A'},
        {name: ['hindi', 'hindu', 'india'], language: 'hi-IN', voice: 'hi-IN-Wavenet-A'},
        {name: ['hungarian', 'hungary'], language: 'hu-HU', voice: 'hu-HU-Wavenet-A'},
        {name: ['indonesia', 'indonesian'], language: 'id-ID', voice: 'id-ID-Wavenet-A'},
        {name: ['italian', 'italy'], language: 'it-IT', voice: 'it-IT-Wavenet-A'},
        {name: ['japanese', 'japan'], language: 'ja-JP', voice: 'ja-JP-Wavenet-A'},
        {name: ['korean', 'south korea', 'north korea'], language: 'ko-KR', voice: 'ko-KR-Wavenet-A'},
        {name: ['mandarin', 'chinese'], language: 'cmn-CN', voice: 'cmn-CN-Wavenet-A'},
        {name: ['norwegian', 'norway'], language: 'nb-NO', voice: 'nb-NO-Wavenet-A'},
        {name: ['polish', 'poland'], language: 'pl-PL', voice: 'pl-PL-Wavenet-A'},
        {name: ['brazil'], language: 'pt-BR', voice: 'pt-BR-Wavenet-A'},
        {name: ['portuguese', 'portugal'], language: 'pt-PT', voice: 'pt-PT-Wavenet-A'},
        {name: ['russian', 'russia'], language: 'ru-RU', voice: 'ru-RU-Wavenet-A'},
        {name: ['slovakian', 'slovakia'], language: 'sk-SK', voice: 'sk-SK-Wavenet-A'},
        {name: ['spanish', 'spain'], language: 'es-ES', voice: 'es-ES-Standard-A'},
        {name: ['swedish', 'sweden'], language: 'sv-SE', voice: 'sv-SE-Wavenet-A'},
        {name: ['turkish', 'turkey'], language: 'tr-TR', voice: 'tr-TR-Wavenet-A'},
        {name: ['ukraine', 'ukranian'], language: 'uk-UA', voice: 'uk-UA-Wavenet-A'},
        {name: ['vietnamese', 'vietnam'], language: 'vi-VN', voice: 'vi-VN-Wavenet-A'}
      ]
    }
  };

  const recordAudio = async(logger, socket) => {
    socket.on('message', function(data) {
      /* first message is a JSON object containing metadata about the call */
      try {
        socket.removeAllListeners('message');
        const metadata = JSON.parse(data);
        logger.info({metadata}, 'received metadata');
        const {callSid, accountSid, applicationSid, from, to, callId} = metadata;
        let md = {
          callSid,
          accountSid,
          applicationSid,
          from,
          to,
          callId
        };
        if (metadata.parent_call_sid) md = {...md, parent_call_sid: metadata.parent_call_sid};
        const s3Stream = new S3Stream(new AWS.S3());
        const upload = s3Stream.upload({
          Bucket: process.env.RECORD_BUCKET,
          Key: `${metadata.callSid}.L16`,
          ACL: 'public-read',
          ContentType: `audio/L16;rate=${metadata.sampleRate};channels=${metadata.mixType === 'stereo' ? 2 : 1}`,
          Metadata: md
        });
        upload.on('error', function(err) {
          logger.error({err}, `Error uploading audio to ${process.env.RECORD_BUCKET}`);
        });
        const duplex = Websocket.createWebSocketStream(socket);
        duplex.pipe(upload);
      } catch (err) {
        logger.error({err}, `Error starting upload to bucket ${process.env.RECORD_BUCKET}`);
      }
    });
    socket.on('error', function(err) {
      logger.error({err}, 'recordAudio: error');
    });
  };

  return {
    recordAudio,
    loadCredentials,
    calculateResponse,
    languages
  };
};
