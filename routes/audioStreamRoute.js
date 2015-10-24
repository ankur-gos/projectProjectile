var express = require('express');
var router = express.Router();
var stream = require('stream');
var lame = require('lame');
var watson = require('watson-developer-cloud');
var speech_to_text = watson.speech_to_text({
	username: '6229e6da-c9da-4f01-8d81-3d0c541d622d',
	password: '3W5AajrPIEXp',
	version: 'v1'
})


router.post('/', function (req, res){
	var s = new stream.readable();

	// This needs to be set in order to work
	s_read = function foo() {}

	s.push(req.body.audio);
	s.push(null);

	var wavFile;
	transcodeRawStream(s, 16000, wavFile, true)
	speech_to_text.createSession({}, function(err, session) {
		if (err)
			console.log('error:', err);
		else{
			console.log(JSON.stringify(session, null, 2));
			if(isWatsonSpeechAvailable(session)){
				recognizeSpeech(wavFile, session);
			}
		}
	});


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

var recognizeSpeech = function(wavStream, session) {
	var params = {
		session: session,
		audio: wavStream,
		content_type: 'audio/wav'
	}

	speech_to_text.recognize(params, function(err, script){
		if(err)
			console.log(err);
		else{
			console.log(JSON.stringify(transcript, null, 2));
			return parseTranscription(transcript);
		}
	})
}

var parseTranscription = function (script){
	var endResult = '';
	for(var i = 0; i < script.results.length; i++){
		var result = script.results[i];
		for(var j = 0; j < result.alternatives.length; j++){
			endResult = endResult + result.alternatives[j].transcript;
		}
	}
	console.log(endResult);
	return endResult;
}

var isWatsonSpeechAvailable = function(session) {
	speech_to_text.getRecognizeStatus({ session_id:'{session_id}'},
										function(err, status) {
		if (err) {
			console.log('error:', err);
			return false;
		}
		else {
			console.log(JSON.stringify(status, null, 2));
			if( status.state === 'initialized')
				return true;
			return false;
		}

	});
}

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
		.inputSampleRate(9600)
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

module.exports = router;