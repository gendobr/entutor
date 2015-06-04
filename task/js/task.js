var tutor = {};

/**
 * options={
 *    id:'task01',
 *    text:{
 *       testbutton: 'Проверить',
 *       nextbutton: 'Далее',
 *       restartbutton: 'Начать заново'
 *    },
 *    next:'002.html'
 *    template:'some HTML',
 *    presentation:{
 *       ...
 *    },
 *    inputs:{
 *     id:'01',
 *     type:'card',
 *     children:[
 *     ]
 * }
 * 
 * для автоматического пересчёта правильности ответов 
 * после
 * var task=new tutor.task(...)
 * надо добавить
 * $( document ).bind( "task:newinput", function(event,result) { task.domElement.trigger('task:test', [task.id, result])); });
 */

tutor.guid=0;


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
    //console.log(this.presentation);
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
            // console.log("self.inputs.test id=",id," result=", result);
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

tutor.inputs = {};

//------------
// Карточка
//------------
// getValue() :  string[]
// test() : false|true|null - результат проверки ответов
// hint() : html - подсказка, включается после нажатия кнопки "проверить"
// parent : Карточка
// children
//  - html - показ информации
//  - карточка
//  - текстовое_поле
//  - звукозапись_с_микрофона
//  - место_для_фишки
//  - радиокнопки (radiobutton)
//  - флажок (checkbox) extends element
// displaySuccess() - поздравляет с успехом
// displayError() - показывает сообщение об ошибке
// activate() - активировать карточку
// deactivate() - деактивировать карточку
// onTest() - срабатывает после очередной проверки ответов и, 
//            в зависимости от pre-condition,
//            показывает или скрывает карточку
// pre-condition = true | previous-cards-correct - условия видимости
//
// - иногда содержит шаблоны правильных ответов, если для оценки нужно учитывать комбинацию
// - содержит размеры (ширина), высота регулируется по содержимому
//
//
//
//
//




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
        // console.log('card:',self.id, ' received from ',id, result);
        // console.log('card:',self.id, ' received from ',id, result.passed);

        // save subresult
        self.result.subresults[id] = {
            status: tutor.task.status.received,
            score: (result?result.score:null),
            subresults: (result?result.subresults:null),
            passed : (result && result.passed ? result.passed : 'undefined')
        };

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
    this.domElement = $('<span id="task' + this.id + '" class="task-card ' + this.classes + '"></span>');
    for (var key = 0; key < this.children.length; key++) {
        var block = $('<span class="task-card-element task-card-' + this.arrange + '"></span>');
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
        this.result = {
            status: tutor.task.status.received,
            score: 0,
            passed: 'undefined',
            maxScore: this.maxScore
        };
    }else if(this.customtest){
        this.result=this.customtest(this.value);
    }else if (this.pattern) {
        var isCorrect = this.pattern.test(this.value);
        this.result = {
            status: tutor.task.status.received,
            score: (isCorrect ? this.maxScore : 0),
            passed: isCorrect,
            maxScore: this.maxScore
        };
    } else {
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

tutor.inputs.counter = function (parent, options) {
    this.parent = parent;
    this.type = 'counter';
    this.options = options || {};
    this.id = this.parent.id + '_' + ( this.options.id  || (++tutor.guid) );
    this.classes = this.options.classes || '';
    this.precondition = this.options.precondition || 'none';
    this.value = this.options.value || '';
};

tutor.inputs.counter.prototype.test = function (testFinishedCallback) {
    testFinishedCallback(this.id, {
        status: tutor.task.status.received,
        score: 0,
        passed: true,
        maxScore: 0
    });
};

tutor.inputs.counter.prototype.draw = function () {
    var self=this;
    
    this.counterplace = $('<span id="task' + this.id + 'counterplace"  data-id="' + this.id + '" class="task-counterplace ' + this.classes + '"></span>');
    this.counter = $('<span id="task' + this.id + 'counter" data-id="' + this.id + '" class="task-counter ' + this.classes + '">' + this.options.innerHtml + '</span>');
    if(this.value){
        this.counter.attr('data-value',this.value);
    }else{
        this.counter.attr('data-value',this.counter.text());
    }
    this.counter.draggable({
        containment:'document',
        revert: true,
        start: function( event, ui ) {
            if(!$(ui.helper).attr('data-top')){
                $(ui.helper).attr('data-top', ui.position.top);
                $(ui.helper).attr('data-left', ui.position.left);
            }
        },
        stop: function( event, ui ) {tutor.inputs.counterRevert();}
    });

    this.counterplace.append(this.counter);
    
    if(this.precondition==='beforeCorrect'){
        this.hide();
    }    

    return this.counterplace;
};

tutor.inputs.counter.prototype.getValue = function () {
    return null;
};

tutor.inputs.counter.prototype.getMaxScore = function () {
    return 0;
};

tutor.inputs.counterRevertQueue=[];
tutor.inputs.counterRevert=function(){
    //console.log("tutor.inputs.counterRevertQueue",tutor.inputs.counterRevertQueue);
    while(tutor.inputs.counterRevertQueue.length>0){
        var block=tutor.inputs.counterRevertQueue.pop();
        block.animate(
            {left:block.attr('data-left')+'px', top:block.attr('data-top')+'px'},
            "slow",
            "swing",
            function(){
                block.draggable( "option", "revert", true);
            }
        );
    }
};

tutor.inputs.counter.prototype.hide=function(){
    this.counterplace.hide();
    this.counter.hide();
};

tutor.inputs.counter.prototype.show=function(){
    this.counterplace.show();
    this.counter.show();
};











// =============================================================================
//
//    options={
//        type:'dropzone',
//        id:''
//        classes:''
//        innerHtml:'1 check me answer', // visible text or html code
//        maxScore:1
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
//        pattern: //regexp, patternt to check if value of dropped counter is correct
//        value:'' // value that will be checked, if not set the innerHtml is used
//        size: // integer, width of placehoder, css property, units are 'em'
//     }
// 

tutor.inputs.dropzone = function (parent, options) {
    // console.log(options);
    this.parent = parent;
    this.type = 'dropzone';
    this.options = options || {};
    this.id = this.parent.id + '_' + ( this.options.id  || (++tutor.guid) );
    this.classes = this.options.classes || '';
    this.precondition = this.options.precondition || 'none';
    this.maxScore = (typeof(this.options.maxScore)!=='undefined')?this.options.maxScore : 1;
    this.result = null;
    this.pattern = this.options.pattern || null;
    this.child=null;
    this.offset=null;
    this.customtest=this.options.customtest || false;
    this.value=false;
    // console.log(this);
};

tutor.inputs.dropzone.prototype.showSuccess = function () {
    this.dropzone.removeClass('task-dropzone-error').addClass('task-dropzone-correct');
};

tutor.inputs.dropzone.prototype.showError = function () {
    this.dropzone.removeClass('task-dropzone-correct').addClass('task-dropzone-error');
};

tutor.inputs.dropzone.prototype.removeFeedback = function () {
    this.dropzone.removeClass('task-dropzone-correct').removeClass('task-dropzone-error');
};

tutor.inputs.dropzone.prototype.test = function (parentCallback) {
    if(this.value === false){
        this.result = {
            status: tutor.task.status.received,
            score:  0,
            passed: 'undefined',
            maxScore: this.maxScore
        };
    }else if(this.customtest){
        this.result=this.customtest(this.value);
    }else if (this.pattern) {
        var isCorrect = this.pattern.test(this.value);
        this.result = {
            status: tutor.task.status.received,
            score: (isCorrect ? this.maxScore : 0),
            passed: isCorrect,
            maxScore: this.maxScore
        };
    } else {
        this.result = {
            status: tutor.task.status.received,
            score:  0,
            passed: 'undefined',
            maxScore: this.maxScore
        };
    }
    
    this.removeFeedback();
    if(this.result && this.result.maxScore>0){
        if (this.result.passed === true) {
            this.showSuccess();
        } else if (this.result.passed === false) {
            this.showError();
        }
    }

    parentCallback(this.id, this.result);

};

tutor.inputs.dropzone.prototype.draw = function () {

    var self = this;

    this.dropzone = $('<span id="task' + this.id + 'dropzone" class="task-dropzone" style="width:' + (this.options.size || '4') + 'em;"></span>');
    
    // this.defaultWidth=this.dropzone.width();
    
    var handleDropEvent=function ( event, ui ) {
        if(!self.offset){
            self.offset=self.dropzone.offset();
        }
        // remove previous child
        if(self.child){
            self.child.animate(
               {left:self.child.attr('data-left')+'px', top:self.child.attr('data-top')+'px' },
               "slow","swing",
               function(){
                   self.child.draggable( "option", "revert", true);
               }
            );
        }
        //set new child
        self.child=ui.draggable;
        self.value=self.child.attr('data-value');
        self.child.draggable( "option", "revert", false );
        self.child.offset({top:self.offset.top+1,   left:self.offset.left+1});
        $( document ).trigger( "task:newinput" );
    };
    
    var draggedOut=function(event, ui){
        if(self.child && self.child===ui.draggable){
            tutor.inputs.counterRevertQueue.push(self.child);
            self.child=null;
            self.value=false;
        }
        $( document ).trigger( "task:newinput" );
    };
    this.dropzone.droppable( {
        drop: handleDropEvent,
        out: draggedOut
    } );

    if(this.precondition==='beforeCorrect'){
        this.hide();
    }    

    return this.dropzone;
};

tutor.inputs.dropzone.prototype.getValue = function () {
    return this.value;
};

tutor.inputs.dropzone.prototype.getMaxScore = function () {
    return this.maxScore;
};

tutor.inputs.dropzone.prototype.hide=function(){
    this.dropzone.hide();
};

tutor.inputs.dropzone.prototype.show=function(){
    this.dropzone.show();
};






// =============================================================================
//
//    options={
//        type:'audio',
//        id:''
//        classes:''
//        pattern:'' // list of space separated words
//        maxScore:1
//        indicatorWidth:100px
//        indicatorHeight:40px
//        taskPassScore:0.7
//        precondition:'none|beforeCorrect'
//        maxDuration:60 // seconds
//    }
// 
tutor.inputs.audio = function (parent, options) {
    this.parent = parent;
    this.type = 'audio';
    this.options = options || {};
    
    this.id = this.parent.id + '_' + ( this.options.id  || (++tutor.guid) );
    this.classes = this.options.classes || '';
    this.precondition = this.options.precondition || 'none';
    this.maxScore = (typeof(this.options.maxScore)!=='undefined')?this.options.maxScore : 1;
    this.result = {
        status: tutor.task.status.waiting,
        score: 0,
        passed: 'undefined',
        maxScore: this.maxScore
    };
    this.pattern = this.options.pattern || null;
    this.taskPassScore=this.options.taskPassScore || 0.7;
    this.maxDuration=this.options.maxDuration*1000 || 60000;
    this.indicatorWidth=this.options.indicatorWidth || 100;
    this.indicatorHeight=this.options.indicatorHeight || 40;
    this.indicatorHeight=this.options.indicatorHeight || 40;
    this.value=false;
};

tutor.inputs.audio.prototype.showSuccess = function () {
    this.domElement.removeClass('task-audio-error').addClass('task-audio-correct');
};

tutor.inputs.audio.prototype.showError = function () {
    this.domElement.removeClass('task-audio-correct').addClass('task-audio-error');
};

tutor.inputs.audio.prototype.removeFeedback = function () {
    this.domElement.removeClass('task-audio-correct').removeClass('task-audio-error');
};

tutor.inputs.audio.prototype.enableStopButton=function(){
    this.btnStop.addClass('audio-button-enabled').removeClass('audio-button-disabled').attr('disabled',false);
};

tutor.inputs.audio.prototype.disableStopButton=function(){
    this.btnStop.addClass('audio-button-disabled').removeClass('audio-button-enabled').attr('disabled',true);    
};

tutor.inputs.audio.prototype.enableStartButton=function(){
    //this.btnStart.addClass('audio-button-enabled').removeClass('audio-button-disabled').attr('disabled',false);    
    $('.task-audio-start-record').addClass('audio-button-enabled').removeClass('audio-button-disabled').attr('disabled',false);    
};

tutor.inputs.audio.prototype.disableStartButton=function(){
    // this.btnStart.addClass('audio-button-disabled').removeClass('audio-button-enabled').attr('disabled',true);
    $('.task-audio-start-record').addClass('audio-button-disabled').removeClass('audio-button-enabled').attr('disabled',true);
};

tutor.inputs.audio.prototype.draw = function () {
    
    var self=this;

    this.domElement = $('<span id="task' + this.id + '" class="task-audio ' + this.classes + '"></span>');

    // words to show
    this.wordsDom = $('<span id="taskwords' + this.id + '" class="task-audio-words"></span>');
    this.domElement.append(this.wordsDom);

    // explode
    this.feedback={};
    var words=this.pattern.split(/ +/);
    for(var i=0; i<words.length; i++){
        this.feedback[words[i]]=$('<span class="task-audio-word"></span>');
        this.feedback[words[i]].html(words[i]);
        this.wordsDom.append(this.feedback[words[i]]);
    }    
     
    // audio indicator
    this.indicator=$('<canvas id="canvas-' + this.id + '" width="'+this.indicatorWidth+'" class="task-audio-indicator" height="'+this.indicatorHeight+'"></canvas>');
    this.domElement.append(this.indicator);

    // button to start recording
    this.btnStart=$('<input  type="button" data-audio-id="' + this.id + '" class="task-audio-start-record">');
    this.btnStart.click(tutor.inputs.audioapi.startRecording);
    this.btnStart.click(function(){
        self.result = {
            status: tutor.task.status.waiting,
            score: 0,
            passed: 'undefined',
            maxScore: this.maxScore
        };
        self.enableStopButton();
        self.disableStartButton();
        //stop recording after self.maxDuration milliseconds
        self.stopTimeout = setTimeout(function(){self.btnStop.trigger('click');},self.maxDuration);
    });


    this.domElement.append(this.btnStart);

    // button to stop recording
    this.btnStop=$('<input  type="button" data-audio-id="' + this.id + '" class="task-audio-stop-record">');
    this.btnStop.click(tutor.inputs.audioapi.stopRecording);
    this.btnStop.click(function(){
        self.disableStopButton();
        self.enableStartButton();
        if(self.stopTimeout){
            clearTimeout(self.stopTimeout);
        }
    });
    this.disableStopButton();
    this.domElement.append(this.btnStop);
    
    this.configElement=$('<span class="audio-config" id="config-' + this.id + '" data-string="" data-audio-id="' + this.id + '"></span>');
    this.configElement.attr('data-string',this.pattern);
    this.domElement.append(this.configElement);    

    $(document).on('audioapi:score', function (event, audioId, compositeBlob) {
        if(audioId===self.id){
            self.compositeBlob=compositeBlob;
            self.value={};
            $( document ).trigger( "task:newinput" );
        }
    });
    
    if(this.precondition==='beforeCorrect'){
        this.hide();
    }    

    return this.domElement;
};

tutor.inputs.audio.prototype.test = function (parentCallback) {
    var self=this;
    
    if(this.value === false){
        this.result = {
            status: tutor.task.status.received,
            score: 0,
            passed: 'undefined',
            maxScore: this.maxScore
        };
        parentCallback(this.id, this.result);
        return;
    }

    if(!this.compositeBlob){
        parentCallback(self.id, self.result);
        return;
    }
    
    this.ajax(
            this.options.soundScrorerURL,
            this.compositeBlob, // data to send
            function(responseText){

                // console.log(responseText);
                var reply=JSON.parse(responseText);

                self.value=reply;

                self.result = {
                    status: tutor.task.status.received,
                    score: ( self.value.score>=self.taskPassScore ? self.maxScore : 0),
                    passed: (self.value.score>=self.taskPassScore),
                    maxScore: self.maxScore
                };

                if(this.result && this.result.maxScore>0){
                    // mark each word
                    for(var w in self.value.wordScores){
                        if(self.value.wordScores[w]>=self.taskPassScore){
                            self.feedback[w].removeClass('task-audio-word-error').addClass('task-audio-word-correct');
                        }else{
                            self.feedback[w].removeClass('task-audio-word-correct').addClass('task-audio-word-error');
                        }
                    }

                    // mark all block
                    if(self.value.score>=self.taskPassScore){                
                        self.domElement.removeClass('task-audio-error').addClass('task-audio-correct');
                    } else {
                        self.domElement.removeClass('task-audio-correct').addClass('task-audio-error');
                    }
                }
                // remove audio from RAM
                self.compositeBlob=null;
                parentCallback(self.id, self.result);
            }
    );
    // parentCallback(this.id, this.result);
};

tutor.inputs.audio.prototype.getValue = function () {
    return this.value;
};

tutor.inputs.audio.prototype.getMaxScore = function () {
    return this.maxScore;
};

tutor.inputs.audio.prototype.ajax = function (url, data,onLoadCallback){
        var currentObject=this;

        this.onLoadFunction=onLoadCallback;


        try {
            this.request = new XMLHttpRequest();
        } catch (trymicrosoft) {
            try {
                this.request = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (othermicrosoft) {
                try {
                    this.request = new ActiveXObject("Microsoft.XMLHTTP");
                } catch (failed) {
                    this.request = false;
                }
            }
        }
        if(!this.request) return false;

        if(data){
            this.request.open("POST", url, true);
            this.request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            this.request.setRequestHeader("Content-length", data.length);
            this.request.setRequestHeader("Connection", "close");
        }else{
            this.request.open("GET", url, true);
        }
        this.request.onreadystatechange = function(){
            if (currentObject.request.readyState == 4){
                //console.log(currentObject.request);
                try{
                    currentObject.onLoadFunction(currentObject.request.responseText);
                }catch(err){

                }
            }
        };
        this.request.send(data);
    };

tutor.inputs.audio.prototype.hide=function(){
    this.domElement.hide();
};

tutor.inputs.audio.prototype.show=function(){
    this.domElement.show();
};




/**
 *  container:
 *  swfPath: "./jplayer/jplayer",
    supplied: "mp3,oga,wav",
    media:{
        mp3:
        oga:
        wav:
    },
    frames:[
       {
      	  frame:$(html);
    	  from:parseFloat(f['frame'].attr('data-from')); // seconds
    	  to:parseFloat(f['frame'].attr('data-to'));     // seconds
       }
    ]
 */
tutor.presentationId=0;
tutor.presentation=function(options){
    
    var self = this;
    
    this.presentationId = ++tutor.presentationId;

    this.presentationFrames=options.frames;

    var html="";
    html+='<div id="taskPresentationText'+this.presentationId+'" class="taskPresentationText"></div>';
    html+='<div id="frames'+this.presentationId+'" class="frames"></div>';
    html+='<div id="jquery_jplayer_'+this.presentationId+'" class="jp-jplayer"></div>';
    html+='<div id="jp_container_'+this.presentationId+'" class="jp-audio" role="application" aria-label="media player">';
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
    this.domElement=$(html);
    $(options.container).append(this.domElement);

    

    
    this.searchFrame=function(currentTime){
    	for(var i=0; i<this.presentationFrames.length; i++ ){
            if(this.presentationFrames[i].from <= currentTime &&  currentTime <= this.presentationFrames[i].to){
                    return this.presentationFrames[i];
            }
    	}
    	return null;
    };
    
    
    this.presentationShowFrame=function(frame){
  	if(frame){
	    var copy=frame.frame.clone();
	    $('#taskPresentationText'+this.presentationId).html(copy);
  	}else{
  	    $('#taskPresentationText'+this.presentationId).empty();
  	}
  }
    
    this.timeupdate = function(event){
        var currentTime=event.jPlayer.status.currentTime;
        // console.log(currentTime);
        if( ! self.presentationCurrentFrame
            || self.presentationCurrentFrame.from > currentTime
            || self.presentationCurrentFrame.to < currentTime ){
            self.presentationCurrentFrame=self.searchFrame(currentTime);
            self.presentationShowFrame(self.presentationCurrentFrame);
        }
    };
    

    $("#jquery_jplayer_"+this.presentationId).jPlayer({
        ready: function () { $(this).jPlayer("setMedia", options.media ); },
        timeupdate:this.timeupdate,
        swfPath: options.swfPath,
        supplied: options.supplied,
        wmode: "window",
        useStateClassSkin: true,
        autoBlur: false,
        smoothPlayBar: true,
        keyEnabled: true,
        remainingDuration: true,
        toggleDuration: true
    });

};



/**
 * options{
 *    container:
 *    swfPath: "./jplayer/jplayer",
 *    supplied: "mp3,oga,wav",
 *    labels:{
 *        playing:'||'
 *        paused:'>'
 *    }
 *    playlist:[
 *          {
 *                 title:'Бублички',
 *                 mp3:'./playmessage/bublichki.mp3'
 *                 oga:
 *                 wav:
 *          },
 *          {
 *                 title:'В землянке',
 *                 mp3:'./playmessage/v_zemlyanke.mp3'
 *                 oga:
 *                 wav:
 *          },
 *          {
 *                 title:'Сердце',
 *                 mp3:'./playmessage/serdtse.mp3'
 *                 oga:
 *                 wav:
 *          },
 *    ];
 * }
 */
tutor.playlistId=0;
tutor.playlist=function(options){
        
    var self = this;
    
    this.id = ++tutor.playlistId;

    this.labels = options.labels || {};
    this.labels.playing = this.labels.playing || '||';
    this.labels.paused  = this.labels.paused  || '>' ;
 
    var html="";
    html+='<div id="jquery_jplayer_'+this.id+'" class="jp-jplayer"></div>';
    html+='<div id="jp_container_'+this.id+'" class="jp-audio" role="application" aria-label="media player">';
    html+='	<div class="jp-type-single">';
    html+='		<div class="jp-no-solution">';
    html+='			<span>Update Required</span>';
    html+='			To play the media you will need to either update your browser to a recent version or update your <a href="http://get.adobe.com/flashplayer/" target="_blank">Flash plugin</a>.';
    html+='		</div>';
    html+='	</div>';
    html+='</div>';
    html+='<div id="playlist_'+this.id+'"></div>';
    this.domElement=$(html);
    $(options.container).append(this.domElement);
    
    var player=$("#jquery_jplayer_"+this.id);
    var playlistBlock=$('#playlist_'+this.id);

    this.currenttrack=false;
    
    this.playlist = options.playlist || [];
    for(var i=0; i<this.playlist.length; i++){
        var html="<div class='playlist_item'><input type='button' id='playlist_" + this.id + "_" + i + "' data-i='" + i + "' class='playlist_button' value='>'>&nbsp;" + this.playlist[i].title + "</div>";
        playlistBlock.append($(html));
    }

    playlistBlock.find('.playlist_button').click(function(ev){
    	var btn=$(this);
    	var i=btn.attr('data-i');
        
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
            playlistBlock.find('.playlist_button').attr('value',self.labels.paused);
            btn.attr('value',self.labels.playing);
        }
    });

    player.jPlayer({
        ready: function () { },
        swfPath: options.swfPath,
        supplied: options.supplied,
        wmode: "window",
        useStateClassSkin: true,
        autoBlur: false,
        smoothPlayBar: true,
        keyEnabled: true,
        remainingDuration: true,
        toggleDuration: true,
        ended:function(){playlistBlock.find('.playlist_button').attr('value',self.labels.paused);}
    });

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
        swfPath: this.options.swfPath,
        supplied: this.options.supplied,
        wmode: "window",
        useStateClassSkin: true,
        autoBlur: false,
        smoothPlayBar: true,
        keyEnabled: true,
        remainingDuration: true,
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

