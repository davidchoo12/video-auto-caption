# video-auto-caption

Thie project contains Nodejs scripts which generate captions/subtitles for videos. It is done as a **winning** [submission for Hack&Roll 2018](https://devpost.com/software/video-auto-captioner-nsbekw) but it is by far from production ready. The only working file is captioner.js which only allows generating captions for videos under 1 minute. This is a limitation set by [Google Speech API Synchronous Speech Recognition](https://cloud.google.com/speech/docs/sync-recognize).

## Prerequisites

You will need to create a billing account on Google Cloud Platform in order to use the Speech API but accessing the API will be free up to a point. Check on https://cloud.google.com/speech/pricing

Go to https://cloud.google.com/speech/docs/quickstart and click on the "Set up a project" button. A JSON file containing the service account private key will be downloaded.

Set the environment variable for `GOOGLE_APPLICATION_CREDENTIALS` as the path string to the JSON file (https://cloud.google.com/docs/authentication/getting-started#setting_the_environment_variable).

Install [ffmpeg](https://www.ffmpeg.org/download.html) which is a dependency to [node-fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg).
Make sure you have PATH variable set for the install directory.

## Getting Started

### Installing

`npm install`

### Test run

`node captioner.js fox.mp4`

### Running

Currently, the only completely working file is `captioner.js`.

You can run it by

`node captioner.js input.mp4 output.mp4`

* `input.mp4` is be the file name of your source video you want to have it captioned (which should be in the project directory),

* `output.mp4` is optionally the file name of the output video.

* If `output.mp4` is omitted, the output file name defaults to `input-captioned.mp4` where `input` is the source video file name.

Keep in mind that the Speech API needs very clear speech audio. As of the duration of the hackathon, I estimated about 70% accuracy on speech recognition with poor recording environment.

## captioner.js

Here I will briefly explain what the code does.

1. It uses ffmpeg to extract out the audio from the video file and convert to single channel (limitation of Speech API) and save it to `sample.flac`.
2. Then it generates a `sample.srt` file (which is a subtitle file format) by sending the flac file over to the Speech API for it to detect words. The API will then return a list of words along with the corresponding timestamp of each word. It then chunks up words which are within 3 seconds apart and save it as a phrase into the srt file.
3. It again uses ffmpeg to combine the source video and the subtitle into a single file.

Note that the output video will have different codec from the source video. I still have yet to completely understand how ffmpeg works but hey its from a hackathon :p

4. Finally the code deletes the `sample.flac` file but I keep the `sample.srt` file. This way you can manually modify the srt file to correct wrongly identified words and use the ffmpeg command line to combine the srt file with a video file like `ffmpeg -i infile.mp4 -i infile.srt -c copy -c:s mov_text outfile.mp4` [source](https://stackoverflow.com/questions/8672809/use-ffmpeg-to-add-text-subtitles).

## Built With

* [Google Speech API](https://cloud.google.com/speech/docs/sync-recognize) - Speech Recognition
* [node-fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) - Fluent interface for FFMPEG
* [FFMPEG](https://www.ffmpeg.org) - Media manipulation

## Contributing

I will be honest, this project is littered with bugs and bad practices but hey its from a hackathon :p
So if you can understand my code and want to contribute, feel free to do so!

## Authors

* **David Choo** - *Quick 24 hour hack*

See also the list of non existing [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* The amazing Hack&Roll 2018 for giving me an opportunity to learn something new over the weekend.