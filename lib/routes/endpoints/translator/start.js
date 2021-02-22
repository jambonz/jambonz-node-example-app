const WebhookResponse = require('@jambonz/node-client').WebhookResponse;
const prompt = `
<speak>
<break time=\"750ms\"/>
Hi there. I can speak many languages and would be happy to translate English sentences or phrases 
into another language for you. 
Tell me, what language would you like a translation for?
</prosody>
</speak>`;

module.exports = (req, res) => {
  const {logger} = req.app.locals;
  const {languages} = require('../../../utils')(logger);
  const hints = languages.google.tts.map((l) => l.name).flat();
  logger.debug({payload: req.body}, 'POST /translator');

  try {
    const app = new WebhookResponse();
    app
      .play({url: 'silence_stream://1000'})
      .gather({
        input: ['speech'],
        actionHook: '/translator/language-selection',
        timeout: 10,
        say: {
          text: prompt.replace('\n', '')
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

