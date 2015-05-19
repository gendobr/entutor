var tutor = {};


/**
 * options={
 *    id:'task01',
 *    text:{
 *       testbutton: 'Проверить',
 *       nextbutton: 'Далее',
 *       restartbutton: 'Начать заново'
 *    },
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
 * 
 * 
 */

tutor.task = function (options) {
    this.options = options;

    this.id = options.id;

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
    this.presentation = new tutor.presentation(this, this.options.presentation);

    // create inputs
    this.inputs = new tutor.inputs.card(this, this.options.inputs);

    // console.log(this);
};

tutor.task.prototype.template =
        '<span id="task{{id}}" class="task-container">'
        + '<span id="task{{id}}tip" class="task-tip"><!-- task.tip --></span>'
        + '<span id="task{{id}}presentation" class="task-presentation"><!-- task.presentation --></span>'
        + '<span id="task{{id}}inputs" class="task-inputs"><!-- task.inputs --></span>'
        + '<span id="task{{id}}buttons" class="task-buttons">'
        + '<input type="button" value="{{text.testbutton}}" id="task{{id}}testbutton">'
        + '<input type="button" value="{{text.nextbutton}}" id="task{{id}}nextbutton">'
        + '<input type="button" value="{{text.restartbutton}}" id="task{{id}}restartbutton">'
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
    if (this.presentation) {
        this.domElement.find('#task' + this.id + 'presentation').append(this.presentation.draw());
    }
    if (this.inputs) {
        this.domElement.find('#task' + this.id + 'inputs').append(this.inputs.draw());
    }


    var onTestFinished = function (id, result) {
        console.log('task:', [id, result]);
        self.domElement.trigger('task:test', [self.id, result]);
    };
    this.domElement.find('#task' + this.id + 'testbutton').click(function () {
        self.inputs.test(onTestFinished);
    });
    //$('#task'+this.id+'nextbutton').click(this.nextFactory);
    //$('#task'+this.id+'restartbutton').click(this.restartbutton);
    return this.domElement;
};


// =============================================================================

tutor.presentation = function (parent, options) {
    this.parent = parent;
    this.options = options||{};
};

