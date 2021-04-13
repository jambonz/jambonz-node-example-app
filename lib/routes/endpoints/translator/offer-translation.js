const WebhookResponse = require('@jambonz/node-client').WebhookResponse;
const {TranslationServiceClient} = require('@google-cloud/translate');
const fs = require('fs');

module.exports = async(req, res) => {
  const {logger} = req.app.locals;
  const {languages} = require('../../../utils')(logger);
  const googleTts = languages.google.tts;
  const hints = googleTts.map((l) => l.name).flat();
  const serviceKey = JSON.parse(fs.readFileSync(process.env.GOOGLE_TRANSCRIBE_CREDENTIALS, 'utf8'));
  const client = new TranslationServiceClient({credentials: serviceKey});

  const speech = req.body.speech;
  logger.debug({payload: req.body}, '/translator/offer-translation');

  if ((!speech || !speech.is_final) && req.body.timeout !== true) {
    logger.debug({payload: req.body}, 'offer-translation: no response required');
    return res.sendStatus(200);
  }

  const {customerData} = req.body;
  if (!customerData || !customerData.language) res.sendStatus(200);
  let language = customerData.language;

  try {
    const app = new WebhookResponse();
    let readout;

    if (req.body.reason === 'inputTimeout') {
      logger.debug('got timeout');
      readout = 'I\'m sorry, I didn\'t get that.  Could you repeat please?';
      language = {language: 'en-US', voice: 'en-US-Wavenet-C'};
    }
    else {
      let transcript = speech.alternatives[0].transcript.toLowerCase();

      /* check for a request to switch languages, or to repeat last translation */
      const lang = googleTts.find((l) => l.name.find((n) => transcript.includes(n)));
      if (transcript.startsWith('repeat' || transcript.startsWith ('say again'))) {
        logger.debug('repeating last phrase');
        readout = customerData.lastTranslation;
      }
      else {
        const parent = `projects/${serviceKey.project_id}`;
        if (lang && (transcript.startsWith('switch to') || transcript.startsWith('say that in'))) {
          app.tag({
            data: Object.assign(customerData, {language: lang})
          });
          language = lang;
          transcript = customerData.lastRequest;
          logger.debug({language, transcript}, 'switching languages');
        }
        /*
        const [response] = await client.getSupportedLanguages({
          parent
        });
        logger.debug({response}, 'languages');
        */
        const [t] = await client.translateText({
          parent,
          contents: [transcript],
          mimeType: 'text/plain',
          sourceLanguageCode: 'en-US',
          targetLanguageCode: language.language
        });
        logger.debug({t}, 'translation');
        readout = t.translations[0].translatedText;
        app.tag({
          data: Object.assign(customerData, {
            lastTranslation: readout,
            lastRequest: transcript
          })
        });
      }
    }

    logger.debug({language, readout}, 'Now speaking');
    app.gather({
      input: ['speech'],
      actionHook: '/translator/offer-translation',
      timeout: 10,
      say: {
        text: readout,
        synthesizer: {
          vendor: 'google',
          language: language.language,
          voice: language.voice
        }
      },
      recognizer: {
        vendor: 'google',
        language: 'en-US',
        hints
      }
    });
    res.status(200).json(app);
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(503);
  }
};
