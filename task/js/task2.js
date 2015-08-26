
//    
//    //    this.autocheck=this.options.autocheck||false;
//    +task      +card        +text        +radio
//    +checkbox  +dropzone    +recorder
//    
//    this.autostart=this.options.autostart||false;
//    +sound     +video   recorder
//    
//  stopOnHide - auto

var entutor = {};
entutor.guid = 0;
entutor.config = {};
entutor.inputs = {};
entutor.dropzones = {};
// entutor.jplayers = {};
entutor.recorders={};
entutor.currentCounter = false;

entutor.debug = true;
entutor.verboseTest = false;
entutor.verbosePrecondition = false;

entutor.hideDelay=1000;
entutor.showDelay=1005;


entutor.i18n={
    //testbutton: 'Проверить',
    testbutton: 'Готово',
    nextbutton: 'Далее',
    restartbutton: 'Начать задание заново'
};





// =============================================================================
//TODO: onLoad callback
entutor.load = function (jsonURL, containerSelector) {
    // process the form
    entutor.currentCounter = false;
    entutor.containerSelector=containerSelector;
    entutor.dropzones = {};
    // entutor.jplayers = {};
    entutor.recorders={};
    $.ajax({
        type: 'GET', // define the type of HTTP verb we want to use (POST for our form)
        url: jsonURL, // the url where we want to POST
        // data: formData, // our data object
        dataType: 'json', // what type of data do we expect back from the server
        encode: true
    }).done(function (json) {
        entutor.json=json;
        entutor.currentTask = new entutor.task(entutor.json);
        $(entutor.containerSelector).empty().append(entutor.currentTask.draw());
        entutor.currentTask.start();
        // window.location.hash = json.id;
    });
};





// =============================================================================
/**
 * autocheck:true\false
 */
entutor.task = function (options) {

    $(document).unbind('audioapi:activated');

    this.type='task';

    var self = this;

    this.options = options || {};

    this.id = options.id || (++entutor.guid);

    this.autocheck=this.options.autocheck||false;

    // text messages
    if (this.options.text) {
        for (var msgId in this.text) {
            if (this.options.text[msgId]) {
                this.text[msgId] = this.options.text[msgId];
            }
        }
    }

    // override template
    if (this.options.template) {
        this.template = this.options.template;
    }

    // create presentation
    this.testPresentation = new entutor.testPresentation(this, this.options.presentation);

    // create inputs
    this.inputs = new entutor.inputs.card(this, this.options.inputs);

    this.testFinishedCallback=function (id, result) {
        // enable Next button if test is passed
        //if (entutor.debug) {
        //    console.log("self.inputs.test id=", id, " result=", result);
        //}
        if (result.passed === true) {
            self.nextButton.attr('disabled', false);
        }else{
            self.nextButton.attr('disabled', true);
        }
        self.domElement.trigger('task:test', [self.id, result]);
    };
    
};

entutor.task.prototype.template =
        '<span id="task{{id}}" class="task-container">'
        + '<span id="task{{id}}tip" class="task-tip"><!-- task.tip --></span>'
        + '<span id="task{{id}}presentation" class="task-presentation"><!-- task.presentation --></span>'
        + '<span id="task{{id}}inputs" class="task-inputs form-group"><!-- task.inputs --></span>'
        + '<span id="task{{id}}buttons" class="btn-group">'
        + '<input type="button" value="{{text.testbutton}}" id="task{{id}}testbutton" class="btn btn-default">'
        + '<input type="button" value="{{text.restartbutton}}" id="task{{id}}restartbutton" class="btn btn-default">'
        + '<input type="button" value="{{text.nextbutton}}" id="task{{id}}nextbutton" class="btn btn-default">'
        + '</span>'
        + '</span>';


entutor.task.status = {
    received: 'received',
    waiting: 'waiting'
};

entutor.task.prototype.draw = function () {

    var self = this;
    var context = {
        id: this.id,
        text: entutor.i18n
    };
    this.domElement = $(Mark.up(this.template, context));

    if (this.tip) {
        this.domElement.find('#task' + this.id + 'tip').append(this.tip.draw());
    }
    if (this.testPresentation) {
        //console.log(this.presentation);
        this.domElement.find('#task' + this.id + 'presentation').append(this.testPresentation.draw());
    }
    if (this.inputs) {
        this.domElement.find('#task' + this.id + 'inputs').append(this.inputs.draw());
    }

    this.test = function () {
        self.inputs.test();
    };
    this.domElement.find('#task' + this.id + 'testbutton').click(this.test);

    
    this.nextButton = this.domElement.find('#task' + this.id + 'nextbutton');
    this.nextButton.attr('disabled', true);
    this.nextButton.click(function () {
        // alert('nextbutton');
        if (self.options && self.options.next) {
            window.location.href = self.options.next;
        }
    });
    this.domElement.find('#task' + this.id + 'restartbutton').click(function () {
        var task = new entutor.task(entutor.json);
        $(entutor.containerSelector).empty().append(task.draw());
        task.start();
    });
    return this.domElement;
};

entutor.task.prototype.start = function(){
    this.inputs.start();
};

entutor.task.prototype.notify = function (stack) {
    if(this.autocheck){
        this.inputs.test();
    }
    $(document).trigger("task:changed");
};

entutor.print_call_stack = function() {
  var stack = new Error().stack;
  console.log("PRINTING CALL STACK");
  console.log( stack );
};






// =============================================================================
entutor.testPresentation = function (parent, options) {
    this.parent = parent;
    this.options = options || {};
};

entutor.testPresentation.prototype.draw = function () {
    if (this.options.innerHtml) {
        var d=$('<div></div>');
        d.html(this.options.innerHtml);
        return d;
    }
    if (this.options.elementSelector) {
        return $(this.options.elementSelector);
    }
    return $('<span class="error task-presentation-not-found"></span>');
};



// =============================================================================
entutor.utils={};
entutor.utils.parseTime = function(timestring){
    var seconds=parseFloat(timestring.replace(/,/,'.'));
    if(!isNaN(seconds)){
        return seconds;
    }
    var tmp=timestring.trim().split(/:/);
};

// =============================================================================
/** card, container for other inputs
 
    options={
        type:'card',
        id:''
        arrange:vertical|horizontal|flow
        autocheck:true|false
        classes:''
        maxScore:1
        precondition:'none|beforeCorrect'
        taskPassScore:1; // какую долю от максимума надо набрать, чтобы получить зачёт, число от 0 до 1
        customtest:function(arrayOfChildComponents){
            return {
              status: entutor.task.status.received,
              score: null,
              subresults: [],
              passed:false|true,
              maxScore:0
            }
        }
        children:[
           <list of subelements>
        ]
    }
*/
entutor.inputs.card = function (parent, options) {
    var self=this;
    this.type = 'card';
    this.parent = parent;
    this.options = options || {};
    this.id = this.parent.id + '_' + (this.options.id || (++entutor.guid));

    this.classes = this.options.classes || '';
    this.arrange = this.options.arrange || 'vertical';
    this.taskPassScore = this.options.taskPassScore || 1;
    this.precondition = this.options.precondition || 'none';
    this.customtest = this.options.customtest || false;
    this.maxScore = (typeof (this.options.maxScore) !== 'undefined') ? this.options.maxScore : 1;
    this.autocheck=this.options.autocheck||false;
    this.hideOnCorrect = this.options.hideOnCorrect? true :false;

    // create child elements
    this.children = [];
    this.result = {
        status: entutor.task.status.waiting,
        score: null,
        subresults: [],
        passed: false,
        maxScore: 0
    };

    this.testFinishedCallback = function (id, result) {
        //console.log('card:',self.id, ' received from ',id, result);
        // console.log('card:',self.id, ' received from ',id, result.passed);

        // save subresult
        if (result) {
            self.result.subresults[id] = {
                status: entutor.task.status.received,
                score: result.score,
                subresults: result.subresults,
                passed: result.passed
            };
        } else {
            self.result.subresults[id] = {
                status: entutor.task.status.received,
                score: null,
                subresults: null,
                passed: 'undefined'
            };
        }
        //console.log('self.result.subresults:', id, ' = ',self.result.subresults[id]);


        // update score
        var newscore = 0;
        for (var key in self.result.subresults) {
            if (newscore !== null) {
                with (self.result.subresults[key]) {
                    //console.log('subresults ',key, self.result.subresults[key]);
                    if (isNaN(parseFloat(score))) {
                        newscore = null;
                    } else {
                        newscore += score;
                    }
                }
            }
        }
        self.result.score = newscore;


        // check if test passed
        var passed = 'null';
        for (var key in self.result.subresults) {
            if (self.result.subresults[key].passed === 'undefined') {
                passed = 'undefined';
                break;
            }
            if (passed === 'null') {
                passed = self.result.subresults[key].passed;
                continue;
            }
            passed = self.result.subresults[key].passed && passed;
        }
        self.result.passed = passed;


        // console.log(self.result);

        // check if all tests are received
        var allTestsReceived = true;
        for (var key in self.result.subresults) {
            if (self.result.subresults[key].status === entutor.task.status.waiting) {
                allTestsReceived = false;
            }
        }

        if (allTestsReceived) {
            // console.log('card.allTestsReceived:',self.id);
            if (self.customtest) {
                self.result = self.customtest(self.children);
            } else if (passed === 'undefined') {
                self.result.status = entutor.task.status.received;
                self.result.passed = 'undefined';
                self.result.score = 0;
            } else {
                self.result.status = entutor.task.status.received;
                if (self.result.maxScore > 0) {
                    var reachedPercentage = self.result.score / self.result.maxScore;
                    // self.result.passed = reachedPercentage>=self.taskPassScore;
                    self.result.score = self.maxScore * reachedPercentage;
                } else {
                    self.result.score = 0;
                    self.result.passed = true;
                }
            }

            self.removeFeedback();
            if (self.result) {
                // console.log(self.id,self.result);
                if (self.result.maxScore > 0) {
                    if (self.result.passed === true) {
                        self.showSuccess();
                        if(self.hideOnCorrect){
                            self.hide(entutor.hideDelay);
                        }
                    } else if (self.result.passed === false) {
                        self.showError();
                    }
                }
            }


            
            if(entutor.verboseTest){
                console.log('verboseTest',self.id, self.type, self.result.passed);
            }
            if(self.parent && self.parent.testFinishedCallback){
                self.parent.testFinishedCallback(self.id, self.result);
            }

            // showChildren() only if current card is visible
            if(self.isVisible()){
               self.showChildren();
            }
        }
        

    };

    this.hideDelayed=function(){ self.hide(); };
    this.showDelayed=function(){ self.show(); };
    
    var childMaxScoreSum = 0;
    for (var key = 0; key < this.options.children.length; key++) {
        var child = this.options.children[key];
        if (typeof (entutor.inputs[child.type]) === 'function') {
            var constructor = entutor.inputs[child.type];
            var childObject = new constructor(this, child);
            // console.log(childObject);
            // console.log(childObject.maxScore());
            childMaxScoreSum += childObject.getMaxScore();
            this.children.push(childObject);
            this.result.subresults[childObject.id] = {
                status: entutor.task.status.waiting,
                score: 0,
                subresults: [],
                passed: 'undefined',
                maxScore: 0
            };//;
        }
    }
};

entutor.inputs.card.prototype.showSuccess = function () {
    this.domElement.removeClass('task-card-error').addClass('task-card-correct');
};

entutor.inputs.card.prototype.showError = function () {
    this.domElement.removeClass('task-card-correct').addClass('task-card-error');
};

entutor.inputs.card.prototype.removeFeedback = function () {
    this.domElement.removeClass('task-card-correct').removeClass('task-card-error');
};

entutor.inputs.card.prototype.test = function () {
    // var self = this;
    // console.log('card.test:',this.id);
    // clear previous score
    this.result.status = entutor.task.status.waiting;
    this.result.score = null;
    this.result.passed = 'undefined';
    this.result.maxScore = this.getMaxScore();
    
    
    if(this.children.length===0){
        this.result.status = entutor.task.status.received;
        this.result.passed = true;
        if(entutor.verboseTest){
            console.log('verboseTest',this.id, this.type, this.result.passed);
        }
        if(this.parent && this.parent.testFinishedCallback){
            this.parent.testFinishedCallback(this.id, this.result);
        }
        return;
    }
    
    
    for (var key in this.result.subresults) {
        with (this.result.subresults[key]) {
            status = entutor.task.status.waiting;
            score = null;
            passed = 'undefined';
        }
    }

    for (var key = 0; key < this.children.length; key++) {
        this.children[key].test();
    }

};

entutor.inputs.card.prototype.draw = function () {
    this.domElement = $('<span id="task' + this.id + '" class="task-card transition task-card-' + this.arrange + ' ' + this.classes + '"></span>');

    if (this.precondition === 'beforeCorrect') {
        this.domElement.hide();
    }

    for (var key = 0; key < this.children.length; key++) {
        var block = $('<span class="task-card-element"></span>');
        this.domElement.append(block);
        var child = this.children[key];
        this.children[key].domElement = child.draw();
        block.append(this.children[key].domElement);
    }

    if (this.precondition === 'beforeCorrect') {
        this.hide();
    }
    return this.domElement;
};

entutor.inputs.card.prototype.getValue = function () {
    var value = [];
    for (var key = 0; key < this.children.length; key++) {
        value.push(this.children[key].getValue());
    }
    return value;
};

entutor.inputs.card.prototype.getMaxScore = function () {
    var maxScore = 0;
    for (var key = 0; key < this.children.length; key++) {
        maxScore += this.children[key].getMaxScore();
    }
    return maxScore;
};

entutor.inputs.card.prototype.hide = function (delay) {
    if(delay && parseInt(delay)>0){
        setTimeout(this.hideDelayed,entutor.hideDelay);
    }else{
        this.domElement.hide();
        for (var key = 0; key < this.children.length; key++) {
            this.children[key].hide();
        }        
    }
};

entutor.inputs.card.prototype.isVisible = function(){
    return this.domElement.is(':visible') && this.domElement.parents( ":hidden" ).length===0;
};

entutor.inputs.card.prototype.show = function (delay) {
    if(this.result.passed===true && this.hideOnCorrect){
        return;
    }
    if(delay && parseInt(delay)>0){
        setTimeout(this.showDelayed,entutor.showDelay);
    }else{
        this.domElement.show();
        this.showChildren();
    }
};

entutor.inputs.card.prototype.showChildren = function () {
    // console.log(this.id + ' showChildren ');
    // apply child pre-conditions
    for (var key = 0; key < this.children.length; key++) {
        if (this.children[key].precondition === 'beforeCorrect') {

            var allPreviousPassed = true;
            for (var i = 0; i < key; i++) {
                if (typeof(this.children[i].result) === 'undefined' || this.children[i].result.passed === false || this.children[i].result.passed === 'undefined') {
                    allPreviousPassed = false;
                }
            }
            //if(entutor.verbosePrecondition){
            //    var noe=(new Date()).toString();
            //    console.log('verbosePrecondition',noe,this.children[key].id, this.children[key].type, 'beforeCorrect',allPreviousPassed);
            //}

            var childIsVisible=this.children[key].isVisible();
            if (allPreviousPassed) {
                if(!childIsVisible){
                    if(entutor.verbosePrecondition){
                        var noe=(new Date()).toString();
                        console.log('verbosePrecondition',noe,this.children[key].id, this.children[key].type, 'beforeCorrect',allPreviousPassed);
                        console.log('verbosePrecondition',noe,this.children[key].id,"this.children[key].show();");
                    }
                    this.children[key].show(entutor.showDelay);
                }
            } else {
                if(childIsVisible){
                    if(entutor.verbosePrecondition){
                        var noe=(new Date()).toString();
                        console.log('verbosePrecondition',noe,this.children[key].id, this.children[key].type, 'beforeCorrect',allPreviousPassed);
                        console.log('verbosePrecondition',noe,this.children[key].id, "this.children[key].hide();");
                    }
                    this.children[key].hide(entutor.hideDelay);
                }
            }
        } else {
            this.children[key].show(entutor.showDelay);
        }
    }
};

entutor.inputs.card.prototype.start = function(){
    for (var key = 0; key < this.children.length; key++) {
        this.children[key].start();
    }
};

entutor.inputs.card.prototype.notify = function (stack) {
    if(this.options.autocheck){
        this.test();
    }
    if(this.parent){
        // console.log("this.parent.notify(stack) "+this.id);
        stack.push(this.id);
        this.parent.notify(stack);
    }
};




