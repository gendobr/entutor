tutor = {};
tutor.inputs = {};
tutor.recorderApp = {};
tutor.recorderApp.RECORDER_APP_ID = "recorderApp";
tutor.recorderApp.appWidth = 24;
tutor.recorderApp.appHeight = 24;
// tutor.recorderApp.uploadFormId="#uploadForm";
tutor.recorderApp.uploadFieldName = "upload_file";
tutor.recorderApp.swf = "./voiceinput2/recorder.swf";
tutor.recorderApp.receiver = './voiceinput2/upload.php';

tutor.recorderApp.currentRecorderId = "01";
tutor.recorderApp.currentRecorderLevel = false;
tutor.recorderApp.currentRecorderText = false;
tutor.recorderApp.audioid='audio';
// =======================================================
// microphone settings
tutor.recorderApp.maxRecordTime = 30000;
tutor.recorderApp.silenceTimeout = 4000;
tutor.recorderApp.silenceLevel = 10; // 0 ... 100

// rate - at which the microphone captures sound, in kHz. default is 22. 
// Currently we only support 44 and 22.
// var rate= 44; // 44,100 Hz
// var rate= 22; // 22,050 Hz
// var rate= 11; // 11,025 Hz
// var rate= 8 ; //  8,000 Hz
// var rate= 5 ; //  5,512 Hz
tutor.recorderApp.rate = 22;



// =======================================================

// =======================================================
// helpers
// tutor.recorderApp.recorderEl = function () {return $('#' + RECORDER_APP_ID); }

tutor.recorderApp.startRecording = function (el) {

    tutor.recorderApp.currentRecorderId = $(el).attr('data-id');
    var recorder = $('#recorder' + tutor.recorderApp.currentRecorderId);

    tutor.recorderApp.currentRecorderText = $(el).attr('data-text');
    tutor.recorderApp.currentRecorderLevel = recorder.find('.recorder-level-indicator').first();
    
    FWRecorder.record(tutor.recorderApp.audioid, tutor.recorderApp.audioid+'.wav');
    if(FWRecorder.isReady){
        FWRecorder.observeLevel();
        recorder.find('.recorder-stop').removeClass('hide');
        recorder.find('.recorder-start').addClass('hide');
        tutor.recorderApp.stopRecordingTimeout = setTimeout(function () {
            tutor.recorderApp.stopRecordingTimeout = false;
            FWRecorder.stopRecording('audio');
        }, tutor.recorderApp.maxRecordTime);
    }

};

tutor.recorderApp.stopRecording = function (el) {
    FWRecorder.stopRecording('audio')
    if (tutor.recorderApp.stopRecordingTimeout) {
        clearTimeout(tutor.recorderApp.stopRecordingTimeout);
    }
    tutor.recorderApp.stopRecordingTimeout = false;
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
            //FWRecorder.uploadFormId = tutor.recorderApp.uploadFormId;
            //FWRecorder.uploadFieldName = tutor.recorderApp.uploadFieldName;
            FWRecorder.connect(tutor.recorderApp.RECORDER_APP_ID, 0);
            FWRecorder.recorderOriginalWidth = width;
            FWRecorder.recorderOriginalHeight = height;

            var rate = tutor.recorderApp.rate; // 22,050 Hz

            // gain - the amount by which the microphone should multiply the signal before transmitting it. default is 100
            var gain = 100; // 100% volume level

            // silence_level - amount of sound required to activate the microphone and dispatch the activity event. default is 0
            var silenceLevel = tutor.recorderApp.silenceLevel;

            //silence_timeout - number of milliseconds between the time the microphone stops detecting sound and the time the activity event is dispatched. default is 4000
            var silenceTimeout = tutor.recorderApp.silenceTimeout; // 4 seconds of silence = record stopped

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
            // console.log("Last recorder event: " + arguments[0]);
            //recorderEl().addClass("floating");
            FWRecorder.showPermissionWindow();
            break;

            // user allowed access to the microphone
        case "microphone_connected":
            // console.log("Last recorder event: " + arguments[0]);
            FWRecorder.isReady = true;

            var recorder = $('#recorder' + tutor.recorderApp.currentRecorderId);
            FWRecorder.record(tutor.recorderApp.audioid, tutor.recorderApp.audioid+'.wav');
            FWRecorder.observeLevel();
            recorder.find('.recorder-stop').removeClass('hide');
            recorder.find('.recorder-start').addClass('hide');
            tutor.recorderApp.stopRecordingTimeout = setTimeout(function () {
                tutor.recorderApp.stopRecordingTimeout = false;
                FWRecorder.stopRecording('audio');
            }, tutor.recorderApp.maxRecordTime);

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
                text: tutor.recorderApp.currentRecorderText,
                wav: FWRecorder.getBase64()
            };

            // process the form
            $.ajax({
                type: 'POST', // define the type of HTTP verb we want to use (POST for our form)
                url: tutor.recorderApp.receiver, // the url where we want to POST
                data: formData, // our data object
                dataType: 'json', // what type of data do we expect back from the server
                encode: true
            }).done(function (data) {

                FWRecorder.stopObservingLevel();

                var recorder = $('#recorder' + tutor.recorderApp.currentRecorderId);
                recorder.find('.recorder-start').removeClass('hide');
                recorder.find('.recorder-stop').addClass('hide');

                tutor.recorderApp.currentRecorderId = false;
                tutor.recorderApp.currentRecorderLevel = false;
                // log data to the console so we can see
                console.log(data);

                // here we will handle errors and validation messages
            });

            break;

        case "microphone_level":
            if (tutor.recorderApp.currentRecorderLevel) {
                tutor.recorderApp.currentRecorderLevel.css({marginTop: (100 - arguments[1] * 50) + '%'});
            }
            break;

        case "observing_level":
            break;

        case "observing_level_stopped":
            break;

        case "playing":
            // name = arguments[1];
            // $controls = controlsEl(name);
            // setControlsClass($controls, CLASS_PLAYING);
            break;

        case "playback_started":
            // name = arguments[1];
            // var latency = arguments[2];
            break;

        case "stopped":
            // name = arguments[1];
            break;

        case "playing_paused":
            // name = arguments[1];
            break;

        case "save_pressed":
            // FWRecorder.updateForm();
            break;

        case "saving":
            // name = arguments[1];
            break;

        case "saved":
            // name = arguments[1];
            // arguments[2] is server response
            //console.log(arguments[2]);
            break;

        case "save_failed":
            // name = arguments[1];
            // var errorMessage = arguments[2];
            break;

        case "save_progress":
            // name = arguments[1];
            // var bytesLoaded = arguments[2];
            // var bytesTotal = arguments[3];
            break;
    }
};



$(function () {

    // $('.recorder .recorder-start').attr('disabled',true);

    var flashvars = {'upload_image': './voiceinput2/upload.png'};
    var params = {};
    var attributes = {'id': tutor.recorderApp.RECORDER_APP_ID, 'name': tutor.recorderApp.RECORDER_APP_ID};
    swfobject.embedSWF(tutor.recorderApp.swf, "flashcontent", tutor.recorderApp.appWidth, tutor.recorderApp.appHeight, "11.0.0", "", flashvars, params, attributes);


});