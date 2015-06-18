tutor = {};
tutor.inputs = {};
tutor.inputs.recorderApp = {};
tutor.inputs.recorderApp.RECORDER_APP_ID = "recorderApp";
tutor.inputs.recorderApp.appWidth = 24;
tutor.inputs.recorderApp.appHeight = 24;
// tutor.inputs.recorderApp.uploadFormId="#uploadForm";
tutor.inputs.recorderApp.uploadFieldName = "upload_file";
tutor.inputs.recorderApp.swf = "./voiceinput2/recorder.swf";
tutor.inputs.recorderApp.receiver = './voiceinput2/upload.php';

tutor.inputs.recorderApp.currentRecorderId = "01";
tutor.inputs.recorderApp.currentRecorderLevel = false;
tutor.inputs.recorderApp.currentRecorderText = false;
// =======================================================
// microphone settings
tutor.inputs.recorderApp.maxRecordTime = 30000;
tutor.inputs.recorderApp.silenceTimeout = 4000;
tutor.inputs.recorderApp.silenceLevel = 10; // 0 ... 100

// rate - at which the microphone captures sound, in kHz. default is 22. 
// Currently we only support 44 and 22.
// var rate= 44; // 44,100 Hz
// var rate= 22; // 22,050 Hz
// var rate= 11; // 11,025 Hz
// var rate= 8 ; //  8,000 Hz
// var rate= 5 ; //  5,512 Hz
tutor.inputs.recorderApp.rate = 22;



// =======================================================

// =======================================================
// helpers
// tutor.inputs.recorderApp.recorderEl = function () {return $('#' + RECORDER_APP_ID); }

tutor.inputs.recorderApp.startRecording = function (el) {
    FWRecorder.record('audio', 'audio.wav');

    var recorder = $('#recorder' + tutor.inputs.recorderApp.currentRecorderId);
    tutor.inputs.recorderApp.currentRecorderId = $(el).attr('data-id');
    tutor.inputs.recorderApp.currentRecorderText = $(el).attr('data-text');
    tutor.inputs.recorderApp.currentRecorderLevel = recorder.find('.recorder-level-indicator').first();
    // console.log(tutor.inputs.recorderApp.currentRecorderLevel);
    FWRecorder.observeLevel();
    // var recorder = $('#recorder' + tutor.inputs.recorderApp.currentRecorderId);
    recorder.find('.recorder-stop').removeClass('hide');
    recorder.find('.recorder-start').addClass('hide');
    tutor.inputs.recorderApp.stopRecordingTimeout = setTimeout(function () {
        tutor.inputs.recorderApp.stopRecordingTimeout = false;
        FWRecorder.stopRecording('audio');
    }, tutor.inputs.recorderApp.maxRecordTime);

};

tutor.inputs.recorderApp.stopRecording = function (el) {
    FWRecorder.stopRecording('audio')
    if (tutor.inputs.recorderApp.stopRecordingTimeout) {
        clearTimeout(tutor.inputs.recorderApp.stopRecordingTimeout);
    }
    tutor.inputs.recorderApp.stopRecordingTimeout = false;
};



//  Handling FWR events ------------------------------------------------------------------------------------------------