// =============================================================================
//
//    options={
//        type:'html',
//        id:''
//        classes:''
//        maxScore:''
//        pattern:''
//        value:'yyy',
//        size:5,
//        duration: <seconds : float>
//        precondition:'none|beforeCorrect'
//    }
entutor.inputs.html = function (parent, options) {
    var self = this;

    this.type = 'html';
    this.parent = parent;
    this.options = options || {};
    this.id = this.parent.id + '_' + (this.options.id || (++entutor.guid));
    this.classes = this.options.classes || '';
    this.precondition = this.options.precondition || 'none';

    this.hideOnCorrect = this.options.hideOnCorrect? true : false;

    this.duration = parseFloat(this.options.duration || 'none');
    
    if(typeof(this.options.animationFrame)==='undefined'){
        this.animationFrame = true;
    }else{
        this.animationFrame = this.options.animationFrame? true : false;
    }
    
    
    if(!isNaN(this.duration) && this.duration>0){
        this.duration = Math.round(1000 * this.duration);
    }

    this.hideDelayed=function(){ self.hide(); };
    this.showDelayed=function(){ self.show(); };
    
    this.result={
        status: entutor.task.status.received,
        score: 1,
        passed: false,
        maxScore: 1
    };
    
    this.maxScore = 1;
};

entutor.inputs.html.prototype.test = function () {
    if(entutor.verboseTest){
        console.log('verboseTest',this.id, this.type, this.result.passed);
    }
    if(this.parent && this.parent.testFinishedCallback){
        this.parent.testFinishedCallback(this.id, this.result);
    }
};

entutor.inputs.html.prototype.draw = function () {
    this.domElement = $('<span id="task' + this.id + '" class="task-html ' + this.classes + '">' + this.options.innerHtml + '</span>');
    if (this.precondition === 'beforeCorrect') {
        this.hide();
    }
    return this.domElement;
};

entutor.inputs.html.prototype.getValue = function () {
    return null;
};

entutor.inputs.html.prototype.getMaxScore = function () {
    return this.maxScore;
};

entutor.inputs.html.prototype.hide = function (delay) {
    if(!this.animationFrame && delay && parseInt(delay)>0){
        setTimeout(this.hideDelayed,entutor.hideDelay);
    }else{
        this.domElement.hide();
    }
};

entutor.inputs.html.prototype.show = function (delay) {
    if(this.result.passed===true && this.hideOnCorrect){
        return;
    }
    if(!this.isVisible()){
        this.domElement.show();
        if(this.onShow){
            // console.log('html 3 ', this.id,' onShow ');
            this.onShow();
        }
    }
};

entutor.inputs.html.prototype.isVisible = function(){
    return this.domElement.is(':visible') && this.domElement.parents( ":hidden" ).length===0;
};

entutor.inputs.html.prototype.start = function () {
    var self=this;
    if( isNaN(this.duration) ){
        this.result.passed=true;
        this.notify([]);
    }else{
        if(this.isVisible()){
            setTimeout(function(){
                // console.log('html 1 ', self.id,' set to passed after '+self.duration);
                self.result.passed=true;
                self.notify([]);
                if(self.hideOnCorrect){
                    self.hide(entutor.hideDelay);
                }
            },self.duration);
        }else{
            self.onShow=function(){
                self.onShow=false;
                setTimeout(function(){
                    // console.log('html 2 ', self.id,' set to passed after '+self.duration);
                    self.result.passed=true;
                    self.notify([]);
                    if(self.hideOnCorrect){
                        self.hide(entutor.hideDelay);
                    }
                },self.duration);
            };
        }
    }
};

entutor.inputs.html.prototype.notify = function (stack) {
    if(this.parent){
        stack.push(this.id);
        this.parent.notify(stack);
        //console.log('html ', this.id,' this.parent.notify(stack); this.result.passed=', this.result.passed);
    }
};



// =============================================================================
//
//    options={
//        type:'text',
//        id:''
//        classes:''
//        maxScore:''
//        pattern:''
//        value:'yyy',
//        size:5,
//        precondition:'none|beforeCorrect'
//        autocheck: true|false
//        resetOnError:true|false
//        customtest:function(value){
//            return {
//              status: entutor.task.status.received,
//              score: null,
//              subresults: [],
//              passed:false|true,
//              maxScore:0
//            }
//        }
//    }
// 
entutor.inputs.text = function (parent, options) {

    var self = this;
     
    this.parent = parent;
    this.type = 'text';
    this.options = options || {};
    this.id = this.parent.id + '_' + (this.options.id || (++entutor.guid));
    this.classes = this.options.classes || '';
    this.maxlength = this.options.maxlength || '';
    this.precondition = this.options.precondition || 'none';
    this.maxScore = (typeof (this.options.maxScore) !== 'undefined') ? this.options.maxScore : 1;
    this.result = null;
    this.pattern = this.options.pattern || null;
    if (typeof (this.pattern) === 'string') {
        this.pattern = this.createRegExp(this.pattern);
    }
    this.customtest = this.options.customtest || false;
    this.autocheck=this.options.autocheck||false;
    this.resetOnError=this.options.resetOnError||false;
    
    this.hideOnCorrect = this.options.hideOnCorrect? true : false;
    
    this.previousValue=this.options.value;
    this.countFailures=0;
    this.hint=this.options.hint||'';

    this.hideDelayed=function(){ self.hide(); };
    this.showDelayed=function(){ self.show(); };

    this.value = false;
};

entutor.inputs.text.prototype.createRegExp = function (str) {
    var tmp1, tmp2;
    tmp1=str.trim();
    tmp2=tmp1.replace(/ +/g,' +');
    tmp1=tmp2.replace(/\\\?/," *\\?");
    tmp2=tmp1.replace(/\\\./," *\\.");
    tmp1=tmp2.replace(/!/," *!");
    //console.log('tmp1='+tmp1);
    var tmp2=new RegExp('^ *' + tmp1 + ' *$');
    return tmp2;
};

entutor.inputs.text.prototype.showSuccess = function () {
    this.textField.removeClass('task-text-error').addClass('task-text-correct');
};

entutor.inputs.text.prototype.showError = function () {
    this.textField.removeClass('task-text-correct').addClass('task-text-error');
};

entutor.inputs.text.prototype.removeFeedback = function () {
    this.textField.removeClass('task-text-correct').removeClass('task-text-error');
};

entutor.inputs.text.prototype.test = function () {
    if (this.value === false) {
        //console.log("this.value===false");
        this.result = {
            status: entutor.task.status.received,
            score: 0,
            passed: 'undefined',
            maxScore: this.maxScore
        };
    } else if (this.customtest) {
        //console.log("this.customtest");
        this.result = this.customtest(this.value);
    } else if (this.pattern) {
        // console.log("this.pattern",this.pattern);
        var isCorrect = this.pattern.test(this.value);
        // console.log("isCorrect",isCorrect);
        this.result = {
            status: entutor.task.status.received,
            score: (isCorrect ? this.maxScore : 0),
            passed: isCorrect,
            maxScore: this.maxScore
        };
    } else {
        //console.log("undefined");
        this.result = {
            status: entutor.task.status.received,
            score: 0,
            passed: 'undefined',
            maxScore: this.maxScore
        };
    }

    this.removeFeedback();
    if (this.result) {
        if (this.result.passed === true) {
            this.showSuccess();
            if(this.hideOnCorrect){
                this.hide(entutor.hideDelay);
            }
        } else if (this.result.passed === false) {
            this.showError();
            if(this.previousValue!==this.value){
                this.countFailures++;
            }
            if(this.countFailures>1){
                this.showHint();
            }
            if(this.resetOnError){
                this.textField.val('');
            }
        }
    }
    
    this.previousValue=this.value;
    if(entutor.verboseTest){
        console.log('verboseTest',this.id, this.type, this.result.passed);
    }
    if(this.parent && this.parent.testFinishedCallback){
        this.parent.testFinishedCallback(this.id, this.result);
    }
};

entutor.inputs.text.prototype.draw = function () {
    this.textField = $('<input type="text"  class="form-control" id="task' + this.id + 'text" value="" maxlength="'+this.maxlength+'" size="' + (this.options.size || '') + '">');
    var self = this;
    this.textField.change(function (ev) {
        self.value = $(ev.target).val();
        self.notify([]);
    });
    if (this.options.value) {
        this.textField.attr('value', this.options.value);
        // this.value = this.options.value;
    }
    this.domElement = $('<span id="task' + this.id + '" class="task-text transition ' + this.classes + '"></span>');
    this.domElement.append(this.textField);

    if (this.precondition === 'beforeCorrect') {
        this.hide();
    }

    return this.domElement;
};

entutor.inputs.text.prototype.getValue = function () {
    return this.value;
};

entutor.inputs.text.prototype.getMaxScore = function () {
    return this.maxScore;
};

entutor.inputs.text.prototype.hide = function (delay) {
    if (delay && parseInt(delay) > 0) {
        setTimeout(this.hideDelayed, entutor.hideDelay);
    } else {
        this.domElement.hide();
    }
};

entutor.inputs.text.prototype.isVisible = function(){
    return this.domElement.is(':visible') && this.domElement.parents( ":hidden" ).length===0;
};

entutor.inputs.text.prototype.show = function (delay) {
    if(this.result.passed===true && this.hideOnCorrect){
        return;
    }
    if(delay && parseInt(delay)>0){
        setTimeout(this.showDelayed,entutor.showDelay);
    }else{
        this.domElement.show();
    }
};

entutor.inputs.text.prototype.start = function () {
    //    if(this.onstart){
    //        for(var j=0; j<this.onstart.length; j++){
    //            this.onstart[j]();
    //        }
    //    }
};

entutor.inputs.text.prototype.notify = function (stack) {
    if(this.autocheck){
        this.test();
    }
    if(this.parent){
        stack.push(this.id);
        this.parent.notify(stack);
    }
};

entutor.inputs.text.prototype.showHint = function () {
    if(this.hint){
        this.textField.tooltip({ content: this.hint, items:'#task' + this.id + 'text' });        
        this.textField.tooltip( "open" );
    }
};









// =============================================================================
//
//    options={
//        type:'radio',
//        id:''
//        classes:''
//        maxScore:1
//        arrange:vertical|horizontal|flow
//        precondition:'none|beforeCorrect'
//        correctVariant:'1',
//        variant:{
//           '1':'1 Correct answer',
//           '2':'2 Wrong answer',
//           '3':'3 Wrong answer'
//        },
//     }
// 
entutor.inputs.radio = function (parent, options) {
    var self = this;
    this.parent = parent;
    this.type = 'radio';
    this.options = options || {};
    this.id = this.parent.id + '_' + (this.options.id || (++entutor.guid));
    this.classes = this.options.classes || '';
    this.maxScore = (typeof (this.options.maxScore) !== 'undefined') ? this.options.maxScore : 1;
    this.correctVariant = this.options.correctVariant || null;
    this.precondition = this.options.precondition || 'none';
    this.value = false;
    this.result = null;
    
    switch(this.options.arrange){
        case 'horizontal':
            this.arrange = 'horizontal';
            break;
        case 'flow':
            this.arrange = 'flow';
            break;
        default:
            this.arrange = 'vertical';
            break;
    }
    this.autocheck=this.options.autocheck||false;
    this.hideOnCorrect = this.options.hideOnCorrect? true : false;

    this.hideDelayed=function(){ self.hide(); };
    this.showDelayed=function(){ self.show(); };

    this.countFailures=0;
    this.hint=this.options.hint||'';
};

entutor.inputs.radio.prototype.showSuccess = function () {
    this.domElement.removeClass('task-radio-error').addClass('task-radio-correct');
};

entutor.inputs.radio.prototype.showError = function () {
    this.domElement.removeClass('task-radio-correct').addClass('task-radio-error');
};

entutor.inputs.radio.prototype.removeFeedback = function () {
    this.domElement.removeClass('task-radio-correct').removeClass('task-radio-error');
};

entutor.inputs.radio.prototype.test = function () {
    if (this.value === false) {
        this.result = {
            status: entutor.task.status.received,
            score: 0,
            passed: 'undefined',
            maxScore: this.maxScore
        };
    } else if (this.correctVariant) {
        var isCorrect = (this.value === this.correctVariant);

        this.result = {
            status: entutor.task.status.received,
            score: isCorrect ? this.maxScore : 0,
            passed: isCorrect,
            maxScore: this.maxScore
        };
    } else {
        this.result = {
            status: entutor.task.status.received,
            score: this.maxScore,
            passed: true,
            maxScore: this.maxScore
        };
    }

    if (this.result && this.result.maxScore > 0) {
        if (this.result.passed === true) {
            this.showSuccess();
            if(this.hideOnCorrect){
                this.hide(entutor.hideDelay);
            }
        } else if (this.result.passed === false) {
            this.showError();
            if(this.previousValue!==this.value){
                this.countFailures++;
            }
            if(this.countFailures>1){
                this.showHint();
            }
        } else {
            this.removeFeedback();
        }
    }
    this.previousValue=this.value;
    if(entutor.verboseTest){
        console.log('verboseTest',this.id, this.type, this.result.passed);
    }
    if(this.parent && this.parent.testFinishedCallback){
        this.parent.testFinishedCallback(this.id, this.result);
    }
};

entutor.inputs.radio.prototype.draw = function () {
    this.domElement = $('<span id="task' + this.id + '" class="task-radiobuttons transition ' + this.classes + ' ' + this.arrange + '"></span>');
    var self = this;
    var onchange = function (el) {
        var btn = $(el.target);
        self.domElement.find('label').removeClass('task-radio-checked');
        if (btn.is(':checked')) {
            self.value = btn.val();
            btn.parent().addClass('task-radio-checked');
        }
        self.notify([]);
    };
    this.radioButtons = [];
    for (var k in this.options.variant) {
        var elm = $('<label class="task-radio-label" data-value="' + k + '"><input type="radio" name="task' + this.id + 'radio"  class="task-radio-btn" value="' + k + '">' + this.options.variant[k] + '</label>');
        elm.change(onchange);
        this.domElement.append(elm);
        this.radioButtons.push(elm);
    }

    if (this.precondition === 'beforeCorrect') {
        this.hide();
    }

    return  this.domElement;
};

entutor.inputs.radio.prototype.getValue = function () {
    return this.value;
};

entutor.inputs.radio.prototype.getMaxScore = function () {
    return this.maxScore;
};

entutor.inputs.radio.prototype.hide = function (delay) {
    if (delay && parseInt(delay) > 0) {
        setTimeout(this.hideDelayed, entutor.hideDelay);
    } else {
        this.domElement.hide();
    }
};

entutor.inputs.radio.prototype.show = function (delay) {
    if(delay && parseInt(delay)>0){
        setTimeout(this.showDelayed,entutor.showDelay);
    }else{
        this.domElement.show();
    }
};

entutor.inputs.radio.prototype.isVisible = function(){
    return this.domElement.is(':visible') && this.domElement.parents( ":hidden" ).length===0;
};

entutor.inputs.radio.prototype.start = function () {
    //    if(this.onstart){
    //        for(var j=0; j<this.onstart.length; j++){
    //            this.onstart[j]();
    //        }
    //    }
};

entutor.inputs.radio.prototype.notify = function (stack) {
    if(this.autocheck){
        this.test();
    }
    if(this.parent){
        stack.push(this.id);
        this.parent.notify(stack);
    }
};

entutor.inputs.radio.prototype.showHint = function () {
    if(this.hint){
        this.domElement.tooltip({ content: this.hint, items:'#task' + this.id });        
        this.domElement.tooltip( "open" );
    }
};




// =============================================================================
//
//    options={
//        type:'checkbox',
//        id:''
//        classes:''
//        maxScore:1
//        correctVariant:false|true,
//        precondition:'none|beforeCorrect'
//        label:'1 check me answer',
//     }
// 
entutor.inputs.checkbox = function (parent, options) {
    var self = this;
    this.parent = parent;
    this.type = 'checkbox';
    this.options = options || {};
    this.id = this.parent.id + '_' + (this.options.id || (++entutor.guid));
    this.classes = this.options.classes || '';
    this.precondition = this.options.precondition || 'none';
    this.maxScore = (typeof (this.options.maxScore) !== 'undefined') ? this.options.maxScore : 1;
    if (this.options.correctVariant === true || this.options.correctVariant === false) {
        this.correctVariant = this.options.correctVariant;
    } else {
        this.correctVariant = null;
    }
    this.result = null;
    this.value = false;
    this.autocheck=this.options.autocheck||false;
    this.hideOnCorrect = this.options.hideOnCorrect? true : false;

    this.hideDelayed=function(){ self.hide(); };
    this.showDelayed=function(){ self.show(); };

    this.countFailures=0;
    this.hint=this.options.hint||'';

};

entutor.inputs.checkbox.prototype.showSuccess = function () {
    this.domElement.removeClass('task-checkbox-error').addClass('task-checkbox-correct');
};

entutor.inputs.checkbox.prototype.showError = function () {
    this.domElement.removeClass('task-checkbox-correct').addClass('task-checkbox-error');
};

entutor.inputs.checkbox.prototype.removeFeedback = function () {
    this.domElement.removeClass('task-checkbox-correct').removeClass('task-checkbox-error');
};

