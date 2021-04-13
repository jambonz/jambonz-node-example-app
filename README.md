# jambonz-node-example-app

An example jambonz application built using [@jambonz/node-client](https://www.npmjs.com/package/@jambonz/node-client).

The application requires environment variables to be set in order to operate.  The necessary environmebt variables are defined in the sections below.

This application exposes the following endpoints

### `/auth`
A [registration webhook](https://docs.jambonz.org/register-hook/) that authenticates sip users against a roster (of realm. username, password) that is stored in a google sheet.  The sheet should contain 3 columns labeled 'realm', 'user', and 'password' (in that order) with each row containing the credentials for a single user.

The following environment variables are required:
- GOOGLE_SHEET_ID - the long piece of opaque data at the end of the URL link
- GOOGLE_SHEET_CREDENTIALS_FILE - path to a google credentials file that authorizes you to access the sheet

### `/call-status`
Simply logs call status events that are posted from jambonz.

### `dialogflow-test`
An application that connects a call to to a dialogflow project and can perform call transfer.

The following environment variables are required:
- DIALOGFLOW_GOOGLE_CREDENTIALS_FILE - path to google json key authenticating you to access the dialogflow agent
- DIALOGFLOW_PROJECT_ID - identifies which project to connect to
- DIALOGFLOW_WELCOME_INTENT - initial intent name to trigger when call arrives

### `/lex-test`
An application that connects a call to to an AWS Lex bot.

The following environment variables are required (self-explanatory):
- LEX_BOT_ID
- LEX_BOT_ALIAS_ID
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_REGION

### `/lcc-test`
An application that illustrates the use of the '`dial` verb and then allows the user to modify the call while in progress by pressing dtmf keys to mute, unmute, hangup, play a whisper prompt to the caller, or redirect to a new application.

The following environment variables are required:
- OUTBOUND_CALLER_ID caller id to use on outbound call leg (in case required by your sip trunking provider)

### `/tts-test`
An application that shows how to use text to speech to speak to the caller.

### `/callback`
An application that answers a call, plays a brief message and hangs up, then makes an outbound callback to the user, demonstrating the use making an outbound call through the REST api.

The following environment variables are required:
- CALLBACK_BASE_URL - the base URL to embed in the call_hook property of the POST to create an outbound call

### /translator
An application that uses Google Translate to translate your sentences into the language of your choice.

The following environment variables are required:
- GOOGLE_TRANSCRIBE_CREDENTIALS - path to a google json key file used to authenticate to Google Translate.