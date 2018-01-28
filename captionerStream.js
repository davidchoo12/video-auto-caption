const record = require('node-record-lpcm16');
const fs = require('fs');
// Imports the Google Cloud client library
const speech = require('@google-cloud/speech');

const projectId = 'test-2a5ec';

// Creates a client
const client = new speech.SpeechClient({
  projectId: projectId,
});

const encoding = 'FLAC';
const sampleRateHertz = 16000;
const languageCode = 'en-US';

const request = {
  config: {
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode,
  },
  interimResults: false, // If you want interim results, set this to true
};

// Create a recognize stream
const recognizeStream = client
  .streamingRecognize(request)
  .on('error', console.error)
  .on('data', data =>
    process.stdout.write(
      data.results[0] && data.results[0].alternatives[0]
        ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
        : `\n\nReached transcription time limit, press Ctrl+C\n`
    )
  );
// var file = fs.createWriteStream('test.flac', { encoding: 'binary' });
// Start recording and send the microphone input to the Speech API
record
  .start({
    sampleRateHertz: sampleRateHertz,
    // threshold: 0,
    // Other options, see https://www.npmjs.com/package/node-record-lpcm16#options
    verbose: true,
    recordProgram: 'sox', // Try also "arecord" or "sox"
    // silence: '10.0',
  })
  .on('error', console.error)
  .pipe(recognizeStream);

// setTimeout(function () {
//   record.stop()
// }, 10000);

console.log('Listening, press Ctrl+C to stop.');