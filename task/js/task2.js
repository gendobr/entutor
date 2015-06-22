


var tutor = {};
tutor.guid=0;
tutor.config={};
tutor.inputs = {};


tutor.debug=false;

// =============================================================================
tutor.show = function (jsonURL,containerSelector) {
    // process the form
    $.ajax({
        type: 'GET', // define the type of HTTP verb we want to use (POST for our form)
        url: jsonURL, // the url where we want to POST
        // data: formData, // our data object
        dataType: 'json', // what type of data do we expect back from the server
        encode: true
    }).done(function (json) {
        var task=new tutor.task(json);
        $(containerSelector).empty().append(task.draw());
        window.location.hash=json.id;
    });
};





// =============================================================================
tutor.task = function (options) {
    
    var self = this;
    
    this.options = options || {};

    this.id = options.id || (++tutor.guid);

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
    this.testPresentation = new tutor.testPresentation(this, this.options.presentation);

    // create inputs
    this.inputs = new tutor.inputs.card(this, this.options.inputs);

};

tutor.task.prototype.template =
        '<span id="task{{id}}" class="task-container">'
        + '<span id="task{{id}}tip" class="task-tip"><!-- task.tip --></span>'
        + '<span id="task{{id}}presentation" class="task-presentation"><!-- task.presentation --></span>'
        + '<span id="task{{id}}inputs" class="task-inputs"><!-- task.inputs --></span>'
        + '<span id="task{{id}}buttons" class="task-buttons">'
        + '<input type="button" value="{{text.testbutton}}" id="task{{id}}testbutton">'
        + '<input type="button" value="{{text.restartbutton}}" id="task{{id}}restartbutton">'
        + '<input type="button" value="{{text.nextbutton}}" id="task{{id}}nextbutton">'
        + '</span>'
        + '</span>';

tutor.task.prototype.text = {
    testbutton: 'Проверить',
    nextbutton: 'Далее',
    restartbutton: 'Начать задание заново'
};

tutor.task.status = {
    received: 'received',
    waiting: 'waiting'
};