window.fwr_event_handler = function fwr_event_handler() {

    //console.log("Last recorder event: " + arguments[0]);

    var name, $controls;

    switch (arguments[0]) {


        //  ready: recorder is ready for use
        //    width - save button's width
        //    height - save button's height
        case "ready":
            console.log("Last recorder event: " + arguments[0]);
            var width = parseInt(arguments[1]);
            var height = parseInt(arguments[2]);
            //FWRecorder.uploadFormId = tutor.inputs.recorderApp.uploadFormId;
            //FWRecorder.uploadFieldName = tutor.inputs.recorderApp.uploadFieldName;
            FWRecorder.connect(tutor.inputs.recorderApp.RECORDER_APP_ID, 0);
            FWRecorder.recorderOriginalWidth = width;
            FWRecorder.recorderOriginalHeight = height;

            var rate = tutor.inputs.recorderApp.rate; // 22,050 Hz

            // gain - the amount by which the microphone should multiply the signal before transmitting it. default is 100
            var gain = 100; // 100% volume level

            // silence_level - amount of sound required to activate the microphone and dispatch the activity event. default is 0
            var silenceLevel = tutor.inputs.recorderApp.silenceLevel;

            //silence_timeout - number of milliseconds between the time the microphone stops detecting sound and the time the activity event is dispatched. default is 4000
            var silenceTimeout = tutor.inputs.recorderApp.silenceTimeout; // 4 seconds of silence = record stopped

            var useEchoSuppression = true;

            var loopBack = false;

            FWRecorder.configure(rate, 100, silenceLevel, silenceTimeout);
            FWRecorder.setUseEchoSuppression(useEchoSuppression);
            FWRecorder.setLoopBack(loopBack);

            // $('.save_button').css({'width': width, 'height': height});
            // console.log("ready");
            break;

            // no_microphone_found: no microphone was found when trying to record
        case "no_microphone_found":
            console.log("Last recorder event: " + arguments[0]);
            break;

            // user needs to allow the recorder to access the microphone
        case "microphone_user_request":
            console.log("Last recorder event: " + arguments[0]);
            //recorderEl().addClass("floating");
            FWRecorder.showPermissionWindow();
            break;

            // user allowed access to the microphone
        case "microphone_connected":
            console.log("Last recorder event: " + arguments[0]);
            FWRecorder.isReady = true;
            // enable Record button here
            // console.log("enable Record button here");
            $('.recorder .recorder-start').attr('disabled', false);
            break;

            // user closed permission dialog
        case "permission_panel_closed":
            console.log("Last recorder event: " + arguments[0]);
            FWRecorder.defaultSize();
            //recorderEl().removeClass("floating");
            break;

            // ??????
        case "microphone_activity":
            console.log("Last recorder event: " + arguments[0]);
            console.log("microphone_activity", arguments[1]);
            // $('#activity_level').text(arguments[1]);
            break;


            // recording: recording audio data from the microphone
            //   name - of the recording that was specified when record was called
        case "recording":
            console.log("Last recorder event: " + arguments[0]);
            name = arguments[1];
            // FWRecorder.hide();
            break;

        case "recording_stopped":
            console.log("Last recorder event: " + arguments[0]);
            name = arguments[1];
            var duration = arguments[2];
            // recording_stopped
            // get the form data
            // there are many ways to get this data using jQuery (you can use the class or id also)
            var formData = {
                token: "XXX",
                until: '2015-12-19',
                text: tutor.inputs.recorderApp.currentRecorderText,
                wav: FWRecorder.getBase64()
            };

            // process the form
            $.ajax({
                type: 'POST', // define the type of HTTP verb we want to use (POST for our form)
                url: tutor.inputs.recorderApp.receiver, // the url where we want to POST
                data: formData, // our data object
                dataType: 'json', // what type of data do we expect back from the server
                encode: true
            }).done(function (data) {

                FWRecorder.stopObservingLevel();

                var recorder = $('#recorder' + tutor.inputs.recorderApp.currentRecorderId);
                recorder.find('.recorder-start').removeClass('hide');
                recorder.find('.recorder-stop').addClass('hide');

                tutor.inputs.recorderApp.currentRecorderId = false;
                tutor.inputs.recorderApp.currentRecorderLevel = false;
                // log data to the console so we can see
                console.log(data);

                // here we will handle errors and validation messages
            });

            // $controls = controlsEl(name);
            // setControlsClass($controls, CLASS_PLAYBACK_READY);
            // $('#duration').text(duration.toFixed(4) + " seconds");
            break;

        case "microphone_level":
            // console.log('microphone_level '+(100-arguments[1] * 50) + '%');
            if (tutor.inputs.recorderApp.currentRecorderLevel) {
                tutor.inputs.recorderApp.currentRecorderLevel.css({marginTop: (100 - arguments[1] * 50) + '%'});
            }
            break;

        case "observing_level":
            console.log("Last recorder event: " + arguments[0]);
            //$showLevelButton.hide();
            //$hideLevelButton.show();
            break;

        case "observing_level_stopped":
            // console.log("Last recorder event: " + arguments[0]);
            break;

        case "playing":
            console.log("Last recorder event: " + arguments[0]);
            name = arguments[1];
            //$controls = controlsEl(name);
            //setControlsClass($controls, CLASS_PLAYING);
            break;

        case "playback_started":
            console.log("Last recorder event: " + arguments[0]);
            name = arguments[1];
            var latency = arguments[2];
            break;

        case "stopped":
            console.log("Last recorder event: " + arguments[0]);
            name = arguments[1];
            // $controls = controlsEl(name);
            // setControlsClass($controls, CLASS_PLAYBACK_READY);
            break;

        case "playing_paused":
            console.log("Last recorder event: " + arguments[0]);
            name = arguments[1];
            // $controls = controlsEl(name);
            // setControlsClass($controls, CLASS_PLAYBACK_PAUSED);
            break;

        case "save_pressed":
            console.log("Last recorder event: " + arguments[0]);
            // FWRecorder.updateForm();
            break;

        case "saving":
            console.log("Last recorder event: " + arguments[0]);
            name = arguments[1];
            break;

        case "saved":
            console.log("Last recorder event: " + arguments[0]);
            name = arguments[1];
            // arguments[2] is server response
            //console.log(arguments[2]);
            break;

        case "save_failed":
            console.log("Last recorder event: " + arguments[0]);
            name = arguments[1];
            var errorMessage = arguments[2];
            // $uploadStatus.css({'color': '#F00'}).text(name + " failed: " + errorMessage);
            break;

        case "save_progress":
            console.log("Last recorder event: " + arguments[0]);
            name = arguments[1];
            var bytesLoaded = arguments[2];
            var bytesTotal = arguments[3];
            // $uploadStatus.css({'color': '#000'}).text(name + " progress: " + bytesLoaded + " / " + bytesTotal);
            break;
    }
};



$(function () {

    // $('.recorder .recorder-start').attr('disabled',true);

    var flashvars = {'upload_image': './voiceinput2/upload.png'};
    var params = {};
    var attributes = {'id': tutor.inputs.recorderApp.RECORDER_APP_ID, 'name': tutor.inputs.recorderApp.RECORDER_APP_ID};
    swfobject.embedSWF(tutor.inputs.recorderApp.swf, "flashcontent", tutor.inputs.recorderApp.appWidth, tutor.inputs.recorderApp.appHeight, "11.0.0", "", flashvars, params, attributes);


});