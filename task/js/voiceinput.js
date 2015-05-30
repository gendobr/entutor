



var initAudioApi = function (options) {

    


    tutor.inputs.audioapi = {};
    
    tutor.inputs.audioapi.options=options || {};

    tutor.inputs.audioapi.soundScrorerURL=tutor.inputs.audioapi.options.soundScrorerURL||"voiceinputscorer.php";

    tutor.inputs.audioapi.drawAnimationFrameFactory = function (canvas) {
        if (tutor.inputs.audioapi.animationFrame) {
            window.cancelAnimationFrame(tutor.inputs.audioapi.animationFrame);
        }


        var canvasWidth = canvas.width;
        var canvasHeight = canvas.height;
        var analyserContext = canvas.getContext('2d');
        var scaleY = 0.7 * canvasHeight / 255.0;

        var drawAnimationFrame = function (time) {
            // analyzer draw code here
            {
                var SPACING = 5;
                var BAR_WIDTH = 3;

                var numBars = Math.round(canvasWidth / SPACING);
                var freqByteData = new Uint8Array(tutor.inputs.audioapi.analyserNode.frequencyBinCount);

                tutor.inputs.audioapi.analyserNode.getByteFrequencyData(freqByteData);

                analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
                analyserContext.fillStyle = '#F6D565';
                analyserContext.lineCap = 'round';
                var multiplier = tutor.inputs.audioapi.analyserNode.frequencyBinCount / numBars;

                // Draw rectangle for each frequency bin.
                for (var i = 0; i < numBars; ++i) {
                    var magnitude = 0;
                    var offset = Math.floor(i * multiplier);
                    // gotta sum/average the block, or we miss narrow-bandwidth spikes
                    for (var j = 0; j < multiplier; j++) {
                        magnitude += freqByteData[offset + j];
                    }
                    magnitude = scaleY * magnitude / multiplier;
                    var magnitude2 = freqByteData[i * multiplier];
                    analyserContext.fillStyle = "hsl( " + Math.round((i * 360) / numBars) + ", 100%, 50%)";
                    analyserContext.fillRect(i * SPACING, canvasHeight, BAR_WIDTH, -magnitude);
                }
            }
            tutor.inputs.audioapi.animationFrame = window.requestAnimationFrame(drawAnimationFrame);
        };

        return  drawAnimationFrame;

    };


    var clearCurrentFrame=function(){
        if (tutor.inputs.audioapi.currentAudioId) {
            var canvas = document.getElementById('canvas-'+tutor.inputs.audioapi.currentAudioId);
            var context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
            tutor.inputs.audioapi.currentAudio = null;
        }
        if (tutor.inputs.audioapi.animationFrame) {
            window.cancelAnimationFrame(tutor.inputs.audioapi.animationFrame);
            tutor.inputs.audioapi.animationFrame=null;
        }
    }

    tutor.inputs.audioapi.startRecording=function (ev) {
        clearCurrentFrame();
        // tutor.inputs.audioapi.audioGain.gain.value = 1.0;
        var id = $(ev.target).attr("data-audio-id");
        tutor.inputs.audioapi.currentAudioId = id;
        var canvas = document.getElementById('canvas-'+id);
        var updateAnalysers = tutor.inputs.audioapi.drawAnimationFrameFactory(canvas);
        updateAnalysers();
        // start recording
        tutor.inputs.audioapi.audioRecorder.clear();
        tutor.inputs.audioapi.audioRecorder.record();
    };

    tutor.inputs.audioapi.stopRecording=function (ev) {
        // tutor.inputs.audioapi.audioGain.gain.value = 0.0;
        // stop recording and send it to server
        // console.log("stop recording and send it to server");
        tutor.inputs.audioapi.audioRecorder.stop();
        tutor.inputs.audioapi.audioRecorder.getBuffers( function ( buffers ) {

            tutor.inputs.audioapi.audioRecorder.exportWAV( function ( blob ) {

                var compositeBlob=new Blob([
                    JSON.stringify({audioId:tutor.inputs.audioapi.currentAudioId, audioString:$('#config-'+tutor.inputs.audioapi.currentAudioId).attr('data-string')}),
                    "\n\n",
                    blob ],
                    {type : 'audio/wav'}
                );
        
                $(document).trigger('audioapi:score',[tutor.inputs.audioapi.currentAudioId, compositeBlob]);

                clearCurrentFrame();
            });
        } );                
    };


    // callback on audio stream created
    // microphone -> splitter -> mono -> gain -> analyzer
    var gotStream = function (stream) {

        // Create AudioNode from the stream.
        tutor.inputs.audioapi.userSourceNode = tutor.inputs.audioapi.context.createMediaStreamSource(stream);

        // create mono channel
        var splitter = tutor.inputs.audioapi.context.createChannelSplitter(2);
        tutor.inputs.audioapi.userSourceNode.connect(splitter);


        // on-channel sound, mono
        tutor.inputs.audioapi.monoSoundSourceNode = tutor.inputs.audioapi.context.createChannelMerger(2);
        splitter.connect(tutor.inputs.audioapi.monoSoundSourceNode, 0, 0);
        splitter.connect(tutor.inputs.audioapi.monoSoundSourceNode, 0, 1);

        // Gain (Усилитель)
        tutor.inputs.audioapi.audioGain = tutor.inputs.audioapi.context.createGain();
        tutor.inputs.audioapi.audioGain.gain.value = 0.0;
        // source           destination
        tutor.inputs.audioapi.monoSoundSourceNode.connect(tutor.inputs.audioapi.audioGain);

        // create audio analyzer
        tutor.inputs.audioapi.analyserNode = tutor.inputs.audioapi.context.createAnalyser();
        tutor.inputs.audioapi.analyserNode.fftSize = 128;
        tutor.inputs.audioapi.monoSoundSourceNode.connect(tutor.inputs.audioapi.analyserNode);
        //tutor.inputs.audioapi.audioGain.connect( tutor.inputs.audioapi.analyserNode );

        // направляем выход от усилителя в наушники/колонки
        // tutor.inputs.audioapi.audioGain.connect(tutor.inputs.audioapi.context.destination);

        // глушим эхо от микрофона в наушниках
        var zeroGain = tutor.inputs.audioapi.context.createGain();
        zeroGain.gain.value = 0.0;
        tutor.inputs.audioapi.audioGain.connect( zeroGain );
        zeroGain.connect( tutor.inputs.audioapi.context.destination );


        // create recorder object
        tutor.inputs.audioapi.audioRecorder = new Recorder( tutor.inputs.audioapi.monoSoundSourceNode,{workerPath:tutor.inputs.audioapi.options.jsURL+'/voiceinputRecorderWorker.js'} );

        // activate buttons
        $(document).trigger('audioapi:activated');

    };

    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        tutor.inputs.audioapi.context = new AudioContext();

        // operate animation frame
        if (!navigator.cancelAnimationFrame) {
            navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
        }
        // operate animation frame
        if (!navigator.requestAnimationFrame) {
            navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;
        }

        // get media source
        if (!navigator.getUserMedia) {
            navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        }

        navigator.getUserMedia(
            // options
            {
                "audio": {
                    "mandatory": {
                        "googEchoCancellation": "false",
                        "googAutoGainControl": "false",
                        "googNoiseSuppression": "false",
                        "googHighpassFilter": "false"
                    },
                    "optional": []
                }
            },
            // on stream created
            gotStream,
            // on error
            function (e) {  alert('Error getting audio');  console.log(e); }
        );


    } catch (e) {
        alert('Opps.. Your browser do not support audio API');
    }
    
    

    
};