tutor.task.prototype.draw = function () {

    var self = this;
    var context = {
        id: this.id,
        text: this.text
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

    this.domElement.find('#task' + this.id + 'testbutton').click(this.test(this));

    // $( document ).bind( "task:newinput", function(event) { self.domElement.trigger('task:test', [self.id, result])); });
    
    this.nextButton=this.domElement.find('#task'+this.id+'nextbutton');
    this.nextButton.attr('disabled',true);
    this.nextButton.click(function(){
        // alert('nextbutton');
        if(self.options && self.options.next){
            window.location.href=self.options.next;
        }
    });
    this.domElement.find('#task'+this.id+'restartbutton').click(function(){
        window.location.reload();
    });
    return this.domElement;
};



tutor.task.prototype.test=function (self) { 
    return function(){
        // console.log("self.inputs.test");
        self.inputs.test(function (id, result) {
            // enable Next button if test is passed
            if(tutor.debug){
                console.log("self.inputs.test id=",id," result=", result);
            }
            if(result.passed === true){
                self.nextButton.attr('disabled',false);
            }
            self.domElement.trigger('task:test', [self.id, result]);
        });
    };
};







// =============================================================================
tutor.testPresentation = function (parent, options) {
    this.parent = parent;
    this.options = options||{};
    // console.log(this);
};

tutor.testPresentation.prototype.draw=function(){
    if(this.options.innerHtml){
        return $(this.options.innerHtml);
    }
    if(this.options.elementSelector){
        return $(this.options.elementSelector);
    }
    return $('<span class="error task-presentation-not-found"></span>');
};




// =============================================================================
// card, container for other inputs
// 
//    options={
//        type:'card',
//        id:''
//        arrange:vertical|horizontal
//        classes:''
//        maxScore:1
//        precondition:'none|beforeCorrect'
//        taskPassScore:1; // какую долю от максимума надо набрать, чтобы получить зачёт, число от 0 до 1
//        customtest:function(arrayOfChildComponents){
//            return {
//              status: tutor.task.status.received,
//              score: null,
//              subresults: [],
//              passed:false|true,
//              maxScore:0
//            }
//        }
//        children:[
//           <list of subelements>
//        ]
//    }

tutor.inputs.card = function (parent, options) {
    this.type = 'card';
    this.parent = parent;
    this.options = options || {};
    this.id = this.parent.id + '_' + ( this.options.id  || (++tutor.guid) );

    this.classes = this.options.classes || '';
    this.arrange = this.options.arrange || 'horizontal';
    this.taskPassScore=this.options.taskPassScore || 1;
    this.precondition=this.options.precondition || 'none';
    this.customtest=this.options.customtest || false;
    this.maxScore = (typeof(this.options.maxScore)!=='undefined')?this.options.maxScore : 1;

    // create child elements
    this.children = [];
    this.result = {
        status: tutor.task.status.waiting,
        score: null,
        subresults: [],
        passed:false,
        maxScore:0
    };
    var childMaxScoreSum=0;
    for (var key = 0; key < this.options.children.length; key++) {
        var child = this.options.children[key];
        if (typeof (tutor.inputs[child.type]) === 'function') {
            var constructor = tutor.inputs[child.type];
            var childObject = new constructor(this, child);
            // console.log(childObject);
            // console.log(childObject.maxScore());
            childMaxScoreSum+=childObject.getMaxScore();
            this.children.push(childObject);
            this.result.subresults[childObject.id] = {
                status: tutor.task.status.waiting,
                score: 0,
                subresults: [],
                passed:'undefined',
                maxScore:0 
            };//;
        }
    }
};


tutor.inputs.card.prototype.showSuccess = function () {
    this.domElement.removeClass('task-card-error').addClass('task-card-correct');
};

tutor.inputs.card.prototype.showError = function () {
    this.domElement.removeClass('task-card-correct').addClass('task-card-error');
};

tutor.inputs.card.prototype.removeFeedback = function () {
    this.domElement.removeClass('task-card-correct').removeClass('task-card-error');
};

tutor.inputs.card.prototype.test = function (parentCallback) {

    // clear previous score
    this.result.status = tutor.task.status.waiting;
    this.result.score = null;
    this.result.passed = 'undefined';
    this.result.maxScore=this.getMaxScore();
    for (var key in this.result.subresults) {
        with (this.result.subresults[key]) {
            status = tutor.task.status.waiting;
            score = null;
            passed = 'undefined';
        }
    }

    var self = this;
    var testFinishedCallback = function (id, result) {
        //console.log('card:',self.id, ' received from ',id, result);
        //console.log('card:',self.id, ' received from ',id, result.passed);

        // save subresult
        if(result){
            self.result.subresults[id] = {
                status: tutor.task.status.received,
                score: result.score,
                subresults: result.subresults,
                passed : result.passed
            };
        }else{
            self.result.subresults[id] = {
                status: tutor.task.status.received,
                score: null,
                subresults: null,
                passed : 'undefined'
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
            if(self.result.subresults[key].passed === 'undefined'){
                passed='undefined';
                break;
            }
            if(passed === 'null'){
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
            if (self.result.subresults[key].status === tutor.task.status.waiting) {
                allTestsReceived = false;
            }
        }

        if (allTestsReceived) {

            if(self.customtest) {
                self.result=self.customtest(self.children);
            } else if(passed === 'undefined' ){
                self.result.status = tutor.task.status.received;
                self.result.passed = 'undefined';
                self.result.score = 0;
            } else {
                self.result.status = tutor.task.status.received;
                if(self.result.maxScore>0){
                    var reachedPercentage = self.result.score/self.result.maxScore;
                    // self.result.passed = reachedPercentage>=self.taskPassScore;
                    self.result.score = self.maxScore * reachedPercentage;
                }else{
                    self.result.score = 0;
                    self.result.passed = true;
                }
            }
            
            self.removeFeedback();
            if(self.result){
                // console.log(self.id,self.result);
                if(self.result.maxScore>0){
                    if(self.result.passed===true){
                        self.showSuccess();
                    } else if(self.result.passed===false){
                        self.showError();
                    }
                }
            }
            
            // apply child pre-conditions
            for (var key = 0; key < self.children.length; key++) {
                if(self.children[key].precondition==='beforeCorrect' ){

                    var allPreviousPassed=true;
                    for (var i = 0; i < key; i++){
                        if( self.children[i].result.passed === false || self.children[i].result.passed === 'undefined' ){
                            allPreviousPassed=false;
                        }
                    }
                    //console.log(key,'beforeCorrect',allPreviousPassed);
                    if(allPreviousPassed){
                        self.children[key].show();
                    }else{
                        self.children[key].hide();
                    }
                }else{
                    self.children[key].show();
                }
            }
            parentCallback(self.id, self.result);
        }
    };

    for (var key = 0; key < this.children.length; key++) {
        this.children[key].test(testFinishedCallback);
    }

};

tutor.inputs.card.prototype.draw = function () {
    this.domElement = $('<span id="task' + this.id + '" class="task-card  task-card-' + this.arrange + ' ' + this.classes + '"></span>');
    for (var key = 0; key < this.children.length; key++) {
        var block = $('<span class="task-card-element"></span>');
        this.domElement.append(block);
        var child = this.children[key];
        this.children[key].domElement = child.draw();
        block.append(this.children[key].domElement);
    }
    
    if(this.precondition==='beforeCorrect'){
        this.hide();
    }    
    return this.domElement;
};

tutor.inputs.card.prototype.getValue = function () {
    var value = [];
    for (var key = 0; key < this.children.length; key++) {
        value.push(this.children[key].getValue());
    }
    return value;
};

tutor.inputs.card.prototype.getMaxScore = function () {
    var maxScore = 0;
    for (var key = 0; key < this.children.length; key++) {
        maxScore+=this.children[key].getMaxScore();
    }
    return maxScore;
};

tutor.inputs.card.prototype.hide=function(){
    this.domElement.hide();
};

tutor.inputs.card.prototype.show=function(){
    this.domElement.show();
};

// factory, creates custom test
tutor.inputs.card.prototype.customtestSets=function(sets){
    return function(arrayOfChildComponents){
        
        // console.log(arrayOfChildComponents);
        var map=[];
        for(var s=0; s<sets.length; s++){
            map[s]=1;
        }
        for(var ch=0; ch<arrayOfChildComponents.length; ch++){
            for(var s=0; s<sets.length; s++){
                var vals=arrayOfChildComponents[ch].getValue();
                var patt=sets[s];
                // console.log(ch,vals,s,patt);
                if(vals.length===patt.length){
                    var sum=0;
                    for(var v=0; v<vals.length; v++){
                        for(var p=0; p<patt.length;p++){
                            if(patt[p].test(vals[v])){
                                sum++;
                            }
                        }
                    }
                    if(sum===patt.length){
                        map[s]=0;
                        break;
                    }
                }
            }
        }
        var sum=0;
        for(var s=0; s<sets.length; s++){
            sum+=map[s];
        }
        
        var result={
              status: tutor.task.status.received,
              score: (sum===0?this.maxScore:0),
              subresults: [],
              passed:(sum===0),
              maxScore:1
        };
        // console.log(result);
        return result;
    };
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
//        precondition:'none|beforeCorrect'
//    }
tutor.inputs.html = function (parent, options) {
    this.type = 'html';
    this.parent = parent;
    this.options = options || {};
    this.id = this.parent.id + '_' + ( this.options.id  || (++tutor.guid) );
    this.classes = this.options.classes || '';
    this.precondition = this.options.precondition || 'none';
    this.maxScore=0;
};

tutor.inputs.html.prototype.test = function (testFinishedCallback) {
    testFinishedCallback(this.id, {
        status: tutor.task.status.received,
        score: 0,
        passed:true,
        maxScore:0
    });
};

tutor.inputs.html.prototype.draw = function () {
    this.domElement = $('<span id="task' + this.id + '" class="task-html ' + this.classes + '">' + this.options.innerHtml + '</span>');
    if(this.precondition==='beforeCorrect'){
        this.hide();
    }    

    return this.domElement;
};

tutor.inputs.html.prototype.getValue = function () {
    return null;
};

tutor.inputs.html.prototype.getMaxScore = function () {
    return this.maxScore;
};

tutor.inputs.html.prototype.hide=function(){
    this.domElement.hide();
};

tutor.inputs.html.prototype.show=function(){
    this.domElement.show();
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
//        customtest:function(value){
//            return {
//              status: tutor.task.status.received,
//              score: null,
//              subresults: [],
//              passed:false|true,
//              maxScore:0
//            }
//        }
//    }
// 
tutor.inputs.text = function (parent, options) {
    this.parent = parent;
    this.type = 'text';
    this.options = options || {};
    this.id = this.parent.id + '_' + ( this.options.id  || (++tutor.guid) );
    this.classes = this.options.classes || '';
    this.precondition = this.options.precondition || 'none';
    this.maxScore = (typeof(this.options.maxScore)!=='undefined')?this.options.maxScore : 1;
    this.result = null;
    this.pattern = this.options.pattern || null;
    if(typeof(this.pattern)==='string'){
        this.pattern=new RegExp('^ *'+this.pattern+' *$');
    }
    this.customtest=this.options.customtest || false;

    this.value=false;
};

tutor.inputs.text.prototype.showSuccess = function () {
    this.textField.removeClass('task-text-error').addClass('task-text-correct');
};

tutor.inputs.text.prototype.showError = function () {
    this.textField.removeClass('task-text-correct').addClass('task-text-error');
};

tutor.inputs.text.prototype.removeFeedback = function () {
    this.textField.removeClass('task-text-correct').removeClass('task-text-error');
};

tutor.inputs.text.prototype.test = function (parentCallback) {
    if(this.value===false){
        //console.log("this.value===false");
        this.result = {
            status: tutor.task.status.received,
            score: 0,
            passed: 'undefined',
            maxScore: this.maxScore
        };
    }else if(this.customtest){
        //console.log("this.customtest");
        this.result=this.customtest(this.value);
    }else if (this.pattern) {
        // console.log("this.pattern",this.pattern);
        var isCorrect = this.pattern.test(this.value);
        // console.log("isCorrect",isCorrect);
        this.result = {
            status: tutor.task.status.received,
            score: (isCorrect ? this.maxScore : 0),
            passed: isCorrect,
            maxScore: this.maxScore
        };
    } else {
        //console.log("undefined");
        this.result=this.result = {
            status: tutor.task.status.received,
            score: 0,
            passed: 'undefined',
            maxScore: this.maxScore
        };
    }

    this.removeFeedback();
    if(this.result && this.result.maxScore>0){
        if (this.result.passed === true) {
            this.showSuccess();
        } else if( this.result.passed === false) {
            this.showError();
        }
    }

    parentCallback(this.id, this.result);

};

tutor.inputs.text.prototype.draw = function () {
    this.textField = $('<input type="text" id="task' + this.id + 'text" value="" size="' + (this.options.size || '') + '">');
    var self = this;
    this.textField.change(function (ev) {
        self.value = $(ev.target).val();
        $( document ).trigger( "task:newinput" );
    });
    if (this.options.value) {
        this.textField.attr('value', this.options.value);
        // this.value = this.options.value;
    }
    this.domElement = $('<span id="task' + this.id + '" class="task-text ' + this.classes + '"></span>');
    this.domElement.append(this.textField);
    
    if(this.precondition==='beforeCorrect'){
        this.hide();
    }    

    return this.domElement;
};

tutor.inputs.text.prototype.getValue = function () {
    return this.value;
};

tutor.inputs.text.prototype.getMaxScore = function () {
    return this.maxScore;
};

tutor.inputs.text.prototype.hide=function(){
    this.domElement.hide();
};

tutor.inputs.text.prototype.show=function(){
    this.domElement.show();
};













// =============================================================================
//
//    options={
//        type:'radio',
//        id:''
//        classes:''
//        maxScore:1
//        arrange:vertical|horizontal
//        precondition:'none|beforeCorrect'
//        correctVariant:'1',
//        variant:{
//           '1':'1 Correct answer',
//           '2':'2 Wrong answer',
//           '3':'3 Wrong answer'
//        },
//     }
// 
tutor.inputs.radio = function (parent, options) {
    this.parent = parent;
    this.type = 'radio';
    this.options = options || {};
    this.id = this.parent.id + '_' + ( this.options.id  || (++tutor.guid) );
    this.classes = this.options.classes || '';
    this.maxScore = (typeof(this.options.maxScore)!=='undefined')?this.options.maxScore : 1; 
    this.correctVariant = this.options.correctVariant || null;
    this.precondition = this.options.precondition || 'none';
    this.value = false;
    this.result = null;
    this.arrange = this.options.arrange || 'horizontal';
    
};

tutor.inputs.radio.prototype.showSuccess = function () {
    this.domElement.removeClass('task-radio-error').addClass('task-radio-correct');
};

tutor.inputs.radio.prototype.showError = function () {
    this.domElement.removeClass('task-radio-correct').addClass('task-radio-error');
};

tutor.inputs.radio.prototype.removeFeedback = function () {
    this.domElement.removeClass('task-radio-correct').removeClass('task-radio-error');
};


tutor.inputs.radio.prototype.test = function (parentCallback) {
    if(this.value === false){
        this.result = {
            status: tutor.task.status.received,
            score: 0,
            passed: 'undefined',
            maxScore: this.maxScore
        };
    }else if (this.correctVariant) {
        var isCorrect = (this.value === this.correctVariant);
        
        this.result = {
            status: tutor.task.status.received,
            score: isCorrect ? this.maxScore : 0,
            passed: isCorrect,
            maxScore: this.maxScore
        };
    } else {
        this.result = {
            status: tutor.task.status.received,
            score: this.maxScore,
            passed: true,
            maxScore: this.maxScore
        };
    }
    
    if(this.result && this.result.maxScore>0 ){
        if (this.result.passed === true) {
            this.showSuccess();
        } else if(this.result.passed === false) {
            this.showError();
        } else{
            this.removeFeedback();
        }
    }
    
    parentCallback(this.id, this.result);
};

tutor.inputs.radio.prototype.draw = function () {
    this.domElement = $('<span id="task' + this.id + '" class="task-radiobuttons' + this.classes + '"></span>');
    var self = this;
    var onchange = function (el) {
        var btn = $(el.target);
        self.domElement.find('label').removeClass('task-radio-checked');
        if (btn.is(':checked')) {
            self.value = btn.val();
            btn.parent().addClass('task-radio-checked');
        }
        $( document ).trigger( "task:newinput" );
    };
    this.radioButtons = [];
    for (var k in this.options.variant) {
        var elm = $('<label class="task-radio-label task-radio-label-'+this.arrange+'" data-value="' + k + '"><input type="radio" name="task' + this.id + 'radio"  class="task-radio-btn" value="' + k + '">' + this.options.variant[k] + '</label>');
        elm.change(onchange);
        this.domElement.append(elm);
        this.radioButtons.push(elm);
    }
    
    if(this.precondition==='beforeCorrect'){
        this.hide();
    }    

    return  this.domElement;
};

tutor.inputs.radio.prototype.getValue = function () {
    return this.value;
};

tutor.inputs.radio.prototype.getMaxScore = function () {
    return this.maxScore;
};

tutor.inputs.radio.prototype.hide=function(){
    this.domElement.hide();
};

tutor.inputs.radio.prototype.show=function(){
    this.domElement.show();
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
tutor.inputs.checkbox = function (parent, options) {
    this.parent = parent;
    this.type = 'checkbox';
    this.options = options || {};
    this.id = this.parent.id + '_' + ( this.options.id  || (++tutor.guid) );
    this.classes = this.options.classes || '';
    this.precondition = this.options.precondition || 'none';
    this.maxScore = (typeof(this.options.maxScore)!=='undefined')?this.options.maxScore : 1;
    if(this.options.correctVariant===true || this.options.correctVariant===false){
        this.correctVariant = this.options.correctVariant;
    }else{
        this.correctVariant = null;
    }
    this.result = null;
    this.value=false;
};

tutor.inputs.checkbox.prototype.showSuccess = function () {
    this.domElement.removeClass('task-checkbox-error').addClass('task-checkbox-correct');
};

tutor.inputs.checkbox.prototype.showError = function () {
    this.domElement.removeClass('task-checkbox-correct').addClass('task-checkbox-error');
};

tutor.inputs.checkbox.prototype.removeFeedback = function () {
    this.domElement.removeClass('task-checkbox-correct').removeClass('task-checkbox-error');
};

tutor.inputs.checkbox.prototype.test = function (parentCallback) {
    
    if( this.value === false ){
        this.result = {
            status: tutor.task.status.received,
            score: 0,
            passed: 'undefined',
            maxScore: this.maxScore
        };        
    }else if(this.options.correctVariant===true) {
        this.result = {
            status: tutor.task.status.received,
            score: (this.value === 'checked' ? this.maxScore : 0),
            passed: ( this.value === 'checked' ),
            maxScore: this.maxScore
        };
    } else if(this.options.correctVariant===false){
        this.result = {
            status: tutor.task.status.received,
            score: (this.value === 'unchecked' ? this.maxScore : 0),
            passed: ( this.value === 'unchecked' ),
            maxScore: this.maxScore
        };
    }else {
        this.result = {
            status: tutor.task.status.received,
            score: 0,
            passed: 'undefined',
            maxScore: this.maxScore
        };  
    }
    
    if(this.result && this.result.maxScore>0){
        if (this.result.passed === true) {
            this.showSuccess();
        } else if (this.result.passed === false){
            this.showError();
        } else {
            this.removeFeedback();
        }
    }
    parentCallback(this.id, this.result);

};

tutor.inputs.checkbox.prototype.draw = function () {
    this.checkbox = $('<input type="checkbox" id="task' + this.id + 'checkbox" class="task-checkbox">');
    var self = this;
    this.checkbox.change(function (ev) {
        var checkbox=$(ev.target)
        self.value = checkbox.prop('checked')?'checked':'unchecked';
        $( document ).trigger( "task:newinput" );
    });
    this.domElement = $('<label id="task' + this.id + '" class="task-checkbox-label ' + this.classes + '"></label>');
    this.domElement.append(this.checkbox);
    if(this.options.label){
        this.domElement.append($('<span class="task-checkbox-label-text">'+this.options.label+'</span>'));
    }
    
    
    if(this.precondition==='beforeCorrect'){
        this.hide();
    }    

    return this.domElement;
};

tutor.inputs.checkbox.prototype.getValue = function () {
    return this.value;
};

tutor.inputs.checkbox.prototype.getMaxScore = function () {
    return this.maxScore;
};

tutor.inputs.checkbox.prototype.hide=function(){
    this.domElement.hide();
};

tutor.inputs.checkbox.prototype.show=function(){
    this.domElement.show();
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
//    precondition:'none|beforeCorrect'
//    }
tutor.inputs.sound = function (parent, options) {
    this.type = 'sound';
    this.parent = parent;
    this.options = options || {};
    this.id = this.parent.id + '_' + ( this.options.id  || (++tutor.guid) );
    this.classes = this.options.classes || '';
    this.precondition = this.options.precondition || 'none';
    this.swfPath = this.options.swfPath || tutor.config.swfPath
    this.supplied = this.options.supplied || "mp3,oga,wav";
    
    this.maxScore=0;
    
    this.playlist = options.playlist || [];
    this.labels = options.labels || {};
    this.labels.playing = this.labels.playing || '||';
    this.labels.paused  = this.labels.paused  || '>' ;
};

tutor.inputs.sound.prototype.test = function (testFinishedCallback) {
    testFinishedCallback(this.id, {
        status: tutor.task.status.received,
        score: 0,
        passed:true,
        maxScore:0
    });
};

tutor.inputs.sound.prototype.draw = function () {
    var self = this;
    
    var html="";
    html+='<div id="jquery_jplayer_'+this.id+'" class="jp-jplayer" style="width:1px;height:1px;opacity:0;float:right;"></div>';
    html+='<div id="jp_container_'+this.id+'" class="jp-audio" role="application" aria-label="media player" style="width:1px;height:1px;opacity:0;float:right;">';
    html+='	<div class="jp-type-single">';
    html+='		<div class="jp-no-solution">';
    html+='			<span>Update Required</span>';
    html+='			To play the media you will need to either update your browser to a recent version or update your <a href="http://get.adobe.com/flashplayer/" target="_blank">Flash plugin</a>.';
    html+='		</div>';
    html+='	</div>';
    html+='</div>';
    html+='<span id="sound_'+this.id+'" class="task-sound"></span>';
    
    this.domElement = $('<span id="task' + this.id + '" class="task-sound ' + this.classes + '"></span>');
    this.domElement.append($(html));
    
    
    var player=this.domElement.find("#jquery_jplayer_"+this.id);
    var soundBlock=this.domElement.find('#sound_'+this.id);

    this.currenttrack=false;
    
    for(var i=0; i<this.playlist.length; i++){
        var html="<span class='task-sound-label'><input type='button' id='sound_" + this.id + "_" + i + "' data-i='" + i + "' class='sound_button' value='>'>&nbsp;" + this.playlist[i].title + "</span>";
        soundBlock.append($(html));
    }

    soundBlock.find('.sound_button').click(function(ev){
    	var btn=$(this);
    	var i=btn.attr('data-i');
        soundBlock.find('.sound_button').attr('value',self.labels.paused);
        if(self.currenttrack===i){
           if(player.data().jPlayer.status.paused){
                player.jPlayer("pauseOthers");
                player.jPlayer("play");
                btn.attr('value',self.labels.playing);
           }else{
                player.jPlayer("pause");
                btn.attr('value',self.labels.paused);
           }
        }else{
            self.currenttrack=i;
            player.jPlayer("stop");
            player.jPlayer("setMedia", self.playlist[i]);
            player.jPlayer("play");
            
            btn.attr('value',self.labels.playing);
        }
    });    
    
    player.jPlayer({
        ready: function () { },
        swfPath: this.swfPath,
        supplied: this.supplied,
        wmode: "window",
        useStateClassSkin: true,
        autoBlur: false,
        smoothPlayBar: true,
        keyEnabled: true,
        remainingDuration: true,
        volume:1,
        toggleDuration: true,
        ended:function(){soundBlock.find('.sound_button').attr('value',self.labels.paused);}
    });

    if(this.precondition==='beforeCorrect'){
        this.hide();
    }    

    return this.domElement;
};

tutor.inputs.sound.prototype.getValue = function () {
    return null;
};

tutor.inputs.sound.prototype.getMaxScore = function () {
    return this.maxScore;
};

tutor.inputs.sound.prototype.hide=function(){
    this.domElement.hide();
};

tutor.inputs.sound.prototype.show=function(){
    this.domElement.show();
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
//    }
tutor.inputs.video = function (parent, options) {
    this.type = 'video';
    this.parent = parent;
    this.options = options || {};
    this.id = this.parent.id + '_' + ( this.options.id  || (++tutor.guid) );
    this.classes = this.options.classes || '';
    this.precondition = this.options.precondition || 'none';
    this.supplied = this.options.supplied || "webmv, ogv, m4v";
    this.maxScore=0;
    this.labels = options.labels || {};
    this.labels.playing = this.labels.playing || '||';
    this.labels.paused  = this.labels.paused  || '>' ;
    this.media = options.media || {};

};

tutor.inputs.video.prototype.test = function (testFinishedCallback) {
    testFinishedCallback(this.id, {
        status: tutor.task.status.received,
        score: 0,
        passed:true,
        maxScore:0
    });
};

tutor.inputs.video.prototype.draw = function () {
    var self = this;
    
    var html="";
    
    html+='<div id="jp_container_'+this.id+'" class="jp-video" role="application" aria-label="media player">';
    html+='  <div class="jp-type-single">';
    html+='    <div id="jquery_jplayer_'+this.id+'" class="jp-jplayer"></div>';
    html+='    <div class="jp-gui">';
    html+='      <div class="jp-interface">';
    html+='        <div class="jp-progress">';
    html+='          <div class="jp-seek-bar">';
    html+='            <div class="jp-play-bar"></div>';
    html+='          </div>';
    html+='        </div>';
    html+='        <div class="jp-current-time" role="timer" aria-label="time">&nbsp;</div>';
    html+='        <div class="jp-duration" role="timer" aria-label="duration">&nbsp;</div>';
    html+='        <div class="jp-controls-holder">';
    html+='          <div class="jp-volume-controls">';
    html+='            <button class="jp-mute" role="button" tabindex="0">mute</button>';
    html+='            <button class="jp-volume-max" role="button" tabindex="0">max volume</button>';
    html+='            <div class="jp-volume-bar">';
    html+='              <div class="jp-volume-bar-value"></div>';
    html+='            </div>';
    html+='          </div>';
    html+='          <div class="jp-controls">';
    html+='            <button class="jp-play" role="button" tabindex="0">play</button>';
    html+='            <button class="jp-stop" role="button" tabindex="0">stop</button>';
    html+='          </div>';
    html+='          <div class="jp-toggles">';
    html+='            <button class="jp-repeat" role="button" tabindex="0">repeat</button>';
    html+='            <button class="jp-full-screen" role="button" tabindex="0">full screen</button>';
    html+='          </div>';
    html+='        </div>';
    html+='      </div>';
    html+='    </div>';
    html+='    <div class="jp-no-solution">';
    html+='      <span>Update Required</span>';
    html+='      To play the media you will need to either update your browser to a recent version or update your <a href="http://get.adobe.com/flashplayer/" target="_blank">Flash plugin</a>.';
    html+='    </div>';
    html+='  </div>';
    html+='</div>';
    
    html+="<script type=\"application/javascript\">\n";
    html+="    (function(){\n";
    html+="        $('#jquery_jplayer_"+this.id+"').jPlayer({\n";
    html+="            ready: function () { $(this).jPlayer(\"setMedia\", "+JSON.stringify(this.media)+"); },\n";
    html+="            swfPath: '"+this.swfPath+"',\n";
    html+="            supplied: '"+this.supplied+"',\n";
    html+="            cssSelectorAncestor: '#jp_container_"+this.id+"',\n";
    html+="            wmode: \"window\",\n";
    html+="            useStateClassSkin: true,\n";
    html+="            autoBlur: false,\n";
    html+="            smoothPlayBar: true,\n";
    html+="            keyEnabled: true,\n";
    html+="            remainingDuration: true,\n";
    html+="            toggleDuration: true,\n";
    html+="            volume:1,\n";
    //html+="            ended:function(){  $('#jquery_jplayer_button_"+this.id+"').attr('value','"+this.labels.paused+"');}\n";
    html+="        });\n";
    html+="    })()\n";
    html+="</script>";
    
    this.domElement = $('<span id="task' + this.id + '" class="task-video ' + this.classes + '"></span>');
    this.domElement.append($(html));
    
    //this.buttonStart=$('<input type="button" class="task-video-button" id="jquery_jplayer_button_'+this.id+'">');
    //this.buttonStart.attr('value',this.labels.paused);
    //this.domElement.append(this.buttonStart);
    
    

    
    
    this.player=this.domElement.find("#jquery_jplayer_"+this.id);
    
    //    this.player.jPlayer({
    //	ready: function () { self.player.jPlayer("setMedia", self.media); },
    //        swfPath: this.swfPath,
    //        supplied: this.supplied,
    //	wmode: "window",
    //	useStateClassSkin: true,
    //	autoBlur: false,
    //	smoothPlayBar: true,
    //	keyEnabled: true,
    //	remainingDuration: true,
    //	toggleDuration: true,
    //        volume:1,
    //        ended:function(){self.buttonStart.attr('value',self.labels.paused);}
    //    });
    
    
    
    //    this.buttonStart.click(function(ev){
    //    	var btn=$(this);
    //        btn.attr('value',self.labels.paused);
    //        if(self.player.data().jPlayer.status.paused){
    //             self.player.jPlayer("pauseOthers");
    //             self.player.jPlayer("play");
    //             btn.attr('value',self.labels.playing);
    //        }else{
    //             self.player.jPlayer("pause");
    //             btn.attr('value',self.labels.paused);
    //        }
    //    });  
    
    
    if(this.options.size){
        this.player.jPlayer( "option", "size", this.options.size );
    }

    if(this.precondition==='beforeCorrect'){
        this.hide();
    }    

    return this.domElement;
};

tutor.inputs.video.prototype.getValue = function () {
    return null;
};

tutor.inputs.video.prototype.getMaxScore = function () {
    return this.maxScore;
};

tutor.inputs.video.prototype.hide=function(){
    this.domElement.hide();
};

tutor.inputs.video.prototype.show=function(){
    this.domElement.show();
};

