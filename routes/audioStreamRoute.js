var express = require('express');
var router = express.Router();
var stream = require('stream');
var lame = require('lame');


router.post('/', function (req, res){
	// var s = new stream.readable();

	// // This needs to be set in order to work
	// s_read = function foo() {}

	// s.push(req.body.audio);
	// s.push(null);


	// var encoder = new lame.Encoder({
	//     // input
	// 	channels: 2,        // 2 channels (left and right)
	// 	bitDepth: 16,       // 16-bit samples
	// 	sampleRate: 44100,  // 44,100 Hz sample rate

	// 	// output
	// 	bitRate: 128,
	// 	outSampleRate: 22050,
	// 	mode: lame.STEREO // STEREO (default), JOINTSTEREO, DUALCHANNEL or MONO
	// });
	// var mp3;
	// s.pipe(encoder).pipe(mp3);
	// console.log(mp3);
})

// https://github.com/psaylor/sox-audio/blob/master/examples/transcode.js

/* Transcodes a raw input stream from 41k to 16k, streaming out a 16k wav file
	to outputPipe. Optionally pass useThrough = true to insert a through stream
	between the rawInputStream and the SoxCommand to count and print the bytes of data */
var transcodeRawStream = function(rawInputStream, outputSampleRate, outputPipe, useThrough) {
	useThrough = useThrough || false;
	var inputStream = rawInputStream;

	if (useThrough) {
		var throughStreamCounter = genThroughStreamCounter();
		rawInputStream.pipe(throughStreamCounter);
		inputStream = throughStreamCounter;
	}

	var command = SoxCommand();
	command.input(inputStream)
		.inputSampleRate(INPUT_SAMPLE_RATE)
		.inputEncoding('signed')
		.inputBits(16)
		.inputChannels(1)
		.inputFileType('raw')
		.output(outputPipe)
		.outputFileType('wav')
		.outputSampleRate(outputSampleRate);

	addStandardListeners(command);
	command.run();
};