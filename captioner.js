// Imports the Google Cloud client library
const speech = require('@google-cloud/speech');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');

// The name of the audio file to transcribe
const videoFileName = process.argv[2] || './magic.mp4';
const audioFileName = './sample.flac';
const srtFileName = './sample.srt';
const outVideoFileName = process.argv[3] || videoFileName + '-captioned.mp4'
// fs.writeFileSync(audioFileName);
// fs.writeFileSync(srtFileName);


function convert(input, output, callback) {
  ffmpeg(input)
      .audioChannels(1)
      .output(output)
      .on('end', function() {                    
          console.log('conversion ended');
          callback(null);
      }).on('error', function(err){
          console.log('error: ', err);
          callback(err);
      }).run();
}

convert(videoFileName, audioFileName, function(err){
  if(!err) {
    console.log('conversion complete');
    generateSrt(videoFileName, audioFileName, srtFileName);
  }
});

// Your Google Cloud Platform project ID
const projectId = 'test-2a5ec';

// Creates a client
const client = new speech.SpeechClient({
  projectId: projectId,
});


function generateSrt(vidName, audName, srtName) {

  // Reads a local audio file and converts it to base64
  const file = fs.readFileSync(audName);
  const audioBytes = file.toString('base64');

  // The audio file's encoding, sample rate in hertz, and BCP-47 language code
  const audio = {
    content: audioBytes,
    // uri: 'gs://flac-bucket/sample.flac'
  };
  const config = {
    encoding: 'FLAC',
    sampleRateHertz: 48000,
    languageCode: 'en-US',
    enableWordTimeOffsets: true
  };
  const request = {
    audio: audio,
    config: config,
  };

  let currStart, currEnd;
  let currIndex = 1;
  let currString = [];
  // Detects speech in the audio file
  client
    .recognize(request)
    // .then(data => {
    //   const operation = data[0];
    //   // Get a Promise representation of the final result of the job
    //   return operation.promise();
    // })
    .then(data => {
      const out = fs.createWriteStream(srtName);
      data[0].results[0].alternatives[0].words.forEach(w => {
        const startNanos = w.startTime.nanos / 100000000;
        const endNanos = w.endTime.nanos / 100000000;
        const startSecs = `${w.startTime.seconds}.${startNanos}`;
        const endSecs = `${w.endTime.seconds}.${endNanos}`;
        if(typeof(currStart) == 'undefined')
          currStart = startSecs;
        if(startSecs <= parseFloat(currStart) + 3) { // current chunk
          currString.push(w.word);
        } else { // start new chunk
          const chunk = `${currIndex}\n` +
            `${secToHhmmssms(currStart)} --> ${secToHhmmssms(currEnd)}\n` +
            `${currString.join(' ')}\n\n`;
          out.write(chunk);
          currString = [w.word];
          currStart = startSecs;
          currIndex++;
        }
        currEnd = endSecs;
      });
      // last chunk
      const chunk = `${currIndex}\n` +
        `${secToHhmmssms(currStart)} --> ${secToHhmmssms(currEnd)}\n` +
        `${currString.join(' ')}`;
      out.write(chunk);
      out.end();
      out.on('finish', () => {
        console.log('srt generated');
        combineSrt(vidName, srtName);
      });
      // console.log('srt generated');
      // combineSrt(vidName, srtName);
      // deleteFiles();
      // const response = data[0];
      // const transcription = response.results
      //   .map(result => result.alternatives[0].transcript)
      //   .join('\n');
      // console.log(`Transcription: ${transcription}`);
    })
    // .then(() => combineSrt(vidName, srtName))
    // .then(() => deleteFiles())
    .catch(err => {
      console.error('ERROR:', err);
    });

  function secToHhmmssms(sec) {
    const ms = sec.substr(-1);
    const h = Math.floor(sec / 3600).toString().padStart(2, '0');
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s},${ms}00`;
  }
}

function combineSrt(vidName, srtName) {
  ffmpeg(vidName)
    .outputOptions('-vf subtitles=' + srtName)
    .output(outVideoFileName)
    .on('end', () => {
      console.log('srt combined');
      deleteFiles();
    })
    .run();
}

function deleteFiles() {
  if(fs.existsSync(audioFileName))
    fs.unlinkSync(audioFileName);
  // if(fs.existsSync(srtFileName))
  //   fs.unlinkSync(srtFileName);
}