tutor.presentation.prototype.draw=function(){
    return $(this.options.innerHtml||'');
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
//    options={
//        type:'card',
//        id:''
//        arrange:vertical|horizontal
//        classes:''
//        children:[
//           <list of subelements>
//        ]
//    }
// 
tutor.inputs.card = function (parent, options) {
    this.parent = parent;
    this.options = options;
    this.id = this.parent.id + '_' + this.options.id;

    this.classes = this.options.classes || '';
    this.arrange = this.options.arrange || 'horizontal';


    // create child elements
    this.children = [];
    this.result = {
        status: tutor.task.status.waiting,
        score: null,
        subresults: []
    };
    for (var key = 0; key < this.options.children.length; key++) {
        var child = this.options.children[key];
        if (typeof (tutor.inputs[child.type]) === 'function') {
            var constructor = tutor.inputs[child.type];
            var childObject = new constructor(this, child);
            this.children.push(childObject);
            this.result.subresults[childObject.id] = {
                status: tutor.task.status.waiting,
                score: null,
                subresults: []
            };//;
        }
    }
};

tutor.inputs.card.prototype.test = function (parentCallback) {

    // clear previous score
    this.result.status = tutor.task.status.waiting;
    this.result.score = null;
    for (var key in this.result.subresults) {
        with (this.result.subresults[key]) {
            status = tutor.task.status.waiting;
            score = null;
        }
    }

    var self = this;
    var testFinishedCallback = function (id, result) {
        // console.log('card: received from ', id, result);

        // save subresult
        self.result.subresults[id] = {
            status: tutor.task.status.received,
            score: (result?result.score:null),
            subresults: (result?result.subresults:null)
        };

        // update score
        var newscore = 0;
        for (var key in self.result.subresults) {
            if (newscore !== null) {
                with (self.result.subresults[key]) {
                    //console.log('subresults ',key, self.result.subresults[key]);
                    if (isNaN(parseFloat(score))) {
                        newscore = null;
                        //console.log(key, ' => newscore = null ');
                    } else {
                        newscore += score;
                        //console.log(key, ' => newscore = ' + newscore);
                    }
                }
            }
        }
        self.result.score = newscore;

        // check if all tests are received
        var allTestsReceived = true;
        for (var key in self.result.subresults) {
            if (self.result.subresults[key].status === tutor.task.status.waiting) {
                // console.log("===>",key,self.result.subresults[key], self.result.subresults[key].status, tutor.task.status.waiting);
                allTestsReceived = false;
            }
        }


        // console.log('card '+self.id+': result ', self.result);
        // console.log('card '+self.id+': allTestsReceived ', allTestsReceived);

        if (allTestsReceived) {
            self.result.status = tutor.task.status.received;
            parentCallback(self.id, self.result);
        }
    };


    for (var key = 0; key < this.children.length; key++) {
        this.children[key].test(testFinishedCallback);
    }

};

tutor.inputs.card.prototype.draw = function () {
    var html = $('<span id="task' + this.id + '" class="task-card ' + this.classes + '"></span>');
    for (var key = 0; key < this.children.length; key++) {
        var block = $('<span class="task-card-element task-card-' + this.arrange + '"></span>');
        html.append(block);
        var child = this.children[key];
        this.children[key].domElement = child.draw();
        block.append(this.children[key].domElement);
    }
    return html;
};

tutor.inputs.card.prototype.value = function () {
    var value = [];
    for (var key = 0; key < this.children.length; key++) {
        value.push(this.children[key].value());
    }
    return value;
};

tutor.inputs.card.prototype.maxScore = function () {
    var maxScore = 0;
    for (var key = 0; key < this.children.length; key++) {
        maxScore+=this.children[key].maxScore;
    }
    return maxScore;
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
//    }
tutor.inputs.html = function (parent, options) {
    this.parent = parent;
    this.options = options;
    this.id = this.parent.id + '_' + this.options.id;
    this.classes = this.options.classes || '';
    this.maxScore=0;
};

tutor.inputs.html.prototype.test = function (testFinishedCallback) {
    testFinishedCallback(this.id, {
        status: tutor.task.status.received,
        score: 0
        // ,subresults: []
    });
};

tutor.inputs.html.prototype.draw = function () {
    var html = $('<span id="task' + this.id + '" class="task-card ' + this.classes + '">' + this.options.innerHtml + '</span>');
    return html;
};

tutor.inputs.html.prototype.value = function () {
    return null;
};

tutor.inputs.html.prototype.maxScore = function () {
    return this.maxScore;
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
//    }
// 
tutor.inputs.text = function (parent, options) {
    this.parent = parent;
    this.options = options;
    this.id = this.parent.id + '_' + this.options.id;
    this.classes = this.options.classes || '';
    this.maxScore = this.options.maxScore || 1;
    this.result = null;
    this.pattern = this.options.pattern || null;
};


tutor.inputs.text.prototype.showSuccess = function () {
    this.textField.removeClass('task-text-error').addClass('task-text-correct');
};
tutor.inputs.text.prototype.showError = function () {
    this.textField.removeClass('task-text-correct').addClass('task-text-error');
};

tutor.inputs.text.prototype.test = function (parentCallback) {
    if (this.pattern) {
        var isCorrect = this.pattern.test(this.value);
        if (isCorrect) {
            this.showSuccess();
        } else {
            this.showError();
        }
        this.result = {
            status: tutor.task.status.received,
            score: (isCorrect ? this.maxScore : 0)
            // , subresults: []
        };
        parentCallback(this.id, this.result);
    } else {
        parentCallback(this.id, null);
    }
};

tutor.inputs.text.prototype.draw = function () {
    this.textField = $('<input type="text" id="task' + this.id + 'text" value="" size="' + (this.options.size || '') + '">');
    var self = this;
    this.textField.change(function (ev) {
        self.value = $(ev.target).val();
    });
    if (this.options.value) {
        this.textField.attr('value', this.options.value);
        this.value = this.options.value;
    }
    var html = $('<span id="task' + this.id + '" class="task-text ' + this.classes + '"></span>');
    html.append(this.textField);
    return html;
};

tutor.inputs.text.prototype.value = function () {
    return this.value;
};

tutor.inputs.text.prototype.maxScore = function () {
    return this.maxScore;
};











// =============================================================================
//
//    options={
//        type:'radio',
//        id:''
//        classes:''
//        maxScore:1
//        arrange:vertical|horizontal
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
    this.options = options;
    this.id = this.parent.id + '_' + this.options.id;
    this.classes = this.options.classes || '';
    this.maxScore = this.options.maxScore || 1; 
    this.correctVariant = this.options.correctVariant || null;
    this.result = null;
    this.arrange = this.options.arrange || 'horizontal';
};

tutor.inputs.radio.prototype.showSuccess = function () {
    this.domElement.removeClass('task-radio-error').addClass('task-radio-correct');
};
tutor.inputs.radio.prototype.showError = function () {
    this.domElement.removeClass('task-radio-correct').addClass('task-radio-error');
};

tutor.inputs.radio.prototype.test = function (parentCallback) {

    if (this.correctVariant) {
        var isCorrect = (this.value === this.correctVariant);
        if (isCorrect) {
            this.showSuccess();
        } else {
            this.showError();
        }
        this.result = {
            status: tutor.task.status.received,
            score: isCorrect ? this.maxScore : 0
            // , subresults: []
        };
        parentCallback(this.id, this.result);
    } else {
        parentCallback(this.id, null);
    }
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
    };
    this.radioButtons = [];
    for (var k in this.options.variant) {
        var elm = $('<label class="task-radio-label task-radio-label-'+this.arrange+'" data-value="' + k + '"><input type="radio" name="task' + this.id + 'radio"  class="task-radio-btn" value="' + k + '">' + this.options.variant[k] + '</label>');
        elm.change(onchange);
        this.domElement.append(elm);
        this.radioButtons.push(elm);
    }
    return  this.domElement;
};

tutor.inputs.radio.prototype.value = function () {
    return this.value;
};

tutor.inputs.radio.prototype.maxScore = function () {
    return this.maxScore;
};











// =============================================================================
//
//    options={
//        type:'checkbox',
//        id:''
//        classes:''
//        maxScore:1
//        correctVariant:false|true,
//        label:'1 check me answer',
//     }
// 
tutor.inputs.checkbox = function (parent, options) {
    this.parent = parent;
    this.options = options;
    this.id = this.parent.id + '_' + this.options.id;
    this.classes = this.options.classes || '';
    this.maxScore = this.options.maxScore || 1;
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

tutor.inputs.checkbox.prototype.test = function (parentCallback) {
    if (this.options.correctVariant===true) {
        if (this.value) {
            this.showSuccess();
        } else {
            this.showError();
        }
        this.result = {
            status: tutor.task.status.received,
            score: (this.value ? this.maxScore : 0)
            // , subresults: []
        };
        parentCallback(this.id, this.result);
    } else if(this.options.correctVariant===false){
        if (!this.value) {
            this.showSuccess();
        } else {
            this.showError();
        }
        this.result = {
            status: tutor.task.status.received,
            score: (!this.value ? this.maxScore : 0)
            // ,  subresults: []
        };
        parentCallback(this.id, this.result);
    }else {
        parentCallback(this.id, null);
    }
};

tutor.inputs.checkbox.prototype.draw = function () {
    this.checkbox = $('<input type="checkbox" id="task' + this.id + 'checkbox" class="task-checkbox">');
    var self = this;
    this.checkbox.change(function (ev) {
        var checkbox=$(ev.target)
        self.value = checkbox.prop('checked');
    });
    this.domElement = $('<label id="task' + this.id + '" class="task-checkbox-label ' + this.classes + '"></label>');
    this.domElement.append(this.checkbox);
    if(this.options.label){
        this.domElement.append($('<span class="task-checkbox-label-text">'+this.options.label+'</span>'));
    }
    return this.domElement;
};

tutor.inputs.checkbox.prototype.value = function () {
    return this.value;
};

tutor.inputs.checkbox.prototype.maxScore = function () {
    return this.maxScore;
};
















// =============================================================================
//
//    options={
//        type:'checkbox',
//        id:''
//        classes:''
//        innerHtml:'1 check me answer', // visible text or html code
//        value:'' // value that will be checked, if not set the innerHtml is used
//     }
// 

tutor.inputs.counter = function (parent, options) {
    this.parent = parent;
    this.options = options;
    this.id = this.parent.id + '_' + this.options.id;
    this.classes = this.options.classes || '';
    this.value = this.options.value || '';
};

tutor.inputs.counter.prototype.test = function (testFinishedCallback) {
    testFinishedCallback(this.id, {
        status: tutor.task.status.received,
        score: 0
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
    return this.counterplace;
};

tutor.inputs.counter.prototype.value = function () {
    return null;
};

tutor.inputs.counter.prototype.maxScore = function () {
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












// =============================================================================
//
//    options={
//        type:'checkbox',
//        id:''
//        classes:''
//        innerHtml:'1 check me answer', // visible text or html code
//        maxScore:1
//        pattern: //regexp, patternt to check if value of dropped counter is correct
//        value:'' // value that will be checked, if not set the innerHtml is used
//        size: // integer, width of placehoder, css property, units are 'em'
//     }
// 

tutor.inputs.dropzone = function (parent, options) {
    this.parent = parent;
    this.options = options;
    this.id = this.parent.id + '_' + this.options.id;
    this.classes = this.options.classes || '';
    this.maxScore = this.options.maxScore || 1;
    this.result = null;
    this.pattern = this.options.pattern || null;
    this.child=null;
    this.offset=null;

};


tutor.inputs.dropzone.prototype.showSuccess = function () {
    this.dropzone.removeClass('task-dropzone-error').addClass('task-dropzone-correct');
};
tutor.inputs.dropzone.prototype.showError = function () {
    this.dropzone.removeClass('task-dropzone-correct').addClass('task-dropzone-error');
};

tutor.inputs.dropzone.prototype.test = function (parentCallback) {
    if (this.pattern) {
        var isCorrect = this.pattern.test(this.value);
        if (isCorrect) {
            this.showSuccess();
        } else {
            this.showError();
        }
        this.result = {
            status: tutor.task.status.received,
            score: (isCorrect ? this.maxScore : 0)
        };
        parentCallback(this.id, this.result);
    } else {
        parentCallback(this.id, null);
    }
};

tutor.inputs.dropzone.prototype.draw = function () {

    var self = this;

    this.dropzone = $('<span id="task' + this.id + 'dropzone" class="task-dropzone" style="width:' + (this.options.size || '4') + 'em;"></span>');
    
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
        self.value=self.child.attr('data-value')
        self.child.draggable( "option", "revert", false );
        self.child.offset(self.offset);

    };
    var draggedOut=function(event, ui){
        // remove previous child
        console.log(ui);
        if(self.child){
            tutor.inputs.counterRevertQueue.push(self.child);
            self.child=null;
        }
    }
    this.dropzone.droppable( {
        drop: handleDropEvent,
        out: draggedOut
    } );

    return this.dropzone;
};



tutor.inputs.dropzone.prototype.value = function () {
    return this.value;
};

tutor.inputs.dropzone.prototype.maxScore = function () {
    return this.maxScore;
};