entutor.inputs.checkbox.prototype.test = function () {

    if (this.value === false) {
        this.result = {
            status: entutor.task.status.received,
            score: 0,
            passed: 'undefined',
            maxScore: this.maxScore
        };
    } else if (this.options.correctVariant === true) {
        this.result = {
            status: entutor.task.status.received,
            score: (this.value === 'checked' ? this.maxScore : 0),
            passed: (this.value === 'checked'),
            maxScore: this.maxScore
        };
    } else if (this.options.correctVariant === false) {
        this.result = {
            status: entutor.task.status.received,
            score: (this.value === 'unchecked' ? this.maxScore : 0),
            passed: (this.value === 'unchecked'),
            maxScore: this.maxScore
        };
    } else {
        this.result = {
            status: entutor.task.status.received,
            score: 0,
            passed: 'undefined',
            maxScore: this.maxScore
        };
    }

    if (this.result && this.result.maxScore > 0) {
        if (this.result.passed === true) {
            this.showSuccess();
            if(this.hideOnCorrect){
                this.hide(entutor.hideDelay);
            }
        } else if (this.result.passed === false) {
            this.showError();
            if(this.previousValue!==this.value){
                this.countFailures++;
            }
            if(this.countFailures>0){
                this.showHint();
            }

        } else {
            this.removeFeedback();
        }
    }
    this.previousValue=this.value;
    if(entutor.verboseTest){
        console.log('verboseTest',this.id, this.type, this.result.passed);
    }
    if(this.parent && this.parent.testFinishedCallback){
        this.parent.testFinishedCallback(this.id, this.result);
    }
};

entutor.inputs.checkbox.prototype.draw = function () {
    this.checkbox = $('<input type="checkbox" id="task' + this.id + 'checkbox" class="task-checkbox">');
    var self = this;
    this.checkbox.change(function (ev) {
        var checkbox = $(ev.target)
        self.value = checkbox.prop('checked') ? 'checked' : 'unchecked';
        self.notify([]);
    });
    this.domElement = $('<label id="task' + this.id + '" class="task-checkbox-label transition ' + this.classes + '"></label>');
    this.domElement.append(this.checkbox);
    if (this.options.label) {
        this.domElement.append($('<span class="task-checkbox-label-text">' + this.options.label + '</span>'));
    }


    if (this.precondition === 'beforeCorrect') {
        this.hide();
    }

    return this.domElement;
};

entutor.inputs.checkbox.prototype.getValue = function () {
    return this.value;
};

entutor.inputs.checkbox.prototype.getMaxScore = function () {
    return this.maxScore;
};

entutor.inputs.checkbox.prototype.hide = function (delay) {
    if (delay && parseInt(delay) > 0) {
        setTimeout(this.hideDelayed, entutor.hideDelay);
    } else {
        this.domElement.hide();
    }
};

entutor.inputs.checkbox.prototype.show = function (delay) {
    if(delay && parseInt(delay)>0){
        setTimeout(this.showDelayed,entutor.showDelay);
    }else{
        this.domElement.show();
    }
};

entutor.inputs.checkbox.prototype.isVisible = function(){
    return this.domElement.is(':visible') && this.domElement.parents( ":hidden" ).length===0;
};

entutor.inputs.checkbox.prototype.start = function () {
    //    if(this.onstart){
    //        for(var j=0; j<this.onstart.length; j++){
    //            this.onstart[j]();
    //        }
    //    }
};

entutor.inputs.checkbox.prototype.notify = function (stack) {
    if(this.autocheck){
        this.test();
    }
    if(this.parent){
        stack.push(this.id);
        this.parent.notify(stack);
    }
};

entutor.inputs.checkbox.prototype.showHint = function () {
    if(this.hint){
        this.domElement.tooltip({ content: this.hint, items:'#task' + this.id });        
        this.domElement.tooltip( "open" );
    }
};







///////////
// =============================================================================
//
//    options={
//        type:'sound',
//        id:''
//        classes:''
//        maxScore:''
//        precondition:'none' | 
//        supplied : "mp3,oga,wav"
//    this.labels = options.labels || {};
//    this.labels.playing = this.labels.playing || '||';
//    this.labels.paused  = this.labels.paused  || '>' ;
//    media:{
//                 title:'Бублички',
//                 mp3:'./playmessage/bublichki.mp3'
//                 oga:
//                 wav:
//          }
//    precondition:'none|beforeCorrect'
//    }
entutor.inputs.sound = function (parent, options) {
    
    var self = this;
    
    this.type = 'sound';
    this.parent = parent;
    this.options = options || {};
    this.id = this.parent.id + '_' + (this.options.id || (++entutor.guid));
    this.classes = this.options.classes || '';
    this.precondition = this.options.precondition || 'none';
    this.swfPath = this.options.swfPath || entutor.config.swfPath;
    this.supplied = this.options.supplied || "mp3,oga,wav";
    this.autostart=this.options.autostart?true:false;
    this.hideOnCorrect = this.options.hideOnCorrect? true : false;
    this.completeViewRequired = this.options.completeViewRequired? true :false;
    if(this.completeViewRequired){
        this.passed=false;
    }else{
        this.passed=true;
    }

    this.maxScore = 1;

    this.media = options.media || {};
    this.labels = options.labels || {};
    this.labels.playing = this.labels.playing || '||';
    this.labels.paused = this.labels.paused || '>';
    
    this.hideDelayed=function(){ self.hide(); };
    this.showDelayed=function(){ self.show(); };

    // entutor.jplayers[this.id] = this;
};

entutor.inputs.sound.prototype.test = function (testFinishedCallback) {
    this.result={
        status: entutor.task.status.received,
        score: this.passed?1:0,
        passed: this.passed,
        maxScore: 0
    };
    if(entutor.verboseTest){
        console.log('verboseTest',this.id, this.type, this.result.passed);
    }
    if(this.parent && this.parent.testFinishedCallback){
        this.parent.testFinishedCallback(this.id, this.result);
    }
};

entutor.inputs.sound.prototype.draw = function () {
    var self = this;

    var html = "";
    html += '<div id="jquery_jplayer_' + this.id + '" class="jp-jplayer" style="width:1px;height:1px;opacity:0;float:right;"></div>';
    html += '<div id="jp_container_' + this.id + '" class="jp-audio" role="application" aria-label="media player" style="width:1px;height:1px;opacity:0;float:right;">';
    html += '	<div class="jp-type-single">';
    html += '		<div class="jp-no-solution">';
    html += '			<span>Update Required</span>';
    html += '			To play the media you will need to either update your browser to a recent version or update your <a href="http://get.adobe.com/flashplayer/" target="_blank">Flash plugin</a>.';
    html += '		</div>';
    html += '	</div>';
    html += '</div>';
    html += '<span id="sound_' + this.id + '" class="task-sound-button"></span>';

    this.domElement = $('<span id="task' + this.id + '" class="task-sound transition ' + this.classes + '"></span>');
    this.domElement.append($(html));


    this.player = this.domElement.find("#jquery_jplayer_" + this.id);
    var soundBlock = this.domElement.find('#sound_' + this.id);

    this.currenttrack = false;

    this.btn = $("<input type='button' id='sound_" + this.id +  "_btn' class='sound_button' value='>'>");
    soundBlock.append(this.btn);
    
    soundBlock.append($("<span class='task-sound-label'>&nbsp;" + this.media.title + "</span>"));

    this.btn.click(function (ev) {
        var btn = $(this);
        btn.attr('value', self.labels.paused);
        if (self.player.data().jPlayer.status.paused) {
            self.player.jPlayer("pauseOthers");
            $('.sound_button').attr('value', self.labels.paused);
            self.player.jPlayer("play");
            btn.attr('value', self.labels.playing);
        } else {
            self.player.jPlayer("pause");
            btn.attr('value', self.labels.paused);
        }
    });

    if (this.precondition === 'beforeCorrect') {
        this.hide();
    }

    return this.domElement;
};

entutor.inputs.sound.prototype.getValue = function () {
    return null;
};

entutor.inputs.sound.prototype.getMaxScore = function () {
    return this.maxScore;
};

entutor.inputs.sound.prototype.hide = function (delay) {
    if (delay && parseInt(delay) > 0) {
        setTimeout(this.hideDelayed, entutor.hideDelay);
    } else {
        this.domElement.hide();
        this.player.jPlayer("pause");
        $('.sound_button').attr('value', this.labels.paused);
    }
};

entutor.inputs.sound.prototype.show = function (delay) {
    if(delay && parseInt(delay)>0){
        setTimeout(this.showDelayed,entutor.showDelay);
    }else{
        this.domElement.show();
        if(this.onShow){
            this.onShow();
            this.onShow = false;
        }
    }
};

entutor.inputs.sound.prototype.isVisible = function(){
    return this.domElement.is(':visible') && this.domElement.parents( ":hidden" ).length===0;
};

entutor.inputs.sound.prototype.start = function () {
    // console.log("entutor.inputs.sound.prototype.start");
    var self=this;
    this.player.jPlayer({
        ready: function () {
            $(this).jPlayer("setMedia", self.media);
            if(self.autostart){
                if(self.isVisible()){
                    self.player.jPlayer("pauseOthers");
                    $('.sound_button').attr('value', self.labels.paused);
                    self.player.jPlayer("play");
                    self.btn.attr('value', self.labels.playing);            
                }else{
                    self.onShow=function(){
                        self.player.jPlayer("pauseOthers");
                        $('.sound_button').attr('value', self.labels.paused);
                        self.player.jPlayer("play");
                        self.btn.attr('value', self.labels.playing);            
                    };
                }
            }
        },
        swfPath: this.swfPath,
        supplied: this.supplied,
        wmode: "window",
        useStateClassSkin: true,
        autoBlur: false,
        smoothPlayBar: true,
        keyEnabled: true,
        remainingDuration: true,
        volume: 1,
        toggleDuration: true,
        ended: function () {
            self.btn.attr('value', self.labels.paused);
            self.passed=true;
            self.notify([]);
            if(self.hideOnCorrect){
                self.hide();
            }
        }
    });


};

entutor.inputs.sound.prototype.notify = function (stack) {
    if(this.parent){
        stack.push(this.id);
        this.parent.notify(stack);
    }
};

















///////////
// =============================================================================
//
//    options={
//        type:'video',
//        id:''
//        classes:''
//        maxScore:''
//        supplied: "webmv, ogv, m4v",
//        swfPath: "./jplayer/jplayer",
//        size:{width:'440px',height:'360px'},
//        precondition:'none|beforeCorrect'
//        media: {
//                 title:'Бублички',
//                 m4v:'./videomessage/talos.mp4'
//                 webmv:
//                 ogv:
//        }
//    subtitles:[
//          {
//                 html:'Бублички',
//                 from:1
//                 to:2
//          },
//          {
//                 html:'Бублички',
//                 from:2
//                 to:3
//          },
//          {
//                 html:'Бублички',
//                 from:3
//                 to:4
//          },
//    ];
//    }
entutor.inputs.video = function (parent, options) {
    var self=this;
    
    this.type = 'video';
    this.parent = parent;
    this.options = options || {};
    this.id = this.parent.id + '_' + (this.options.id || (++entutor.guid));
    this.classes = this.options.classes || '';
    this.precondition = this.options.precondition || 'none';
    this.supplied = this.options.supplied || "webmv, ogv, m4v";
    this.swfPath = this.options.swfPath || entutor.config.swfPath;
    this.maxScore = 1;
    //this.passed=false;
    this.autostart=this.options.autostart||false;
    this.hideOnCorrect = this.options.hideOnCorrect? true : false;
    this.completeViewRequired = this.options.completeViewRequired? true :false;

    if(this.completeViewRequired){
        this.passed=false;
    }else{
        this.passed=true;
    }
    


    this.subtitles = this.options.subtitles || [];
    
    this.searchSubtitle=function(currentTime){
    	for(var i=0; i<this.subtitles.length; i++ ){
            if(this.subtitles[i].from <= currentTime &&  currentTime <= this.subtitles[i].to){
                    return this.subtitles[i];
            }
    	}
    	return null;
    };
    
    this.showSubtitle=function(frame){
  	if(frame){
            this.subtitleDom.html(frame.html);
  	}else{
            this.subtitleDom.html("<div>&nbsp;</div>");
  	}
    };

    this.timeupdate = function(event){
        var currentTime=event.jPlayer.status.currentTime;
        // console.log(currentTime);
        if( ! self.presentationCurrentSlide
            || self.presentationCurrentSlide.from > currentTime
            || self.presentationCurrentSlide.to < currentTime ){
            self.presentationCurrentSlide=self.searchSubtitle(currentTime);
            self.showSubtitle(self.presentationCurrentSlide);
        }
    };
    
    this.labels = options.labels || {};
    this.labels.playing = this.labels.playing || '||';
    this.labels.paused = this.labels.paused || '>';
    this.media = options.media || {};
    // entutor.jplayers[this.id] = this;
    
    this.hideDelayed=function(){ self.hide(); };
    this.showDelayed=function(){ self.show(); };
};

entutor.inputs.video.prototype.test = function (testFinishedCallback) {
    this.result={
        status: entutor.task.status.received,
        score: this.passed?this.maxScore:0,
        passed: this.passed,
        maxScore: this.maxScore
    };
    if(entutor.verboseTest){
        console.log('verboseTest',this.id, this.type, this.result.passed);
    }
    if(this.parent && this.parent.testFinishedCallback){
        this.parent.testFinishedCallback(this.id, this.result);
    }
};

entutor.inputs.video.prototype.draw = function () {
    var self = this;

    var html = "";

    html += '<div id="jp_container_' + this.id + '" class="jp-video" role="application" aria-label="media player">';
    html += '  <div class="jp-type-single">';
    html += '    <div id="jquery_jplayer_' + this.id + '" class="jp-jplayer"></div>';
    html += '    <div class="jp-gui">';
    html += '      <div class="jp-interface">';
    html += '        <div class="jp-progress">';
    html += '          <div class="jp-seek-bar">';
    html += '            <div class="jp-play-bar"></div>';
    html += '          </div>';
    html += '        </div>';
    html += '        <div class="jp-current-time" role="timer" aria-label="time">&nbsp;</div>';
    html += '        <div class="jp-duration" role="timer" aria-label="duration">&nbsp;</div>';
    html += '        <div class="jp-controls-holder">';
    html += '          <div class="jp-volume-controls">';
    html += '            <button class="jp-mute" role="button" tabindex="0">mute</button>';
    html += '            <button class="jp-volume-max" role="button" tabindex="0">max volume</button>';
    html += '            <div class="jp-volume-bar">';
    html += '              <div class="jp-volume-bar-value"></div>';
    html += '            </div>';
    html += '          </div>';
    html += '          <div class="jp-controls">';
    html += '            <button class="jp-play" role="button" tabindex="0">play</button>';
    html += '            <button class="jp-stop" role="button" tabindex="0">stop</button>';
    html += '          </div>';
    html += '          <div class="jp-toggles">';
    html += '            <button class="jp-repeat" role="button" tabindex="0">repeat</button>';
    html += '            <button class="jp-full-screen" role="button" tabindex="0">full screen</button>';
    html += '          </div>';
    html += '        </div>';
    html += '      </div>';
    html += '    </div>';
    html += '    <div class="jp-no-solution">';
    html += '      <span>Update Required</span>';
    html += '      To play the media you will need to either update your browser to a recent version or update your <a href="http://get.adobe.com/flashplayer/" target="_blank">Flash plugin</a>.';
    html += '    </div>';
    html += '  </div>';
    html += '</div>';
    html += '<div id="jp_subtitles_' + this.id + '" class="jp-subtitles"></div>';

    this.domElement = $('<span id="task' + this.id + '" class="task-video transition ' + this.classes + '"></span>');
    this.domElement.append($(html));

    this.player = this.domElement.find("#jquery_jplayer_" + this.id);

    this.subtitleDom = this.domElement.find("#jp_subtitles_" + this.id);
    if(this.subtitles.length===0){
        this.subtitleDom.hide();
    }

    if (this.options.size) {
        this.player.jPlayer("option", "size", this.options.size);
    }

    if (this.precondition === 'beforeCorrect') {
        this.hide();
    }

    return this.domElement;
};

entutor.inputs.video.prototype.getValue = function () {
    return null;
};

entutor.inputs.video.prototype.getMaxScore = function () {
    return this.maxScore;
};

entutor.inputs.video.prototype.hide = function (delay) {
    if (delay && parseInt(delay) > 0) {
        setTimeout(this.hideDelayed, entutor.hideDelay);
    } else {
        this.domElement.hide();
        this.player.jPlayer("pause");
    }
};

entutor.inputs.video.prototype.show = function (delay) {
    if(delay && parseInt(delay)>0){
        setTimeout(this.showDelayed,entutor.showDelay);
    }else{
        this.domElement.show();
        if(this.onShow){
            this.onShow();
            this.onShow = false;
        }
    }
};

