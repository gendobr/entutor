tutor={};
tutor.inputs={}
tutor.inputs.recorderApp={}
tutor.inputs.recorderApp.RECORDER_APP_ID = "recorderApp";
tutor.inputs.recorderApp.appWidth = 24;
tutor.inputs.recorderApp.appHeight = 24;
tutor.inputs.recorderApp.uploadFormId="#uploadForm";
tutor.inputs.recorderApp.uploadFieldName = "upload_file[filename]";

// =======================================================
// microphone settings
tutor.inputs.recorderApp.silenceTimeout=4000;
tutor.inputs.recorderApp.silenceLevel=10; // 0 ... 100

// rate - at which the microphone captures sound, in kHz. default is 22. 
// Currently we only support 44 and 22.
// var rate= 44; // 44,100 Hz
// var rate= 22; // 22,050 Hz
// var rate= 11; // 11,025 Hz
// var rate= 8 ; //  8,000 Hz
// var rate= 5 ; //  5,512 Hz
tutor.inputs.recorderApp.rate=22;



// =======================================================

// =======================================================
// helpers
tutor.inputs.recorderApp.recorderEl = function () {return $('#' + RECORDER_APP_ID); }



//  Handling FWR events ------------------------------------------------------------------------------------------------

  window.fwr_event_handler = function fwr_event_handler() {
    
    console.log("Last recorder event: " + arguments[0]);

    var name, $controls;

    switch (arguments[0]) {


      //  ready: recorder is ready for use
      //    width - save button's width
      //    height - save button's height
      case "ready":
        var width = parseInt(arguments[1]);
        var height = parseInt(arguments[2]);
        FWRecorder.uploadFormId = tutor.inputs.recorderApp.uploadFormId;
        FWRecorder.uploadFieldName = tutor.inputs.recorderApp.uploadFieldName;
        FWRecorder.connect("recorderApp", 0);
        FWRecorder.recorderOriginalWidth = width;
        FWRecorder.recorderOriginalHeight = height;



        var rate= tutor.inputs.recorderApp.rate; // 22,050 Hz

        // gain - the amount by which the microphone should multiply the signal before transmitting it. default is 100
        var gain = 100; // 100% volume level

        // silence_level - amount of sound required to activate the microphone and dispatch the activity event. default is 0
        var silenceLevel=tutor.inputs.recorderApp.silenceLevel;

        //silence_timeout - number of milliseconds between the time the microphone stops detecting sound and the time the activity event is dispatched. default is 4000
        var silenceTimeout=tutor.inputs.recorderApp.silenceTimeout; // 4 seconds of silence = record stopped

        var useEchoSuppression = true;

        var loopBack=false;

        FWRecorder.configure(rate, 100, $('#silenceLevel').val(), silenceTimeout);
        FWRecorder.setUseEchoSuppression(useEchoSuppression);
        FWRecorder.setLoopBack(loopBack);

        // $('.save_button').css({'width': width, 'height': height});
        break;

      // no_microphone_found: no microphone was found when trying to record
      case "no_microphone_found":
        break;

      // user needs to allow the recorder to access the microphone
      case "microphone_user_request":
        recorderEl().addClass("floating");
        FWRecorder.showPermissionWindow();
        break;

      // user allowed access to the microphone
      case "microphone_connected":
        FWRecorder.isReady = true;
        // $uploadStatus.css({'color': '#000'});
        break;

      // user closed permission dialog
      case "permission_panel_closed":
        FWRecorder.defaultSize();
        recorderEl().removeClass("floating");
        break;

      // ??????
      case "microphone_activity":
        console.log("microphone_activity", arguments[1]);
        // $('#activity_level').text(arguments[1]);
        break;


      // recording: recording audio data from the microphone
      //   name - of the recording that was specified when record was called
      case "recording":
        name = arguments[1];
        FWRecorder.hide();
        // $controls = controlsEl(name);
        // setControlsClass($controls, CLASS_RECORDING);
        break;

      case "recording_stopped":
        name = arguments[1];
        var duration = arguments[2];
        FWRecorder.show();
        // $controls = controlsEl(name);
        // setControlsClass($controls, CLASS_PLAYBACK_READY);
        // $('#duration').text(duration.toFixed(4) + " seconds");
        break;

      case "microphone_level":
        /// $level.css({width: arguments[1] * 50 + '%'});
        break;

      case "observing_level":
        $showLevelButton.hide();
        $hideLevelButton.show();
        break;

      case "observing_level_stopped":
        // $showLevelButton.show();
        // $hideLevelButton.hide();
        // $level.css({width: 0});
        break;

      case "playing":
        name = arguments[1];
        //$controls = controlsEl(name);
        //setControlsClass($controls, CLASS_PLAYING);
        break;

      case "playback_started":
        name = arguments[1];
        var latency = arguments[2];
        break;

      case "stopped":
        name = arguments[1];
        // $controls = controlsEl(name);
        // setControlsClass($controls, CLASS_PLAYBACK_READY);
        break;

      case "playing_paused":
        name = arguments[1];
        // $controls = controlsEl(name);
        // setControlsClass($controls, CLASS_PLAYBACK_PAUSED);
        break;

      case "save_pressed":
        FWRecorder.updateForm();
        break;

      case "saving":
        name = arguments[1];
        break;

      case "saved":
        name = arguments[1];
        var data = $.parseJSON(arguments[2]);
        if (data.saved) {
          // $('#upload_status').css({'color': '#0F0'}).text(name + " was saved");
        } else {
          // $('#upload_status').css({'color': '#F00'}).text(name + " was not saved");
        }
        break;

      case "save_failed":
        name = arguments[1];
        var errorMessage = arguments[2];
        // $uploadStatus.css({'color': '#F00'}).text(name + " failed: " + errorMessage);
        break;

      case "save_progress":
        name = arguments[1];
        var bytesLoaded = arguments[2];
        var bytesTotal = arguments[3];
        // $uploadStatus.css({'color': '#000'}).text(name + " progress: " + bytesLoaded + " / " + bytesTotal);
        break;
    }
  };



$(function () {




});