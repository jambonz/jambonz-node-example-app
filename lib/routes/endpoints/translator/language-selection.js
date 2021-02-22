const WebhookResponse = require('@jambonz/node-client').WebhookResponse;

module.exports = (req, res) => {
  const {logger} = req.app.locals;
  const {languages} = require('../../../utils')(logger);
  const googleTts = languages.google.tts;
  const speech = req.body.speech;
  logger.debug({speech}, '/translator/language-selection');

  if (!speech || !speech.is_final) return res.sendStatus(200);

  try {
    const transcript = speech.alternatives[0].transcript.toLowerCase();
    const lang = googleTts.find((l) => l.name.find((n) => transcript.includes(n)));
    if (!lang) {
      logger.info('no language detected');
      return res.sendStatus(200);
    }

    const app = new WebhookResponse();
    app
      .tag({
        data: {
          language: lang
        }
      })
      .gather({
        input: ['speech'],
        actionHook: '/translator/offer-translation',
        timeout: 10,
        say: {
          text:
            `OK, you selected ${lang.name[0]}.
            Now, just speak the sentence you want translated, and when you pause 
            I will speak it back to you, in ${lang.name[0]}`.replace('\n', '')
        },
        recognizer: {
          vendor: 'google',
          language: 'en-US'
        }

      });
    res.status(200).json(app);
  } catch (err) {
    logger.error({err}, 'Error');
    res.sendStatus(503);
  }
};