entutor.inputs.video.prototype.isVisible = function(){
    return this.domElement.is(':visible') && this.domElement.parents( ":hidden" ).length===0;
};

entutor.inputs.video.prototype.start = function () {
    var self=this;

    this.player.jPlayer({
        ready: function () { 
            $(this).jPlayer("setMedia", self.media);
            if(self.autostart){
                if(self.isVisible()){
                    self.player.jPlayer("pauseOthers");
                    self.player.jPlayer("play");         
                }else{
                    self.onShow=function(){
                        self.player.jPlayer("pauseOthers");
                        self.player.jPlayer("play");           
                    }
                }
            }
        },
        swfPath: this.swfPath,
        supplied: this.supplied,
        cssSelectorAncestor: '#jp_container_' + self.id ,
        wmode: "window",
        useStateClassSkin: true,
        autoBlur: false,
        smoothPlayBar: true,
        keyEnabled: true,
        remainingDuration: true,
        toggleDuration: true,
        volume:1,
        timeupdate: self.timeupdate,
        ended:function(){ 
            self.passed=true; 
            self.notify([]);
            if(self.hideOnCorrect){
                self.hide();
            }
        }
        
    });


};

entutor.inputs.video.prototype.notify = function (stack) {
    if(this.parent){
        stack.push(this.id);
        this.parent.notify(stack);
    }
};
































// =============================================================================
//
//    options={
//        type:'counter', // draggable answer
//        id:''
//        classes:''
//        precondition:'none|beforeCorrect'
//        innerHtml:'1 check me answer', // visible text or html code
//        value:'' // value that will be checked, if not set the innerHtml is used
//     }
// 

entutor.inputs.counter = function (parent, options) {
    var self = this;
    this.parent = parent;
    this.type = 'counter';
    this.options = options || {};
    this.id = this.parent.id + '_' + (this.options.id || (++entutor.guid));
    this.classes = this.options.classes || '';
    this.precondition = this.options.precondition || 'none';
    this.value = this.options.value || '';
    
    this.hideDelayed=function(){ self.hide(); };
    this.showDelayed=function(){ self.show(); };
};

entutor.inputs.counter.prototype.test = function (testFinishedCallback) {
    this.result={
        status: entutor.task.status.received,
        score: 0,
        passed: true,
        maxScore: 0
    };
    if(entutor.verboseTest){
        console.log('verboseTest',this.id, this.type, this.result.passed);
    }
    if(this.parent && this.parent.testFinishedCallback){
        this.parent.testFinishedCallback(this.id, this.result);
    }
};

entutor.inputs.counter.prototype.draw = function () {
    var self = this;

    this.counterplace = $('<span id="task' + this.id + 'counterplace"  data-id="' + this.id + '" class="task-counterplace transition ' + this.classes + '"></span>');
    this.counter = $('<span id="task' + this.id + 'counter" data-id="' + this.id + '" class="task-counter transition ' + this.classes + '">' + this.options.innerHtml + '</span>');
    if (this.value) {
        this.counter.attr('data-value', this.value);
    } else {
        this.counter.attr('data-value', this.counter.text());
    }

    
    this.counter.draggable({
        containment: 'document',
        //revert: true,
        start: function (event, ui) {
            if (!$(ui.helper).attr('data-top')) {
                $(ui.helper).attr('data-top', ui.position.top);
                $(ui.helper).attr('data-left', ui.position.left);
            }
            if(!self.width){
                self.width=self.counterplace.width();
                self.height=self.counterplace.height();                
                self.counterplace.css({width:self.width+'px', height:self.height+'px'});
            }
            self.counter.css("z-index",1000);
        },
        stop: function (event, ui) {

            var left = ui.offset.left;
            var top = ui.offset.top;
            var dLeft = ui.helper.width();
            var dTop = ui.helper.height();
            var j = false, dmax = false, d;
            for (var i in entutor.dropzones) {
                d = entutor.dropzones[i].overlap(left, top, dLeft, dTop);
                // console.log(i,d);
                if (d > 0) {
                    if (j === false) {
                        j = i;
                        dmax = d;
                    } else if (d > dmax) {
                        j = i;
                        dmax = d;
                    }
                }
            }
            if (j === false) {
                // revert
                self.counterplace.append(self.counter);
                self.counter.css({left: self.counter.attr('data-left') +'px',top: self.counter.attr('data-top')+'px'});
                entutor.dropzones[i].removeChild(self);
                //self.counter.animate(
                //        {left: self.counter.attr('data-left') + 'px', top: self.counter.attr('data-top') + 'px'},
                //        "slow",
                //        "swing",
                //        function () {
                //            for (var i in entutor.dropzones) {
                //                entutor.dropzones[i].removeChild(self);
                //            }
                //        }
                //);
            } else {
                for (var i in entutor.dropzones) {
                    if (i === j) {
                        entutor.dropzones[j].addChild(self);
                    } else {
                        entutor.dropzones[i].removeChild(self);
                    }
                }
            }
            self.counter.css("z-index",1);
        }
    });

    // only for touchscreens
    this.counter.click(function(){
        if(entutor.currentCounter){
            if(entutor.currentCounter.id===self.id){
                entutor.currentCounter.counter.removeClass('task-counter-active');
                entutor.currentCounter=false;                
                
            }else{
                entutor.currentCounter.counter.removeClass('task-counter-active');
                entutor.currentCounter=false;

                entutor.currentCounter=self;
                entutor.currentCounter.counter.addClass('task-counter-active');
                if (!entutor.currentCounter.counter.attr('data-top')) {
                    var position = entutor.currentCounter.counter.position();
                    entutor.currentCounter.counter.attr('data-top',  position.top);
                    entutor.currentCounter.counter.attr('data-left', position.left);
                }
            }
        }else{
            entutor.currentCounter=self;
            entutor.currentCounter.counter.addClass('task-counter-active');
            if (!entutor.currentCounter.counter.attr('data-top')) {
                var position = entutor.currentCounter.counter.position();
                entutor.currentCounter.counter.attr('data-top',  position.top);
                entutor.currentCounter.counter.attr('data-left', position.left);
            }
            if(!self.width){
                self.width=self.counterplace.width();
                self.height=self.counterplace.height();                
                self.counterplace.css({width:self.width+'px', height:self.height+'px'});
            }
        }        
        
    });
    this.counterplace.append(this.counter);

    // only for touchscreens
    this.counterplace.click(function(e){
        if(e.target!=this){
            return;
        }
        if(entutor.currentCounter){
            entutor.currentCounter.counter.removeClass('task-counter-active');
            for (var i in entutor.dropzones) {
                entutor.dropzones[i].removeChild(entutor.currentCounter);
            }
            entutor.currentCounter.counterplace.append(entutor.currentCounter.counter);
            entutor.currentCounter.counter.css({left: entutor.currentCounter.counter.attr('data-left') +'px',top: entutor.currentCounter.counter.attr('data-top')+'px'});
            
            entutor.currentCounter=false;

        }
    });

    if (this.precondition === 'beforeCorrect') {
        this.hide();
    }

    return this.counterplace;
};

entutor.inputs.counter.prototype.getValue = function () {
    return null;
};

entutor.inputs.counter.prototype.getMaxScore = function () {
    return 0;
};

entutor.inputs.counter.prototype.hide = function (delay) {
    if (delay && parseInt(delay) > 0) {
        setTimeout(this.hideDelayed, entutor.hideDelay);
    } else {
        this.counterplace.hide();
        this.counter.hide();
    }

};

entutor.inputs.counter.prototype.show = function (delay) {
    if(delay && parseInt(delay)>0){
        setTimeout(this.showDelayed,entutor.showDelay);
    }else{
        this.counterplace.show();
        this.counter.show();
    }
};

entutor.inputs.counter.prototype.start = function () {
    //var w=this.counterplace.width();
    //var h=this.counterplace.height();
    //var w=this.counter.width();
    //var h=this.counter.height();
    //this.counterplace.css({width:w+'px', height:h+'px'});
};

entutor.inputs.counter.prototype.isVisible = function(){
    return this.domElement.is(':visible') && this.domElement.parents( ":hidden" ).length===0;
};

entutor.inputs.counter.prototype.notify = function (stack) {
    if(this.parent){
        stack.push(this.id);
        this.parent.notify(stack);
    }
};

















// =============================================================================
//
//    options={
//        type:'dropzone',
//        id:''
//        classes:''
//        maxScore:1
//        precondition:'none|beforeCorrect'
//        ejectCounterOnError:true|false
//        customtest:function(value){
//            return {
//              status: entutor.task.status.received,
//              score: null,
//              subresults: [],
//              passed:false|true,
//              maxScore:0
//            }
//        }
//        pattern: //regexp, patternt to check if value of dropped counter is correct
//        size: // integer, width of placehoder, css property, units are 'em'
//     }
// 

entutor.inputs.dropzone = function (parent, options) {
    var self = this;
    // console.log(options);
    this.parent = parent;
    this.type = 'dropzone';
    this.options = options || {};
    this.id = this.parent.id + '_' + (this.options.id || (++entutor.guid));
    this.classes = this.options.classes || '';
    this.precondition = this.options.precondition || 'none';
    this.maxScore = (typeof (this.options.maxScore) !== 'undefined') ? this.options.maxScore : 1;
    this.result = null;
    
    this.options.pattern = this.options.pattern || '';
    var pattern = this.options.pattern.split("\n");
    this.pattern=[];
    for(var i=0; i<pattern.length; ++i){
        if(pattern[i].length > 0 ){
            //this.pattern.push( new RegExp('^ *' + ( pattern[i].replace('/ +/',' +') ) + ' *$') );
            this.pattern.push( new RegExp('^' + pattern[i] + '$') );
        }
    }
    
    this.offset = null;
    
    this.customtest = false;
    if(typeof(this.options.test)==="function"){
        this.customtest = this.options.test;
    } else if(typeof(this.options.test)==="string"){
        switch(this.options.test){
            case "testSequence": this.customtest=this.testSequence; break;
            case "testSet": this.customtest=this.testSet; break;
        }
    }
    if(this.customtest===false){
        this.customtest=this.testSet;
    }

    this.multiple = this.options.multiple || false;
    this.child = [];
    this.value = [];
    this.autocheck=this.options.autocheck||false;
    this.hideOnCorrect = this.options.hideOnCorrect? true : false;

    this.countFailures=0;
    this.hint=this.options.hint||'';

    this.hideDelayed=function(){ self.hide(); };
    this.showDelayed=function(){ self.show(); };

    //this.id
    entutor.dropzones[this.id] = this;
    // console.log(this);
};

entutor.inputs.dropzone.prototype.showSuccess = function () {
    this.dropzone.removeClass('task-dropzone-error').addClass('task-dropzone-correct');
};

entutor.inputs.dropzone.prototype.showError = function () {
    this.dropzone.removeClass('task-dropzone-correct').addClass('task-dropzone-error');
};

entutor.inputs.dropzone.prototype.removeFeedback = function () {
    this.dropzone.removeClass('task-dropzone-correct').removeClass('task-dropzone-error');
};

entutor.inputs.dropzone.prototype.testSequence=function(value){

    var result = {
        status: entutor.task.status.received,
        score: 0,
        passed: false,
        maxScore: this.maxScore,
        subresult:[]
    };
    
    for(var iP=0; iP<this.pattern.length; ++iP){
        if(typeof(value[iP])==='undefined'){
            result.subresult[iP]=false;
        }else{
            result.subresult[iP]=this.pattern[iP].test(value[iP]);
        }
    }

    var isCorrect=result.subresult[0];
    for(var iP=1; iP<this.pattern.length; ++iP){
        isCorrect = (result.subresult[iP] && isCorrect);
    }
    
    result.score= (isCorrect ? this.maxScore : 0);
    result.passed=isCorrect;
    
    return result;
};

entutor.inputs.dropzone.prototype.testSet=function(value){

    var result = {
        status: entutor.task.status.received,
        score: 0,
        passed: false,
        maxScore: this.maxScore,
        subresult:[]
    };
    
    for(var iP=0; iP<this.pattern.length; ++iP){
        result.subresult[iP]=false;
        for(var iV=0; iV<value.length; iV++){
            if(this.pattern[iP].test(value[iV])){
                result.subresult[iP]=true;
                break;
            }
        }
    }

    var isCorrect=result.subresult[0];
    for(var iP=1; iP<this.pattern.length; ++iP){
        isCorrect = (result.subresult[iP] && isCorrect);
    }
    
    result.score= (isCorrect ? this.maxScore : 0);
    result.passed=isCorrect;
    
    return result;
};

entutor.inputs.dropzone.prototype.test = function () {
    if (this.value.length === 0) {
        this.result = {
            status: entutor.task.status.received,
            score: 0,
            passed: 'undefined',
            maxScore: this.maxScore
        };
    } else if (this.customtest) {
        this.result = this.customtest(this.value);
    } else {
        this.result = {
            status: entutor.task.status.received,
            score: 0,
            passed: 'undefined',
            maxScore: this.maxScore
        };
    }

    this.removeFeedback();
    if (this.result && this.result.maxScore > 0) {
        if (this.result.passed === true) {
            this.showSuccess();
            if(this.hideOnCorrect){
                this.hide(entutor.hideDelay);
            }
        } else if (this.result.passed === false) {
            this.showError();
            if(this.previousValue!==this.value){
                this.countFailures++;
            }
            if(this.countFailures>1){
                this.showHint();
            }

        }
    }

    if (this.options.ejectCounterOnError && this.result.passed !== true) {

        for(var iV=this.value.length-1; iV>=0; --iV){
            var isCorrect=false;
            for(var iP=0; iP<this.pattern.length; ++iP){
                isCorrect = (this.pattern[iP].test(this.value[iV]) || isCorrect );
            }
            if(!isCorrect){
                // revert
                this.child[iV].counterplace.append(this.child[iV].counter);
                this.child[iV].counter.css({left: this.child[iV].counter.attr('data-left') +'px',top: this.child[iV].counter.attr('data-top')+'px'});
                this.removeChild(this.child[iV]);
            }
        }
    }
    this.previousValue=this.value;
    if(entutor.verboseTest){
        console.log('verboseTest',this.id, this.type, this.result.passed);
    }
    if(this.parent && this.parent.testFinishedCallback){
        this.parent.testFinishedCallback(this.id, this.result);
    }
};

entutor.inputs.dropzone.prototype.draw = function () {

    var self = this;

    this.dropzone = $('<span id="task' + this.id + 'dropzone" class="task-dropzone transition" style="min-width:' + (this.options.size || '4') + 'em;"></span>');

    if (this.precondition === 'beforeCorrect') {
        this.hide();
    }

    // only for touchscreens
    this.dropzone.click(function(e){
        if(entutor.currentCounter && e.target===this){
            self.addChild(entutor.currentCounter);
            entutor.currentCounter.counter.removeClass('task-counter-active');
            entutor.currentCounter=false;
        }
    });

    return this.dropzone;
};

entutor.inputs.dropzone.prototype.getValue = function () {
    return this.value;
};

entutor.inputs.dropzone.prototype.getMaxScore = function () {
    return this.maxScore;
};

entutor.inputs.dropzone.prototype.hide = function (delay) {
    if (delay && parseInt(delay) > 0) {
        setTimeout(this.hideDelayed, entutor.hideDelay);
    } else {
        this.dropzone.hide();
    }
};

entutor.inputs.dropzone.prototype.show = function (delay) {
    if(delay && parseInt(delay)>0){
        setTimeout(this.showDelayed,entutor.showDelay);
    }else{
        this.dropzone.show();
    }
};

entutor.inputs.dropzone.prototype.isVisible = function(){
    return this.domElement.is(':visible') && this.domElement.parents( ":hidden" ).length===0;
};

entutor.inputs.dropzone.prototype.overlap = function (left, top, dLeft, dTop) {
    // console.log("counter ",left, top, dLeft, dTop);
    var offset = this.dropzone.offset();
    
    var width = this.dropzone.width()
            + parseInt(this.dropzone.css('padding-left'))
            + parseInt(this.dropzone.css('padding-right'));
    var height = this.dropzone.height()
            + parseInt(this.dropzone.css('padding-top'))
            + parseInt(this.dropzone.css('padding-bottom'));
    
    
    // console.log("dropzone "+this.id,offset.left, offset.top, width, height);

    var notContains = (left >= offset.left + width)
            || (left + dLeft <= offset.left)
            || (top >= offset.top + height)
            || (top + dTop <= offset.top);
    // console.log("notContains ",notContains);
    if (notContains) {
        return 0;
    }
    var xMin = (left > offset.left) ? left : offset.left;
    var xMax = (left + dLeft > offset.left + width) ? offset.left + width : left + dLeft;

    var yMin = (top > offset.top) ? top : offset.top;
    var yMax = (top + dTop > offset.top + height) ? offset.top + height : top + dLeft;

    return (xMax - xMin) * (yMax - yMin);
};

entutor.inputs.dropzone.prototype.addChild = function (child) {
    
    // do not add the same child again
    for(var i=0; i<this.child.length; i++){
        if(this.child[i].id === child.id){
            return;
        }
    }

    // 
    if(!this.multiple && this.child.length>0) {
        for(var i=0; i<this.child.length; i++){
            this.child[i].counterplace.append(this.child[i].counter);
            this.child[i].counter.css({
                left: this.child[i].counter.attr('data-left') +'px',
                top: this.child[i].counter.attr('data-top')+'px'
            });
        }
        this.value = [];
        this.child = [];
    }
    
    this.child.push(child);
    
    this.dropzone.append(child.counter);
    //    child.counter.css({
    //        left:( - parseInt(this.dropzone.css('padding-left')) ) +'px',
    //        top: (-parseInt(this.dropzone.css('padding-top')))+'px'
    //    });
    child.counter.css({left:'0px',top: '0px'});

    this.value.push( child.counter.attr('data-value') );
    
    // console.log(this.value, this.child);
    this.notify([]);
};

entutor.inputs.dropzone.prototype.removeChild = function (child) {
   for(var i=0; i<this.child.length; i++){
        if(this.child[i].id === child.id){
            this.value.splice(i,1);
            this.child.splice(i,1);
            this.notify([]);
            return;
        }
    }
};

entutor.inputs.dropzone.prototype.start = function () {
};

entutor.inputs.dropzone.prototype.notify = function (stack) {
    if(this.autocheck){
        this.test();
    }
    if(this.parent){
        stack.push(this.id);
        this.parent.notify(stack);
    }
};

entutor.inputs.dropzone.prototype.showHint = function () {
    if(this.hint){
        this.domElement.tooltip({ content: this.hint, items:'#task' + this.id });        
        this.domElement.tooltip( "open" );
    }
};


















// =============================================================================
//
//    options={
//        type:'playlist',
//        id:''
//        classes:''
//        maxScore:''
//        supplied: "mp3,oga,wav",
//        swfPath: "./jplayer/jplayer",
//        precondition:'none|beforeCorrect'
//    labels:{
//        playing:'||'
//        paused:'>'
//    }
//    playlist:[
//          {
//                 title:'Бублички',
//                 mp3:'./playmessage/bublichki.mp3'
//                 oga:
//                 wav:
//          },
//          {
//                 title:'В землянке',
//                 mp3:'./playmessage/v_zemlyanke.mp3'
//                 oga:
//                 wav:
//          },
//          {
//                 title:'Сердце',
//                 mp3:'./playmessage/serdtse.mp3'
//                 oga:
//                 wav:
//          },
//    ];
//    }
entutor.inputs.playlist = function (parent, options) {
    var self = this;
    this.type = 'playlist';
    this.parent = parent;
    this.options = options || {};
    this.id = this.parent.id + '_' + (this.options.id || (++entutor.guid));
    this.classes = this.options.classes || '';
    this.precondition = this.options.precondition || 'none';
    this.swfPath = this.options.swfPath || entutor.config.swfPath;
    this.supplied = this.options.supplied || "mp3,oga,wav";

    this.maxScore = 0;
    this.labels = options.labels || {};
    this.labels.playing = this.labels.playing || '||';
    this.labels.paused = this.labels.paused || '>';
    this.media = options.media || {};

    this.playlist = this.options.playlist || [];

    this.hideDelayed=function(){ self.hide(); };
    this.showDelayed=function(){ self.show(); };

    this.currenttrack = false;
    // console.log(this);
    //entutor.jplayers[this.id] = this;
};

entutor.inputs.playlist.prototype.test = function (testFinishedCallback) {
    this.result={
        status: entutor.task.status.received,
        score: 0,
        passed: true,
        maxScore: 0
    };
    if(entutor.verboseTest){
        console.log('verboseTest',this.id, this.type, this.result.passed);
    }
    if(this.parent && this.parent.testFinishedCallback){
        this.parent.testFinishedCallback(this.id, this.result);
    }
};

entutor.inputs.playlist.prototype.draw = function () {
    
    // console.log(this.playlist);
    var self = this;

    this.domElement = $('<span id="task' + this.id + '" class="task-playlist transition ' + this.classes + '"></span>');

    var html = "";

    html += '<div id="jp_container_' + this.id + '" class="jp-audio" role="application" aria-label="media player" style="width:1px;height:1px;opacity:0;float:right;overflow:hidden;">';
    html += '   <div id="jquery_jplayer_' + this.id + '" class="jp-jplayer"></div>';
    html += '	<div class="jp-type-single">';
    html += '		<div class="jp-no-solution">';
    html += '			<span>Update Required</span>';
    html += '			To play the media you will need to either update your browser to a recent version or update your <a href="http://get.adobe.com/flashplayer/" target="_blank">Flash plugin</a>.';
    html += '		</div>';
    html += '	</div>';
    html += '</div>';

    this.domElement.append($(html));

    var playlistBlock = $('<div id="playlist_' + this.id + '"></div>');
    this.domElement.append(playlistBlock);

    var item;
    for (var i = 0; i < this.playlist.length; i++) {
        //console.log(this.playlist[i]);
        var item = "<div class='playlist_item'><input type='button' id='playlist_" + this.id + "_" + i + "' data-i='" + i + "' class='playlist_button' value='>'>&nbsp;" + this.playlist[i].title + "</div>";
        playlistBlock.append($(item));
    }
    
    playlistBlock.find('.playlist_button').click(function (ev) {
        var btn = $(this);
        var i = btn.attr('data-i');
        var player = $("#jquery_jplayer_" + self.id);
        // console.log(player);
    
        if (self.currenttrack === i) {
            if (player.data().jPlayer.status.paused) {
                player.jPlayer("pauseOthers");
                player.jPlayer("play");
                btn.attr('value', self.labels.playing);
            } else {
                player.jPlayer("pause");
                btn.attr('value', self.labels.paused);
  	    }
        } else {
            self.currenttrack = i;
            player.jPlayer("stop");
            player.jPlayer("setMedia", self.playlist[i]);
            player.jPlayer("play");
            playlistBlock.find('.playlist_button').attr('value', self.labels.paused);
            btn.attr('value', self.labels.playing);
        }
    });
    
    if (this.precondition === 'beforeCorrect') {
        this.hide();
    }

    return this.domElement;
};

entutor.inputs.playlist.prototype.getValue = function () {
    return null;
};

entutor.inputs.playlist.prototype.getMaxScore = function () {
    return this.maxScore;
};

entutor.inputs.playlist.prototype.hide = function (delay) {
    if (delay && parseInt(delay) > 0) {
        setTimeout(this.hideDelayed, entutor.hideDelay);
    } else {
        this.domElement.hide();
    }
};

entutor.inputs.playlist.prototype.show = function (delay) {
    if(delay && parseInt(delay)>0){
        setTimeout(this.showDelayed,entutor.showDelay);
    }else{
        this.domElement.show();
    }
};

entutor.inputs.playlist.prototype.isVisible = function(){
    return this.domElement.is(':visible') && this.domElement.parents( ":hidden" ).length===0;
};

entutor.inputs.playlist.prototype.start = function () {

    var self=this;
    $('#jquery_jplayer_' + self.id).jPlayer({
        ready: function () {  },
        swfPath: self.swfPath,
        supplied: self.supplied,
        cssSelectorAncestor: '#jp_container_' + self.id ,
        wmode: "window",
        useStateClassSkin: true,
        autoBlur: false,
        smoothPlayBar: true,
        keyEnabled: true,
        remainingDuration: true,
        toggleDuration: true,
        errorAlerts: false,
        warningAlerts: false,
        consoleAlerts: false,
        volume:1,
        ended:function(){  $('.playlist_button').attr('value',self.labels.paused);}
    });
};

entutor.inputs.playlist.prototype.notify = function (stack) {
    if(this.parent){
        stack.push(this.id);
        this.parent.notify(stack);
    }
};

































// =============================================================================
//
//    options={
//        type:'slideshow',
//        classes:''
//        supplied: "mp3,oga,wav",
//        precondition:'none|beforeCorrect'
//        media{
//            "title": "Бублички",
//            "mp3": "./media/bublichki.mp3",
//            "_oga": "",
//            "_wav": ""
//        }
//    slides:[
//          {
//                 html:'Бублички',
//                 from:'./playmessage/bublichki.mp3'
//                 to:
//          },
//          {
//                 html:'Бублички',
//                 from:'./playmessage/bublichki.mp3'
//                 to:
//          },
//          {
//                 html:'Бублички',
//                 from:'./playmessage/bublichki.mp3'
//                 to:
//          },
//    ];
//    }
entutor.inputs.slideshow = function (parent, options) {
    var self = this;
    this.type = 'slideshow';
    this.parent = parent;
    this.options = options || {};
    this.id = this.parent.id + '_' + (this.options.id || (++entutor.guid));
    this.classes = this.options.classes || '';
    this.precondition = this.options.precondition || 'none';
    this.swfPath = this.options.swfPath || entutor.config.swfPath;
    this.supplied = this.options.supplied || "mp3,oga,wav";
    this.autostart=this.options.autostart||false;
    
    this.hideOnCorrect = this.options.hideOnCorrect? true : false;

    this.media = options.media || {};

    this.slides = this.options.slides || [];
    this.presentationCurrentSlide=false;

    this.currenttrack = false;
    
    this.maxScore=1;
    this.result={
        status: entutor.task.status.received,
        score: 1,
        passed: true,
        maxScore: 1
    };
    this.hideDelayed=function(){ self.hide(); };
    this.showDelayed=function(){ self.show(); };
    // entutor.jplayers[this.id] = this;
};

entutor.inputs.slideshow.prototype.test = function () {

    if(entutor.verboseTest){
        console.log('verboseTest',this.id, this.type, this.result.passed);
    }
    if(this.parent && this.parent.testFinishedCallback){
        this.parent.testFinishedCallback(this.id, this.result);
    }
};

entutor.inputs.slideshow.prototype.draw = function () {
    var self = this;

    this.domElement = $('<span id="task' + this.id + '" class="task-slideshow transition ' + this.classes + '"></span>');

    var html = "";

    html+='<div id="taskPresentationText'+this.id+'" class="taskPresentationText"></div><div></div>';
    html+='<div id="jp_container_'+this.id+'" class="jp-audio" role="application" aria-label="media player">';
    html+='     <div id="jquery_jplayer_'+this.id+'" class="jp-jplayer"></div>';
    html+='	<div class="jp-type-single">';
    html+='		<div class="jp-gui jp-interface">';
    html+='			<div class="jp-controls">';
    html+='				<button class="jp-play" role="button" tabindex="0">play</button>';
    html+='				<button class="jp-stop" role="button" tabindex="0">stop</button>';
    html+='			</div>';
    html+='			<div class="jp-progress">';
    html+='				<div class="jp-seek-bar">';
    html+='					<div class="jp-play-bar"></div>';
    html+='				</div>';
    html+='			</div>';
    html+='			<div class="jp-volume-controls">';
    html+='				<button class="jp-mute" role="button" tabindex="0">mute</button>';
    html+='				<button class="jp-volume-max" role="button" tabindex="0">max volume</button>';
    html+='				<div class="jp-volume-bar">';
    html+='					<div class="jp-volume-bar-value"></div>';
    html+='				</div>';
    html+='			</div>';
    html+='			<div class="jp-time-holder">';
    html+='				<div class="jp-current-time" role="timer" aria-label="time">&nbsp;</div>';
    html+='				<div class="jp-duration" role="timer" aria-label="duration">&nbsp;</div>';
    html+='				<div class="jp-toggles">';
    html+='					<button class="jp-repeat" role="button" tabindex="0">repeat</button>';
    html+='				</div>';
    html+='			</div>';
    html+='		</div>';
    html+='		<div class="jp-details">';
    html+='			<div class="jp-title" aria-label="title">&nbsp;</div>';
    html+='		</div>';
    html+='		<div class="jp-no-solution">';
    html+='			<span>Update Required</span>';
    html+='			To play the media you will need to either update your browser to a recent version or update your <a href="http://get.adobe.com/flashplayer/" target="_blank">Flash plugin</a>.';
    html+='		</div>';
    html+='	</div>';
    html+='</div>';

    this.domElement.append($(html));

    this.player = this.domElement.find("#jquery_jplayer_" + this.id);
    
    this.searchSlide=function(currentTime){
    	for(var i=0; i<this.slides.length; i++ ){
            if(this.slides[i].from <= currentTime &&  currentTime <= this.slides[i].to){
                    return this.slides[i];
            }
    	}
    	return null;
    };
    
    
    this.presentationShowSlide=function(frame){
  	if(frame){
	    $('#taskPresentationText'+this.id).html(frame.html);
  	}else{
  	    $('#taskPresentationText'+this.id).html("<div>&nbsp;</div>");
  	}
    };
    
    this.timeupdate = function(event){
        var currentTime=event.jPlayer.status.currentTime;
        // console.log(currentTime);
        if( ! self.presentationCurrentSlide
            || self.presentationCurrentSlide.from > currentTime
            || self.presentationCurrentSlide.to < currentTime ){
            self.presentationCurrentSlide=self.searchSlide(currentTime);
            self.presentationShowSlide(self.presentationCurrentSlide);
        }
    };


    if (this.precondition === 'beforeCorrect') {
        this.hide();
    };

    return this.domElement;
};

entutor.inputs.slideshow.prototype.getValue = function () {
    return null;
};

entutor.inputs.slideshow.prototype.getMaxScore = function () {
    return this.maxScore;
};

entutor.inputs.slideshow.prototype.hide = function (delay) {
    if (delay && parseInt(delay) > 0) {
        setTimeout(this.hideDelayed, entutor.hideDelay);
    } else {
        this.domElement.hide();
    }
};

entutor.inputs.slideshow.prototype.show = function (delay) {
    if(delay && parseInt(delay)>0){
        setTimeout(this.showDelayed,entutor.showDelay);
    }else{
        this.domElement.show();
        if(this.onShow){
            this.onShow();
            this.onShow = false;
        }
    }
};

entutor.inputs.slideshow.prototype.isVisible = function(){
    return this.domElement.is(':visible') && this.domElement.parents( ":hidden" ).length===0;
};

entutor.inputs.slideshow.prototype.start = function () {
    var self=this;
    this.player.jPlayer({
        ready: function () { 
            $(this).jPlayer("setMedia", self.media);
            if(self.autostart){
                if(self.isVisible()){
                    self.player.jPlayer("pauseOthers");
                    self.player.jPlayer("play");         
                }else{
                    self.onShow=function(){
                        self.player.jPlayer("pauseOthers");
                        self.player.jPlayer("play");         
                    };
                }
            }
        },
        swfPath: self.swfPath,
        supplied: self.supplied,
        cssSelectorAncestor: '#jp_container_' + self.id,
        wmode: "window",
        useStateClassSkin: true,
        autoBlur: false,
        smoothPlayBar: true,
        keyEnabled: true,
        remainingDuration: true,
        toggleDuration: true,
        errorAlerts: false,
        warningAlerts: false,
        consoleAlerts: false,
        volume:1,
        timeupdate: self.timeupdate,
        ended:function(){
                self.result.passed=true;
                // console.log("self.notify([]);");
                self.notify([]);
                if(self.hideOnCorrect){
                   self.hide();
                }
        }
    });
    
};

entutor.inputs.slideshow.prototype.notify = function (stack) {
    if(this.parent){
        stack.push(this.id);
        this.parent.notify(stack);
    }
};
















// =============================================================================
// recorder configuration
//


window.utf8_encode = function (argString) {
    //  discuss at: http://phpjs.org/functions/utf8_encode/
    // original by: Webtoolkit.info (http://www.webtoolkit.info/)
    // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // improved by: sowberry
    // improved by: Jack
    // improved by: Yves Sucaet
    // improved by: kirilloid
    // bugfixed by: Onno Marsman
    // bugfixed by: Onno Marsman
    // bugfixed by: Ulrich
    // bugfixed by: Rafal Kukawski
    // bugfixed by: kirilloid
    //   example 1: utf8_encode('Kevin van Zonneveld');
    //   returns 1: 'Kevin van Zonneveld'

    if (argString === null || typeof argString === 'undefined') {
        return '';
    }

    // .replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    var string = (argString + '');
    var utftext = '',
            start, end, stringl = 0;

    start = end = 0;
    stringl = string.length;
    for (var n = 0; n < stringl; n++) {
        var c1 = string.charCodeAt(n);
        var enc = null;

        if (c1 < 128) {
            end++;
        } else if (c1 > 127 && c1 < 2048) {
            enc = String.fromCharCode(
                    (c1 >> 6) | 192, (c1 & 63) | 128
                    );
        } else if ((c1 & 0xF800) != 0xD800) {
            enc = String.fromCharCode(
                    (c1 >> 12) | 224, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128
                    );
        } else {
            // surrogate pairs
            if ((c1 & 0xFC00) != 0xD800) {
                throw new RangeError('Unmatched trail surrogate at ' + n);
            }
            var c2 = string.charCodeAt(++n);
            if ((c2 & 0xFC00) != 0xDC00) {
                throw new RangeError('Unmatched lead surrogate at ' + (n - 1));
            }
            c1 = ((c1 & 0x3FF) << 10) + (c2 & 0x3FF) + 0x10000;
            enc = String.fromCharCode(
                    (c1 >> 18) | 240, ((c1 >> 12) & 63) | 128, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128
                    );
        }
        if (enc !== null) {
            if (end > start) {
                utftext += string.slice(start, end);
            }
            utftext += enc;
            start = end = n + 1;
        }
    }

    if (end > start) {
        utftext += string.slice(start, stringl);
    }

    return utftext;
};

window.md5 = function (str) {
    //  discuss at: http://phpjs.org/functions/md5/
    // original by: Webtoolkit.info (http://www.webtoolkit.info/)
    // improved by: Michael White (http://getsprink.com)
    // improved by: Jack
    // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    //    input by: Brett Zamir (http://brett-zamir.me)
    // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    //  depends on: utf8_encode
    //   example 1: md5('Kevin van Zonneveld');
    //   returns 1: '6e658d4bfcb59cc13f96c14450ac40b9'

    var xl;

    var rotateLeft = function (lValue, iShiftBits) {
        return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    };

    var addUnsigned = function (lX, lY) {
        var lX4, lY4, lX8, lY8, lResult;
        lX8 = (lX & 0x80000000);
        lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000);
        lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
        if (lX4 & lY4) {
            return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        }
        if (lX4 | lY4) {
            if (lResult & 0x40000000) {
                return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            } else {
                return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
            }
        } else {
            return (lResult ^ lX8 ^ lY8);
        }
    };

    var _F = function (x, y, z) {
        return (x & y) | ((~x) & z);
    };
    var _G = function (x, y, z) {
        return (x & z) | (y & (~z));
    };
    var _H = function (x, y, z) {
        return (x ^ y ^ z);
    };
    var _I = function (x, y, z) {
        return (y ^ (x | (~z)));
    };

    var _FF = function (a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_F(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    var _GG = function (a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_G(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    var _HH = function (a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_H(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    var _II = function (a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_I(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    var convertToWordArray = function (str) {
        var lWordCount;
        var lMessageLength = str.length;
        var lNumberOfWords_temp1 = lMessageLength + 8;
        var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
        var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
        var lWordArray = new Array(lNumberOfWords - 1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while (lByteCount < lMessageLength) {
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition));
            lByteCount++;
        }
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
        lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
        lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
        return lWordArray;
    };

    var wordToHex = function (lValue) {
        var wordToHexValue = '',
                wordToHexValue_temp = '',
                lByte, lCount;
        for (lCount = 0; lCount <= 3; lCount++) {
            lByte = (lValue >>> (lCount * 8)) & 255;
            wordToHexValue_temp = '0' + lByte.toString(16);
            wordToHexValue = wordToHexValue + wordToHexValue_temp.substr(wordToHexValue_temp.length - 2, 2);
        }
        return wordToHexValue;
    };

    var x = [],
            k, AA, BB, CC, DD, a, b, c, d, S11 = 7,
            S12 = 12,
            S13 = 17,
            S14 = 22,
            S21 = 5,
            S22 = 9,
            S23 = 14,
            S24 = 20,
            S31 = 4,
            S32 = 11,
            S33 = 16,
            S34 = 23,
            S41 = 6,
            S42 = 10,
            S43 = 15,
            S44 = 21;

    str = this.utf8_encode(str);
    x = convertToWordArray(str);
    a = 0x67452301;
    b = 0xEFCDAB89;
    c = 0x98BADCFE;
    d = 0x10325476;

    xl = x.length;
    for (k = 0; k < xl; k += 16) {
        AA = a;
        BB = b;
        CC = c;
        DD = d;
        a = _FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
        d = _FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
        c = _FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
        b = _FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
        a = _FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
        d = _FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
        c = _FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
        b = _FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
        a = _FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
        d = _FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
        c = _FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
        b = _FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
        a = _FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
        d = _FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
        c = _FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
        b = _FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
        a = _GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
        d = _GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
        c = _GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
        b = _GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
        a = _GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
        d = _GG(d, a, b, c, x[k + 10], S22, 0x2441453);
        c = _GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
        b = _GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
        a = _GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
        d = _GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
        c = _GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
        b = _GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
        a = _GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
        d = _GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
        c = _GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
        b = _GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
        a = _HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
        d = _HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
        c = _HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
        b = _HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
        a = _HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
        d = _HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
        c = _HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
        b = _HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
        a = _HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
        d = _HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
        c = _HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
        b = _HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
        a = _HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
        d = _HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
        c = _HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
        b = _HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
        a = _II(a, b, c, d, x[k + 0], S41, 0xF4292244);
        d = _II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
        c = _II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
        b = _II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
        a = _II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
        d = _II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
        c = _II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
        b = _II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
        a = _II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
        d = _II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
        c = _II(c, d, a, b, x[k + 6], S43, 0xA3014314);
        b = _II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
        a = _II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
        d = _II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
        c = _II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
        b = _II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
        a = addUnsigned(a, AA);
        b = addUnsigned(b, BB);
        c = addUnsigned(c, CC);
        d = addUnsigned(d, DD);
    }

    var temp = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);

    return temp.toLowerCase();
};



entutor.recorderApp = {};
entutor.recorderApp.initFlashRecorder=function(options){
    
    
    entutor.recorderApp.options=options || {};
    
    // ---------------------- options - begin ----------------------------------
    // rate - at which the microphone captures sound, in kHz. default is 22. 
    // Currently we only support 44 and 22.
    // var rate= 44; // 44,100 Hz
    // var rate= 22; // 22,050 Hz
    // var rate= 11; // 11,025 Hz
    // var rate= 8 ; //  8,000 Hz
    // var rate= 5 ; //  5,512 Hz
    entutor.recorderApp.rate = 22;
    entutor.recorderApp.RECORDER_APP_ID = "recorderApp";
    entutor.recorderApp.appWidth = 24;
    entutor.recorderApp.appHeight = 24;
    entutor.recorderApp.uploadFieldName = "upload_file";

    entutor.recorderApp.currentRecorderId = "01";
    entutor.recorderApp.currentRecorderLevel = false;
    entutor.recorderApp.currentRecorderText = false;
    
    // =========================================================================
    // microphone settings
    entutor.recorderApp.maxRecordTime = entutor.recorderApp.options.maxRecordTime || 30000;
    if(entutor.recorderApp.maxRecordTime>30000){
        entutor.recorderApp.maxRecordTime=30000;
    }
    // =========================================================================
    
    entutor.recorderApp.silenceTimeout = 4000;
    entutor.recorderApp.silenceLevel = 10; // 0 ... 100

    entutor.recorderApp.audioid = 'audio';
    
    entutor.recorderApp.salt = entutor.recorderApp.options.salt || '';
    
    entutor.recorderApp.receiver = entutor.recorderApp.options.receiver || './voiceinput2/upload.php';

    entutor.config.swfPath = entutor.recorderApp.options.swfPath ||  "";

    entutor.recorderApp.swf = entutor.recorderApp.options.swf ||  "";

    entutor.recorderApp.iconRecord = entutor.recorderApp.options.iconRecord ||  '';

    entutor.recorderApp.iconStop = entutor.recorderApp.options.iconStop || '';

    entutor.recorderApp.iconUpload = entutor.recorderApp.options.iconUpload || '';

    // ---------------------- options - end ------------------------------------

    $('body').append($('<div id="flashcontent"><p>Your browser must have JavaScript enabled and the Adobe Flash Player installed.</p></div>'));
    var flashvars = {'upload_image': entutor.recorderApp.iconUpload};
    var params = {};
    var attributes = {'id': entutor.recorderApp.RECORDER_APP_ID, 'name': entutor.recorderApp.RECORDER_APP_ID};

    // console.log(entutor.recorderApp.swf, "flashcontent", entutor.recorderApp.appWidth, entutor.recorderApp.appHeight, "11.0.0", "", flashvars, params, attributes);
    swfobject.embedSWF(entutor.recorderApp.swf, "flashcontent", entutor.recorderApp.appWidth, entutor.recorderApp.appHeight, "11.0.0", "", flashvars, params, attributes);


    entutor.recorderApp.stopRecording = function (el) {
        FWRecorder.stopRecording(entutor.recorderApp.audioid)
        if (entutor.recorderApp.stopRecordingTimeout) {
            clearTimeout(entutor.recorderApp.stopRecordingTimeout);
        }
        entutor.recorderApp.stopRecordingTimeout = false;
    };

    entutor.recorderApp.startRecording = function (el) {

        // stop previous recorder
        FWRecorder.stopRecording(entutor.recorderApp.audioid);



        entutor.recorderApp.currentRecorderId = $(el).attr('data-id');
        var recorder = $('#recorder' + entutor.recorderApp.currentRecorderId);

        entutor.recorderApp.currentRecorderText = $(el).attr('data-text');
        entutor.recorderApp.currentRecorderLevel = recorder.find('.recorder-level-indicator').first();

        FWRecorder.record(entutor.recorderApp.audioid, entutor.recorderApp.audioid + '.wav');
        if (FWRecorder.isReady) {
            FWRecorder.observeLevel();
            recorder.find('.recorder-stop').removeClass('hide');
            recorder.find('.recorder-start').addClass('hide');
            entutor.recorderApp.stopRecordingTimeout = setTimeout(function () {
                entutor.recorderApp.stopRecordingTimeout = false;
                FWRecorder.stopRecording(entutor.recorderApp.audioid);
            }, entutor.recorderApp.maxRecordTime);
        }

    };

    // ----------------------- Handling FWR events -----------------------------
    window.fwr_event_handler = function fwr_event_handler() {

        //console.log("Last recorder event: " + arguments[0]);

        var name, $controls;

        switch (arguments[0]) {


            //  ready: recorder is ready for use
            //    width - save button's width
            //    height - save button's height
            case "ready":
                // console.log("Last recorder event: " + arguments[0]);
                var width = parseInt(arguments[1]);
                var height = parseInt(arguments[2]);
                //FWRecorder.uploadFormId = entutor.recorderApp.uploadFormId;
                //FWRecorder.uploadFieldName = entutor.recorderApp.uploadFieldName;
                FWRecorder.connect(entutor.recorderApp.RECORDER_APP_ID, 0);
                FWRecorder.recorderOriginalWidth = width;
                FWRecorder.recorderOriginalHeight = height;

                var rate = entutor.recorderApp.rate; // 22,050 Hz

                // gain - the amount by which the microphone should multiply the signal before transmitting it. default is 100
                var gain = 100; // 100% volume level

                // silence_level - amount of sound required to activate the microphone and dispatch the activity event. default is 0
                var silenceLevel = entutor.recorderApp.silenceLevel;

                //silence_timeout - number of milliseconds between the time the microphone stops detecting sound and the time the activity event is dispatched. default is 4000
                var silenceTimeout = entutor.recorderApp.silenceTimeout; // 4 seconds of silence = record stopped

                var useEchoSuppression = true;

                var loopBack = false;

                FWRecorder.configure(rate, 100, silenceLevel, silenceTimeout);
                FWRecorder.setUseEchoSuppression(useEchoSuppression);
                FWRecorder.setLoopBack(loopBack);
                break;

                // user needs to allow the recorder to access the microphone
            case "microphone_user_request":
                // console.log("Last recorder event: " + arguments[0]);
                FWRecorder.showPermissionWindow();
                break;

                // user allowed access to the microphone
            case "microphone_connected":
                // console.log("Last recorder event: " + arguments[0]);
                FWRecorder.isReady = true;

                var recorder = $('#recorder' + entutor.recorderApp.currentRecorderId);
                FWRecorder.record(entutor.recorderApp.audioid, entutor.recorderApp.audioid + '.wav');
                FWRecorder.observeLevel();
                recorder.find('.recorder-stop').removeClass('hide');
                recorder.find('.recorder-start').addClass('hide');
                entutor.recorderApp.stopRecordingTimeout = setTimeout(function () {
                    entutor.recorderApp.stopRecordingTimeout = false;
                    FWRecorder.stopRecording('audio');
                }, entutor.recorderApp.maxRecordTime);

                break;

                // user closed permission dialog
            case "permission_panel_closed":
                FWRecorder.defaultSize();
                break;

            case "recording_stopped":
                // console.log("Last recorder event: " + arguments[0]);
                // recording_stopped
                // get the form data
                name = arguments[1];
                var duration = arguments[2];

                FWRecorder.stopObservingLevel();

                var recorder = $('#recorder' + entutor.recorderApp.currentRecorderId);
                recorder.find('.recorder-start').removeClass('hide');
                recorder.find('.recorder-stop').addClass('hide');

                var currentRecorder=entutor.recorders[entutor.recorderApp.currentRecorderId];
                currentRecorder.value = FWRecorder.getBase64();
                currentRecorder.result.status = entutor.task.status.waiting;
                currentRecorder.result.score = 0;
                currentRecorder.result.passed = 'undefined';
                currentRecorder.result.maxScore = maxScore;
                currentRecorder.result.details = false;
                currentRecorder.notify([]);

                entutor.recorderApp.currentRecorderId = false;
                entutor.recorderApp.currentRecorderLevel = false;

                break;

            case "microphone_level":
                if (entutor.recorderApp.currentRecorderLevel) {
                    entutor.recorderApp.currentRecorderLevel.css({marginTop: (100 - arguments[1] * 50) + '%'});
                }
                break;

                //        // no_microphone_found: no microphone was found when trying to record
                //        case "no_microphone_found":
                //            // console.log("Last recorder event: " + arguments[0]);
                //            break;
                //
                //        case "microphone_activity":
                //            //console.log("Last recorder event: " + arguments[0]);
                //            //console.log("microphone_activity", arguments[1]);
                //            // $('#activity_level').text(arguments[1]);
                //            break;
                //
                //
                //        // recording: recording audio data from the microphone
                //        //   name - of the recording that was specified when record was called
                //        case "recording":
                //            // console.log("Last recorder event: " + arguments[0]);
                //            name = arguments[1];
                //            // FWRecorder.hide();
                //            break;
                //
                //        case "observing_level":
                //            break;
                //
                //        case "observing_level_stopped":
                //            break;
                //
                //        case "playing":
                //            // name = arguments[1];
                //            // $controls = controlsEl(name);
                //            // setControlsClass($controls, CLASS_PLAYING);
                //            break;
                //
                //        case "playback_started":
                //            // name = arguments[1];
                //            // var latency = arguments[2];
                //            break;
                //
                //        case "stopped":
                //            // name = arguments[1];
                //            break;
                //
                //        case "playing_paused":
                //            // name = arguments[1];
                //            break;
                //
                //        case "save_pressed":
                //            // FWRecorder.updateForm();
                //            break;
                //
                //        case "saving":
                //            // name = arguments[1];
                //            break;
                //
                //        case "saved":
                //            // name = arguments[1];
                //            // arguments[2] is server response
                //            //console.log(arguments[2]);
                //            break;
                //            
                //        case "save_failed":
                //            // name = arguments[1];
                //            // var errorMessage = arguments[2];
                //            break;
                //
                //        case "save_progress":
                //            // name = arguments[1];
                //            // var bytesLoaded = arguments[2];
                //            // var bytesTotal = arguments[3];
                //            break;
        }
    };

    
};







// =============================================================================
//
//    options={
//        type:'recorder',
//        classes:''
//        maxScore:1
//        autocheck: true|false
//        autostart: true|false
//        precondition:'none|beforeCorrect'
//        text:''
//     }
// 
entutor.flashrecorder = function (parent, options) {
    var self = this;
    // console.log(options);
    this.parent = parent;
    this.type = 'recorder';
    this.options = options || {};
    
    this.id = this.parent.id + '_' + (this.options.id || (++entutor.guid));
    this.classes = this.options.classes || '';
    this.maxScore = (typeof (this.options.maxScore) !== 'undefined') ? this.options.maxScore : 1;
    this.precondition = this.options.precondition || 'none';
    this.text = this.options.text || '';
    this.autocheck=this.options.autocheck||false;
    this.autostart=this.options.autostart||false;
    this.taskPassScore=this.options.taskPassScore || 0.7;
    this.hideOnCorrect = this.options.hideOnCorrect? true : false;

    this.result = {
        status: entutor.task.status.waiting,
        score: 0,
        passed: 'undefined',
        maxScore: this.maxScore,
        details: false
    };
    // encoded wav file
    this.value = false;

    this.countFailures=0;
    this.hint=this.options.hint||'';

    this.hideDelayed=function(){ self.hide(); };
    this.showDelayed=function(){ self.show(); };

    //this.id
    entutor.recorders[this.id] = this;
    // console.log(this);
};

entutor.flashrecorder.prototype.showSuccess = function () {
    this.domElement.removeClass('task-recorder-error').addClass('task-recorder-correct');
};

entutor.flashrecorder.prototype.showError = function () {
    this.domElement.removeClass('task-recorder-correct').addClass('task-recorder-error');
};

entutor.flashrecorder.prototype.removeFeedback = function () {
    this.domElement.removeClass('task-recorder-correct').removeClass('task-recorder-error');
};

entutor.flashrecorder.prototype.test = function () {
    var self=this;

    // don't post empty value
    if(!this.value){
        if(entutor.verboseTest){
            console.log('verboseTest',this.id, this.type, this.result.passed);
        }
        if(this.parent && this.parent.testFinishedCallback){
            this.parent.testFinishedCallback(this.id, this.result);
        }
        return;
    }

    // don't post the same sound again
    if( this.result && this.result.details ){
        if(entutor.verboseTest){
            console.log('verboseTest',this.id, this.type, this.result.passed);
        }
        if(this.parent && this.parent.testFinishedCallback){
            this.parent.testFinishedCallback(this.id, this.result);
        }
        return;
    }
    
    
    // create datetime based token
    var today = new Date();
    var toDatetime = new Date(today);
    toDatetime.setDate(today.getMinutes()+10);

    var ye=toDatetime.getUTCFullYear();
    var mo=toDatetime.getUTCMonth();
    var da=toDatetime.getUTCDay();
    var ho=toDatetime.getUTCHours();
    var mi=toDatetime.getUTCMinutes();
    var toDatetimeString = ye + '-' 
            + (mo<10?'0':'') + mo + '-'
            + (da<10?'0':'') + da + ' '
            + (ho<10?'0':'') + ho + ':'
            + (mi<10?'0':'') + mi;
    var token = md5(toDatetimeString +';'+ entutor.recorderApp.salt);
    
    
    var formData = {
        audioId:this.id,
        token: token,
        until: toDatetimeString,
        text: this.text,
        wav: this.value
    };

    // process the form
    $.ajax({
        type: 'POST', // define the type of HTTP verb we want to use (POST for our form)
        url: entutor.recorderApp.receiver, // the url where we want to POST
        data: formData, // our data object
        dataType: 'json', // what type of data do we expect back from the server
        encode: true
    }).done(function (data) {
        // log data to the console so we can see
        // console.log(data);
        self.result.status = entutor.task.status.received;
        self.result.score = ( data.score>=self.taskPassScore ? self.maxScore : 0);
        self.result.passed = (data.score>=self.taskPassScore);
        self.result.maxScore = self.maxScore;
        self.result.details=data;
        // here we will handle errors and validation messages
        self.removeFeedback();
        if (self.result && self.maxScore > 0) {
            if (self.result.passed === true) {
                self.showSuccess();
                if(self.hideOnCorrect){
                    self.hide(entutor.hideDelay);
                }
            } else if (self.result.passed === false) {
                self.showError();
                if(self.previousValue!==self.value){
                    self.countFailures++;
                }
                if(self.countFailures>1){
                    self.showHint();
                }
            }
        }
        self.previousValue=self.value;
        // mark separate words as correct of wrong
        if(self.result && self.result.details && self.result.details.wordScores){
            var wordScores=self.result.details.wordScores;
            for(var w in wordScores){
                if(wordScores[w]>=self.taskPassScore){
                    self.feedback[w].removeClass('task-audio-word-error').addClass('task-audio-word-correct');
                }else{
                    self.feedback[w].removeClass('task-audio-word-correct').addClass('task-audio-word-error');
                }
            }
        }

        if(entutor.verboseTest){
            console.log('verboseTest',self.id, self.type, self.result.passed);
        }
        if(self.parent && self.parent.testFinishedCallback){
            self.parent.testFinishedCallback(self.id, self.result);
        }
    });

};

entutor.flashrecorder.prototype.draw = function () {

    var self = this;

    this.domElement = $('<span id="task' + this.id + 'recorder" class="task-recorder transition" style="width:' + (this.options.size || '4') + 'em;"></span>');

    if (this.precondition === 'beforeCorrect') {
        this.hide();
    }

    var html='';
    html+='        <div class="recorder" id="recorder'+this.id+'">';
    html+='            <span class="recorder-level"><span class="recorder-level-indicator"></span></span><!-- ';
    html+='         --><button class="recorder-start" data-id="'+this.id+'" data-text="" onclick="entutor.recorderApp.startRecording(this)"><img src="' + entutor.recorderApp.iconRecord + '" alt="Record"></button><!-- ';
    html+='         --><button class="recorder-stop hide" onclick="entutor.recorderApp.stopRecording(this);"><img src="' + entutor.recorderApp.iconStop + '" alt="Stop Recording"/></button><!-- ';
    html+='        </div>';

    this.domElement.append($(html));

    return this.domElement;
};

entutor.flashrecorder.prototype.getValue = function () {
    return this.value;
};

entutor.flashrecorder.prototype.getMaxScore = function () {
    return this.maxScore;
};

entutor.flashrecorder.prototype.hide = function (delay) {
    if (delay && parseInt(delay) > 0) {
        setTimeout(this.hideDelayed, entutor.hideDelay);
    } else {
        this.domElement.hide();
    }
};

entutor.flashrecorder.prototype.show = function (delay) {
    if(delay && parseInt(delay)>0){
        setTimeout(this.showDelayed,entutor.showDelay);
    }else{
        this.domElement.show();
        if(this.autostart){
            entutor.recorderApp.startRecording($('button[data-id="'+this.id+'"]'));
        }
    }
};

entutor.flashrecorder.prototype.isVisible = function(){
    return this.domElement.is(':visible') && this.domElement.parents( ":hidden" ).length===0;
};

entutor.flashrecorder.prototype.start = function () {
    if(this.autostart && this.isVisible()){
        entutor.recorderApp.startRecording($('button[data-id="'+this.id+'"]'));
    }
};

entutor.flashrecorder.prototype.notify = function (stack) {
    if(this.autocheck){
        this.test();
    }
    if(this.parent){
        stack.push(this.id);
        this.parent.notify(stack);
    }
};

entutor.flashrecorder.prototype.showHint = function () {
    if(this.hint){
        this.domElement.tooltip({ content: this.hint, items:'#task' + this.id });        
        this.domElement.tooltip( "open" );
    }
};









// =============================================================================
//
//    options={
//        type:'audio',
//        id:''
//        classes:''
//        text:'' // list of space separated words
//        maxScore:1
//        indicatorWidth:100px
//        indicatorHeight:40px
//        taskPassScore:0.7
//        precondition:'none|beforeCorrect'
//        duration:60 // seconds
//    }
// 
entutor.html5audioapi = {};


/**
 * options={
 *    workerPath:'path/to/voiceinputRecorderWorker.js',
 *    soundScrorerURL:"url/of/voiceinputscorer.php"
 * }
 * entutor.inputs.recorder=entutor.html5recorder;
 */ 
entutor.html5audioapi.initAudioApi = function (options) {
    
    entutor.html5audioapi.options=options || {};

    entutor.html5audioapi.soundScrorerURL=entutor.html5audioapi.options.soundScrorerURL||"voiceinputscorer.php";

    entutor.html5audioapi.drawAnimationFrameFactory = function (canvas) {
        
        if (entutor.html5audioapi.animationFrame) {
            window.cancelAnimationFrame(entutor.html5audioapi.animationFrame);
        }

        var canvasWidth = canvas.width;
        var canvasHeight = canvas.height;
        var analyserContext = canvas.getContext('2d');
        var scaleY = 0.7 * canvasHeight / 255.0;

        var drawAnimationFrame = function (time) {
            // analyzer draw code here
            var SPACING = 5;
            var BAR_WIDTH = 3;

            var numBars = Math.round(canvasWidth / SPACING);
            var freqByteData = new Uint8Array(entutor.html5audioapi.analyserNode.frequencyBinCount);

            entutor.html5audioapi.analyserNode.getByteFrequencyData(freqByteData);

            analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
            analyserContext.fillStyle = '#F6D565';
            analyserContext.lineCap = 'round';
            var multiplier = entutor.html5audioapi.analyserNode.frequencyBinCount / numBars;

            // Draw rectangle for each frequency bin.
            for (var i = 0; i < numBars; ++i) {
                var magnitude = 0;
                var offset = Math.floor(i * multiplier);
                // gotta sum/average the block, or we miss narrow-bandwidth spikes
                for (var j = 0; j < multiplier; j++) {
                    magnitude += freqByteData[offset + j];
                }
                magnitude = scaleY * magnitude / multiplier;
                // var magnitude2 = freqByteData[i * multiplier];
                analyserContext.fillStyle = "hsl( " + Math.round((i * 360) / numBars) + ", 100%, 50%)";
                analyserContext.fillRect(i * SPACING, canvasHeight, BAR_WIDTH, -magnitude);
            }
            
            entutor.html5audioapi.animationFrame = window.requestAnimationFrame(drawAnimationFrame);
        };

        return  drawAnimationFrame;

    };

    entutor.html5audioapi.clearCurrentFrame=function(){
        if (entutor.html5audioapi.currentRecorder) {
            var canvas=document.getElementById(entutor.html5audioapi.currentRecorder.indicator.attr('id'));
            var context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
        if (entutor.html5audioapi.animationFrame) {
            window.cancelAnimationFrame(entutor.html5audioapi.animationFrame);
            entutor.html5audioapi.animationFrame=null;
        }
    };

    entutor.html5audioapi.startRecording=function (recorder) {
        
        if(entutor.html5audioapi.currentRecorder){
           entutor.html5audioapi.stopRecording(entutor.html5audioapi.currentRecorder);
        }
        
        entutor.html5audioapi.currentRecorder = recorder;
        // entutor.html5audioapi.audioGain.gain.value = 1.0;
        //var canvas = entutor.html5audioapi.currentRecorder.canvas;
        var canvas=document.getElementById(entutor.html5audioapi.currentRecorder.indicator.attr('id'));
        var updateAnalysers = entutor.html5audioapi.drawAnimationFrameFactory(canvas);
        updateAnalysers();
        // start recording
        entutor.html5audioapi.audioRecorder.clear();
        entutor.html5audioapi.audioRecorder.record();
    };

    entutor.html5audioapi.stopRecording=function (recorder) {
        // entutor.html5audioapi.audioGain.gain.value = 0.0;
        // console.log("stop recording");
        if(recorder){
            entutor.html5audioapi.clearCurrentFrame();

            entutor.html5audioapi.audioRecorder.stop();
            entutor.html5audioapi.audioRecorder.getBuffers( function ( buffers ) {
                entutor.html5audioapi.audioRecorder.exportWAV( function ( blob ) {
                    recorder.onRecordFinished(blob);
                });
            });                
        }
    };


    // callback on audio stream created
    // microphone -> splitter -> mono -> gain -> analyzer
    entutor.html5audioapi.gotStream = function (stream) {

        // Create AudioNode from the stream.
        entutor.html5audioapi.userSourceNode = entutor.html5audioapi.context.createMediaStreamSource(stream);

        // create mono channel
        var splitter = entutor.html5audioapi.context.createChannelSplitter(2);
        entutor.html5audioapi.userSourceNode.connect(splitter);


        // on-channel sound, mono
        entutor.html5audioapi.monoSoundSourceNode = entutor.html5audioapi.context.createChannelMerger(2);
        splitter.connect(entutor.html5audioapi.monoSoundSourceNode, 0, 0);
        splitter.connect(entutor.html5audioapi.monoSoundSourceNode, 0, 1);

        // Gain (Усилитель)
        entutor.html5audioapi.audioGain = entutor.html5audioapi.context.createGain();
        entutor.html5audioapi.audioGain.gain.value = 0.0;
        // source           destination
        entutor.html5audioapi.monoSoundSourceNode.connect(entutor.html5audioapi.audioGain);

        // create audio analyzer
        entutor.html5audioapi.analyserNode = entutor.html5audioapi.context.createAnalyser();
        entutor.html5audioapi.analyserNode.fftSize = 128;
        entutor.html5audioapi.monoSoundSourceNode.connect(entutor.html5audioapi.analyserNode);
        //entutor.html5audioapi.audioGain.connect( entutor.html5audioapi.analyserNode );

        // направляем выход от усилителя в наушники/колонки
        // entutor.html5audioapi.audioGain.connect(entutor.html5audioapi.context.destination);

        // глушим эхо от микрофона в наушниках
        var zeroGain = entutor.html5audioapi.context.createGain();
        zeroGain.gain.value = 0.0;
        entutor.html5audioapi.audioGain.connect( zeroGain );
        zeroGain.connect( entutor.html5audioapi.context.destination );

        // create recorder object
        // entutor.html5audioapi.audioRecorder = new Recorder( entutor.html5audioapi.monoSoundSourceNode,{workerPath:entutor.html5audioapi.options.jsURL+'/voiceinputRecorderWorker.js'} );
        entutor.html5audioapi.audioRecorder = new Recorder( entutor.html5audioapi.monoSoundSourceNode,{workerPath:entutor.html5audioapi.options.workerPath} );

        // activate buttons
        $(document).trigger('audioapi:activated');

    };

    
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    entutor.html5audioapi.context = new AudioContext();

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
        entutor.html5audioapi.gotStream,
        // on error
        function (e) {  throw { message: "Error activating audioAPI",  code: 403 }; }
    );
    
};






entutor.html5recorder = function (parent, options) {
    var self = this;
    this.parent = parent;
    this.type = 'recorder';
    this.options = options || {};
    
    
    this.id = this.parent.id + '_' + (this.options.id || (++entutor.guid));
    this.classes = this.options.classes || '';
    this.maxScore = (typeof (this.options.maxScore) !== 'undefined') ? this.options.maxScore : 1;
    this.precondition = this.options.precondition || 'none';
    this.text = this.options.text || '';
    this.autocheck=this.options.autocheck||false;
    this.autostart=this.options.autostart||false;
    this.duration = this.options.duration || 30; 
    this.taskPassScore=this.options.taskPassScore || 0.7;
    this.hideOnCorrect = this.options.hideOnCorrect? true : false;

    
    this.options.soundScrorerURL = options.soundScrorerURL || entutor.html5audioapi.soundScrorerURL;
    
    this.result = {
        status: entutor.task.status.waiting,
        score: 0,
        passed: 'undefined',
        maxScore: this.maxScore,
        details: false
    };
    this.indicatorWidth=this.options.indicatorWidth || 30;
    this.indicatorHeight=this.options.indicatorHeight || 30;
    this.value=false;
    this.wav=false;
    
    this.countFailures=0;
    this.hint=this.options.hint||'';

    this.hideDelayed=function(){ self.hide(); };
    this.showDelayed=function(){ self.show(); };
};

entutor.html5recorder.prototype.showSuccess = function () {
    this.domElement.removeClass('task-audio-error').addClass('task-audio-correct');
};

entutor.html5recorder.prototype.showError = function () {
    this.domElement.removeClass('task-audio-correct').addClass('task-audio-error');
};

entutor.html5recorder.prototype.removeFeedback = function () {
    this.domElement.removeClass('task-audio-correct').removeClass('task-audio-error');
};

entutor.html5recorder.prototype.draw = function () {
    
    var self=this;

    this.domElement = $('<span id="task' + this.id + '" class="task-audio transition ' + this.classes + '"></span>');

    // words to show
    this.wordsDom = $('<span id="taskwords' + this.id + '" class="task-audio-words"></span>');
    this.domElement.append(this.wordsDom);

    // explode
    this.feedback={};
    var words=this.text.split(/ +/);
    for(var i=0; i<words.length; i++){
        this.feedback[words[i]]=$('<span class="task-audio-word"></span>');
        this.feedback[words[i]].html(words[i]);
        this.wordsDom.append(this.feedback[words[i]]);
    }    
     
    
    var interfaceBlock=$('<span class="task-audio-interface"></span>');
    this.domElement.append(interfaceBlock);
     
    
    // audio indicator
    this.indicator=$('<canvas id="canvas-' + this.id + '" width="'+this.indicatorWidth+'" class="task-audio-indicator" height="'+this.indicatorHeight+'"></canvas>');
    interfaceBlock.append(this.indicator);
    this.indicator.hide();

    // button to start recording
    this.btnStart=$('<input  type="button" data-audio-id="' + this.id + '" class="task-audio-start-record">');

    this.btnStart.click(function(ev){
        //console.log(" this.btnStart.click ",(new Date()).toString(),self.id);
        if(entutor.html5audioapi.currentRecorder && entutor.html5audioapi.currentRecorder.id===this.id){
            return;
        }
        if(entutor.html5audioapi.currentRecorder && entutor.html5audioapi.currentRecorder.id!==this.id){
            entutor.html5audioapi.currentRecorder.btnStop.trigger('click');
        }
        self.btnStart.hide();
        self.btnStop.show();
        self.indicator.show();
        self.countDown.html(self.duration).show();
        self.result = {
            status: entutor.task.status.waiting,
            score: 0,
            passed: 'undefined',
            maxScore: this.maxScore
        };
        
        entutor.html5audioapi.startRecording(self);
        self.stopTimeout = setTimeout(function(){self.btnStop.trigger('click');},self.duration*1000);
        self.countDownTimeout = setInterval(function(){
            var timerValue=parseInt(self.countDown.text());
            timerValue--;
            if(timerValue<0){
                clearInterval(self.countDownTimeout);
            }else{
                self.countDown.html(timerValue);
            }
        },1000)
    });


    interfaceBlock.append(this.btnStart);

    // button to stop recording
    this.btnStop=$('<input  type="button" data-audio-id="' + this.id + '" class="task-audio-stop-record">');
    this.btnStop.click(function(ev){
        //console.log(" this.btnStop.click ",(new Date()).toString(),self.btnStop);
        self.btnStart.show();
        self.btnStop.hide();
        self.countDown.hide();
        self.indicator.hide();

        entutor.html5audioapi.stopRecording(self);
        if(self.stopTimeout){
            clearTimeout(self.stopTimeout);
            self.stopTimeout=false;
        }
        if(self.countDownTimeout){
            clearInterval(self.countDownTimeout);
            self.countDownTimeout=null;
        }
        if(entutor.html5audioapi.currentRecorder){
            entutor.html5audioapi.currentRecorder=false;
        }
    });
    this.btnStop.hide();
    interfaceBlock.append(this.btnStop);
    
    
    // draw countdown timer
    this.countDown=$('<span class="audio-countdown">'+this.duration+'</span>');
    interfaceBlock.append(this.countDown);
    this.countDown.hide();
        
    this.configElement=$('<span class="audio-config" id="config-' + this.id + '" data-string="" data-audio-id="' + this.id + '"></span>');
    this.configElement.attr('data-string',this.text);
    this.domElement.append(this.configElement);    
    
    
    if(this.precondition==='beforeCorrect'){
        this.hide();
    }    




    return this.domElement;
};

entutor.html5recorder.prototype.test = function () {
    
    //console.log("html5recorder.test:",this.id);
    // don't post empty value
    if(!this.value){
        if(entutor.verboseTest){
            console.log('verboseTest',this.id, this.type, this.result.passed);
        }
        if(this.parent && this.parent.testFinishedCallback){
            this.parent.testFinishedCallback(this.id, this.result);
        }
        return;
    }

    //console.log("html5recorder.test.value is set:");
    // don't post the same sound again
    if( this.result && this.result.details ){
        if(entutor.verboseTest){
            console.log('verboseTest',this.id, this.type, this.result.passed);
        }
        if(this.parent && this.parent.testFinishedCallback){
            this.parent.testFinishedCallback(this.id, this.result);
        }
        return;
    }
    //console.log("html5recorder.test.result is not set:");
    var self=this;
    
    var today = new Date();
    var toDatetime = new Date(today);
    toDatetime.setDate(today.getMinutes()+10);
    
    
    var ye=toDatetime.getUTCFullYear();
    var mo=toDatetime.getUTCMonth();
    var da=toDatetime.getUTCDay();
    var ho=toDatetime.getUTCHours();
    var mi=toDatetime.getUTCMinutes();
    var toDatetimeString = ye + '-' 
            + (mo<10?'0':'') + mo + '-'
            + (da<10?'0':'') + da + ' '
            + (ho<10?'0':'') + ho + ':'
            + (mi<10?'0':'') + mi;
    var token = md5(toDatetimeString +';'+ entutor.html5audioapi.options.salt);
    
    
    var formData = {
        audioId:this.id,
        token: token,
        until: toDatetimeString,
        text: this.text,
        wav: this.value
    };
    //console.log("formData:",formData);

    //console.log('this.options.soundScrorerURL',this.options.soundScrorerURL);
    // process the form
    $.ajax({
        type: 'POST', // define the type of HTTP verb we want to use (POST for our form)
        url: this.options.soundScrorerURL, // the url where we want to POST
        data: formData, // our data object
        dataType: 'json', // what type of data do we expect back from the server
        encode: true
    }).done(function (data) {
        // log data to the console so we can see
        // console.log(data);
        self.result.status = entutor.task.status.received;
        self.result.score = ( data.score>=self.taskPassScore ? self.maxScore : 0);
        self.result.passed = (data.score>=self.taskPassScore);
        self.result.maxScore = self.maxScore;
        self.result.details=data;
        // here we will handle errors and validation messages
        self.removeFeedback();
        if (self.result && self.maxScore > 0) {
            if (self.result.passed === true) {
                self.showSuccess();
                if(self.hideOnCorrect){
                    self.hide(entutor.hideDelay);
                }
            } else if (self.result.passed === false) {
                self.showError();
                if(self.previousValue!==self.value){
                    self.countFailures++;
                }
                if(self.countFailures>1){
                    self.showHint();
                }
            }
            self.previousValue=self.value;
            // mark separate words as correct of wrong
            if(self.result && self.result.details && self.result.details.wordScores){
                var wordScores=self.result.details.wordScores;
                for(var w in wordScores){
                    if(wordScores[w]>=self.taskPassScore){
                        self.feedback[w].removeClass('task-audio-word-error').addClass('task-audio-word-correct');
                    }else{
                        self.feedback[w].removeClass('task-audio-word-correct').addClass('task-audio-word-error');
                    }
                }
            }
        }
        
        if(self.result && self.result.details && self.result.details.wordScores){
            var wordScores=self.result.details.wordScores;
            for(var w in wordScores){
                if(wordScores[w]>=self.taskPassScore){
                    self.feedback[w].removeClass('task-audio-word-error').addClass('task-audio-word-correct');
                }else{
                    self.feedback[w].removeClass('task-audio-word-correct').addClass('task-audio-word-error');
                }
            }
        }
        if(entutor.verboseTest){
            console.log('verboseTest',self.id, self.type, self.result.passed);
        }
        if(self.parent && self.parent.testFinishedCallback){
            self.parent.testFinishedCallback(self.id, self.result);
        }

    });

};

entutor.html5recorder.prototype.getValue = function () {
    return this.value;
};

entutor.html5recorder.prototype.getMaxScore = function () {
    return this.maxScore;
};

entutor.html5recorder.prototype.hide = function(delay){
    if (delay && parseInt(delay) > 0) {
        setTimeout(this.hideDelayed, entutor.hideDelay);
    } else {
        this.domElement.hide();
    }
};

entutor.html5recorder.prototype.show = function(delay){
    if(delay && parseInt(delay)>0){
        setTimeout(this.showDelayed,entutor.showDelay);
    }else{
        this.domElement.show();
        if(this.onStart){
            this.onStart();
            this.onStart=false;
        }
    }
};

entutor.html5recorder.prototype.isVisible = function(){
    return this.domElement.is(':visible') && this.domElement.parents( ":hidden" ).length===0;
};

entutor.html5recorder.prototype.start = function () {
    if(this.autostart){
        var self=this;
        if(entutor.html5audioapi.audioRecorder){
            if(this.isVisible()){
                // console.log(self.id,'1');
                this.btnStart.trigger('click');
            }else{
                // console.log(self.id,'2');
                this.onStart=function(){
                    // console.log(self.id,'2-1');
                    self.btnStart.trigger('click');
                };
            }
        }else{
            // console.log(self.id,'3');
            $(document).bind('audioapi:activated',function(){

                if(self.isVisible()){
                    // console.log(self.id,'3-1');
                    self.btnStart.trigger('click');
                }else{
                    // console.log(self.id,'3-2');
                    self.onStart=function(){
                        //console.log(self.id,'3-2-1');
                        self.btnStart.trigger('click');
                    };
                }
            });
        }
    }
};

entutor.html5recorder.prototype.notify = function (stack) {
    if(this.autocheck){
        this.test();
    }
    if(this.parent){
        stack.push(this.id);
        this.parent.notify(stack);
    }
};

entutor.html5recorder.prototype.onRecordFinished = function(blob){
    var self=this;
    // console.log('onRecordFinished ',(new Date()).toString(), this.id);
    // encode as base64
    var reader = new window.FileReader();
    var prefix="data:audio/wav;base64,";
    reader.readAsDataURL(blob); 
    reader.onloadend = function() {
        self.value= reader.result.substr(prefix.length);                
        self.notify([]);
    };

    // clear result
    this.result = {
        status: entutor.task.status.waiting,
        score: 0,
        passed: 'undefined',
        maxScore: this.maxScore,
        details: false
    };

};

entutor.html5recorder.prototype.showHint = function () {
    if(this.hint){
        this.domElement.tooltip({ content: this.hint, items:'#task' + this.id });        
        this.domElement.tooltip( "open" );
    }
};





















// =============================================================================
//
//    options={
//        type:'sequence',
//        classes:''
//        precondition:'none|beforeCorrect'
//        maxScore:''
//        autocheck: true|false
//        hideOnCorrect: true|false
//        arrange : horizontal|vertical
//        value:'yyy',
//        size:5,
//        resetOnError:true|false
//        hint:'some string'
//        items:[
//           <some JSON like card child>
//           <some JSON like card child>
//           <some JSON like card child>
//        ]
//    }
// 
entutor.inputs.sequence = function (parent, options) {
    var self = this;
    // save attributes
    this.parent = parent;
    this.type = 'sequence';
    this.options = options || {};
    this.id = this.parent.id + '_' + (this.options.id || (++entutor.guid));
    this.classes = this.options.classes || '';
    this.precondition = this.options.precondition || 'none';
    this.maxScore = (typeof (this.options.maxScore) !== 'undefined') ? this.options.maxScore : 1;
    this.autocheck=this.options.autocheck||false;
    this.resetOnError=this.options.resetOnError||false;
    this.hideOnCorrect = this.options.hideOnCorrect? true : false;
    this.arrange = this.options.arrange || 'vertical';

    this.items=this.options.items || [];
    for(var i=0; i<this.items.length; i++){
        this.items[i]={key:i, value:this.items[i]};
    }
    

    // pre-calculate attributes
    this.result = {
        status: entutor.task.status.waiting,
        score: 0,
        passed: 'undefined',
        maxScore: this.maxScore
    };

    if(this.options.value){
        this.value = this.options.value.split(/,/);
        for(var k=0; k<this.value.length; k++){
            this.value[k]=parseInt(this.value[k]);
        }
    }else{
        this.value = this.randomizedItemKeys(this.items);
    }
    

    this.previousValue='';
    this.countFailures=0;
    this.hint=this.options.hint||'';

    this.hideDelayed=function(){ self.hide(); };
    this.showDelayed=function(){ self.show(); };

};

entutor.inputs.sequence.prototype.randomizedItemKeys = function(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    var value=[];
    for(var k=0; k<o.length; k++){
        value.push(parseInt(o[k].key));
    }
    return value;
};

entutor.inputs.sequence.prototype.showSuccess = function () {
    this.domElement.removeClass('task-sequence-error').addClass('task-sequence-correct');
};

entutor.inputs.sequence.prototype.showError = function () {
    this.domElement.removeClass('task-sequence-correct').addClass('task-sequence-error');
};

entutor.inputs.sequence.prototype.removeFeedback = function () {
    this.domElement.removeClass('task-sequence-correct').removeClass('task-sequence-error');
};

entutor.inputs.sequence.prototype.getValue = function () {
    return this.value;
};

entutor.inputs.sequence.prototype.getMaxScore = function () {
    return this.maxScore;
};

entutor.inputs.sequence.prototype.showHint = function () {
    if(this.hint){
        this.domElement.tooltip({ content: this.hint, items:'#task' + this.id + 'text' });        
        this.domElement.tooltip( "open" );
    }
};

entutor.inputs.sequence.prototype.hide = function (delay) {
    if (delay && parseInt(delay) > 0) {
        setTimeout(this.hideDelayed, entutor.hideDelay);
    } else {
        this.domElement.hide();
        for(var it=0; it<this.items.length; it++){
            this.items[it].obj.hide();
        }
    }
};

entutor.inputs.sequence.prototype.isVisible = function(){
    return this.domElement.is(':visible') && this.domElement.parents( ":hidden" ).length===0;
};

entutor.inputs.sequence.prototype.notify = function (stack) {
    if(this.autocheck){
        this.test();
    }
    if(this.parent){
        stack.push(this.id);
        this.parent.notify(stack);
    }
};

entutor.inputs.sequence.prototype.show = function (delay) {
    if(this.result.passed===true && this.hideOnCorrect){
        return;
    }
    if(delay && parseInt(delay)>0){
        setTimeout(this.showDelayed,entutor.showDelay);
    }else{
        this.domElement.show();
        for(var it=0; it<this.items.length; it++){
            this.items[it].obj.show();
        }
    }
};

entutor.inputs.sequence.prototype.test = function () {
    var isCorect=true;
    for(var i=0; i < this.items.length; i++){
        if(this.items[i].key!==this.value[i]){
            isCorect=false;
            break;
        }
    }
    // console.log(this.value,this.items);
    
    this.result.status= entutor.task.status.received;
    this.result.score = (isCorect ? this.maxScore :0 );
    this.result.passed = isCorect;


    var currentValue=this.value.join();

    this.removeFeedback();
    if (this.result.passed === true) {
        this.showSuccess();
        if(this.hideOnCorrect){
            this.hide(entutor.hideDelay);
        }
    } else if (this.result.passed === false) {
        this.showError();
        if(this.previousValue!==currentValue){
            this.countFailures++;
        }
        if(this.countFailures>1){
            this.showHint();
        }
    }
    
    this.previousValue=currentValue;
    if(entutor.verboseTest){
        console.log('verboseTest',this.id, this.type, this.result.passed);
    }
    if(this.parent && this.parent.testFinishedCallback){
        this.parent.testFinishedCallback(this.id, this.result);
    }
};

entutor.inputs.sequence.prototype.draw = function () {
    // console.log('entutor.inputs.sequence.prototype.draw');
    var self=this;
    this.setValue=function( ){
            self.value=[];
            self.domElement.children().each(function(i,el){
                self.value.push(parseInt($(el).attr('data-value')));
            });
            // console.log(self.value);
            self.notify([]);
    };

    this.moveUp=function(ev){
        var btn=$(ev.target);
        var row=btn.parents('.task-sequence-item').first();
        var prev=row.prev();
        if(prev) prev.before(row);
        self.setValue();
    };

    this.moveDown=function(ev){
        var btn=$(ev.target);
        var row=btn.parents('.task-sequence-item').first();
        var next=row.next();
        if(next) next.after(row);
        self.setValue();
    };

    this.domElement = $('<span id="task' + this.id + '" class="task-'+this.type+' '+this.arrange+' transition ' + this.classes + '"></span>');
    
    var item=null;

    for(var iv=0; iv<this.value.length; iv++){
        for(var it=0; it<this.items.length; it++){
            if(this.items[it].key===this.value[iv]){
                item=$("<span class=\"task-sequence-item\"></span>");
                // console.log(item);
                item.attr('data-value',this.value[iv]);

                var btnUp=$('<input type=button class="task-sequence-btn-up">');
                // btnUp.attr('value',(this.arrange==='vertical'?'&Lambda;':'&lt;'));
                btnUp.click(this.moveUp);
                item.append(btnUp);
                
                var btnDown=$('<input type=button class="task-sequence-btn-down">');
                //btnDown.attr('value',(this.arrange==='vertical'?'&Lambda;':'&lt;'));
                btnDown.click(this.moveDown);
                item.append(btnDown);

                var child = this.items[it].value;
                if ( ! ( typeof(child)==='object' && typeof(child.type)==='string' && typeof(entutor.inputs[child.type]) === 'function' ) ){
                    child = this.items[it].value={
                                "type": "html",
                                "classes": "",
                                "precondition": "none",
                                "hideOnCorrect": false,
                                "duration": "none",
                                "innerHtml": child+''
                               };
                }
                var constructor = entutor.inputs[child.type];
                var childObject = new constructor(this, child);
                this.items[it].obj= childObject;
                item.append(this.items[it].obj.draw());
                this.domElement.append(item);
                break;
            }
        }
    }

    if (this.precondition === 'beforeCorrect') {
        this.hide();
    }

    return this.domElement;
};

entutor.inputs.sequence.prototype.start = function () {
    this.domElement.sortable({
        axis: (this.arrange==='vertical'?'y':'x'),
        update:this.setValue
    });
    for(var it=0; it<this.items.length; it++){
        this.items[it].obj.start();
    }
};


