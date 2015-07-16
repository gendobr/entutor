


var entutor = {};
entutor.guid = 0;
entutor.config = {};
entutor.inputs = {};
entutor.dropzones = {};
entutor.jplayers = {};
entutor.recorders={};
entutor.currentCounter = false;

entutor.debug = false;








// =============================================================================
entutor.show = function (jsonURL, containerSelector) {
    // process the form
    entutor.currentCounter = false;
    entutor.dropzones = {};
    entutor.jplayers = {};
    entutor.recorders={};
    $.ajax({
        type: 'GET', // define the type of HTTP verb we want to use (POST for our form)
        url: jsonURL, // the url where we want to POST
        // data: formData, // our data object
        dataType: 'json', // what type of data do we expect back from the server
        encode: true
    }).done(function (json) {
        var task = new entutor.task(json);
        $(containerSelector).empty().append(task.draw());
        window.location.hash = json.id;
    });
};





// =============================================================================
entutor.task = function (options) {

    var self = this;

    this.options = options || {};

    this.id = options.id || (++entutor.guid);

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

};

entutor.task.prototype.template =
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

entutor.task.prototype.text = {
    testbutton: 'Проверить',
    nextbutton: 'Далее',
    restartbutton: 'Начать задание заново'
};


entutor.task.status = {
    received: 'received',
    waiting: 'waiting'
};

entutor.task.prototype.draw = function () {

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

    this.nextButton = this.domElement.find('#task' + this.id + 'nextbutton');
    this.nextButton.attr('disabled', true);
    this.nextButton.click(function () {
        // alert('nextbutton');
        if (self.options && self.options.next) {
            window.location.href = self.options.next;
        }
    });
    this.domElement.find('#task' + this.id + 'restartbutton').click(function () {
        window.location.reload();
    });
    return this.domElement;
};



entutor.task.prototype.test = function (self) {
    return function () {
        // console.log("self.inputs.test");
        self.inputs.test(function (id, result) {
            // enable Next button if test is passed
            if (entutor.debug) {
                console.log("self.inputs.test id=", id, " result=", result);
            }
            if (result.passed === true) {
                self.nextButton.attr('disabled', false);
            }
            self.domElement.trigger('task:test', [self.id, result]);
        });
    };
};







// =============================================================================
entutor.testPresentation = function (parent, options) {
    this.parent = parent;
    this.options = options || {};
    // console.log(this);
};

entutor.testPresentation.prototype.draw = function () {
    if (this.options.innerHtml) {
        return $(this.options.innerHtml);
    }
    if (this.options.elementSelector) {
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
//              status: entutor.task.status.received,
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

entutor.inputs.card = function (parent, options) {
    this.type = 'card';
    this.parent = parent;
    this.options = options || {};
    this.id = this.parent.id + '_' + (this.options.id || (++entutor.guid));

    this.classes = this.options.classes || '';
    this.arrange = this.options.arrange || 'horizontal';
    this.taskPassScore = this.options.taskPassScore || 1;
    this.precondition = this.options.precondition || 'none';
    this.customtest = this.options.customtest || false;
    this.maxScore = (typeof (this.options.maxScore) !== 'undefined') ? this.options.maxScore : 1;

    // create child elements
    this.children = [];
    this.result = {
        status: entutor.task.status.waiting,
        score: null,
        subresults: [],
        passed: false,
        maxScore: 0
    };
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

entutor.inputs.card.prototype.test = function (parentCallback) {

    // clear previous score
    this.result.status = entutor.task.status.waiting;
    this.result.score = null;
    this.result.passed = 'undefined';
    this.result.maxScore = this.getMaxScore();
    for (var key in this.result.subresults) {
        with (this.result.subresults[key]) {
            status = entutor.task.status.waiting;
            score = null;
            passed = 'undefined';
        }
    }

    var self = this;
    var testFinishedCallback = function (id, result) {
        //console.log('card:',self.id, ' received from ',id, result);
        //console.log('card:',self.id, ' received from ',id, result.passed);

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
                    } else if (self.result.passed === false) {
                        self.showError();
                    }
                }
            }

            // apply child pre-conditions
            for (var key = 0; key < self.children.length; key++) {
                if (self.children[key].precondition === 'beforeCorrect') {

                    var allPreviousPassed = true;
                    for (var i = 0; i < key; i++) {
                        if (self.children[i].result.passed === false || self.children[i].result.passed === 'undefined') {
                            allPreviousPassed = false;
                        }
                    }
                    //console.log(key,'beforeCorrect',allPreviousPassed);
                    if (allPreviousPassed) {
                        self.children[key].show();
                    } else {
                        self.children[key].hide();
                    }
                } else {
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

entutor.inputs.card.prototype.draw = function () {
    this.domElement = $('<span id="task' + this.id + '" class="task-card  task-card-' + this.arrange + ' ' + this.classes + '"></span>');
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

entutor.inputs.card.prototype.hide = function () {
    this.domElement.hide();
};

entutor.inputs.card.prototype.show = function () {
    this.domElement.show();
};

// factory, creates custom test
entutor.inputs.card.prototype.customtestSets = function (sets) {
    return function (arrayOfChildComponents) {

        // console.log(arrayOfChildComponents);
        var map = [];
        for (var s = 0; s < sets.length; s++) {
            map[s] = 1;
        }
        for (var ch = 0; ch < arrayOfChildComponents.length; ch++) {
            for (var s = 0; s < sets.length; s++) {
                var vals = arrayOfChildComponents[ch].getValue();
                var patt = sets[s];
                // console.log(ch,vals,s,patt);
                if (vals.length === patt.length) {
                    var sum = 0;
                    for (var v = 0; v < vals.length; v++) {
                        for (var p = 0; p < patt.length; p++) {
                            if (patt[p].test(vals[v])) {
                                sum++;
                            }
                        }
                    }
                    if (sum === patt.length) {
                        map[s] = 0;
                        break;
                    }
                }
            }
        }
        var sum = 0;
        for (var s = 0; s < sets.length; s++) {
            sum += map[s];
        }

        var result = {
            status: entutor.task.status.received,
            score: (sum === 0 ? this.maxScore : 0),
            subresults: [],
            passed: (sum === 0),
            maxScore: 1
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
entutor.inputs.html = function (parent, options) {
    this.type = 'html';
    this.parent = parent;
    this.options = options || {};
    this.id = this.parent.id + '_' + (this.options.id || (++entutor.guid));
    this.classes = this.options.classes || '';
    this.precondition = this.options.precondition || 'none';
    this.maxScore = 1;
};

entutor.inputs.html.prototype.test = function (testFinishedCallback) {
    testFinishedCallback(this.id, {
        status: entutor.task.status.received,
        score: 1,
        passed: true,
        maxScore: 1
    });
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

entutor.inputs.html.prototype.hide = function () {
    this.domElement.hide();
};

entutor.inputs.html.prototype.show = function () {
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
    this.parent = parent;
    this.type = 'text';
    this.options = options || {};
    this.id = this.parent.id + '_' + (this.options.id || (++entutor.guid));
    this.classes = this.options.classes || '';
    this.precondition = this.options.precondition || 'none';
    this.maxScore = (typeof (this.options.maxScore) !== 'undefined') ? this.options.maxScore : 1;
    this.result = null;
    this.pattern = this.options.pattern || null;
    if (typeof (this.pattern) === 'string') {
        this.pattern = new RegExp('^ *' + this.pattern + ' *$');
    }
    this.customtest = this.options.customtest || false;

    this.value = false;
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

entutor.inputs.text.prototype.test = function (parentCallback) {
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
        this.result = this.result = {
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
        } else if (this.result.passed === false) {
            this.showError();
        }
    }

    parentCallback(this.id, this.result);

};

entutor.inputs.text.prototype.draw = function () {
    this.textField = $('<input type="text" id="task' + this.id + 'text" value="" size="' + (this.options.size || '') + '">');
    var self = this;
    this.textField.change(function (ev) {
        self.value = $(ev.target).val();
        $(document).trigger("task:newinput");
    });
    if (this.options.value) {
        this.textField.attr('value', this.options.value);
        // this.value = this.options.value;
    }
    this.domElement = $('<span id="task' + this.id + '" class="task-text ' + this.classes + '"></span>');
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

entutor.inputs.text.prototype.hide = function () {
    this.domElement.hide();
};

entutor.inputs.text.prototype.show = function () {
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
entutor.inputs.radio = function (parent, options) {
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
    this.arrange = this.options.arrange || 'horizontal';

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


entutor.inputs.radio.prototype.test = function (parentCallback) {
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
        } else if (this.result.passed === false) {
            this.showError();
        } else {
            this.removeFeedback();
        }
    }

    parentCallback(this.id, this.result);
};

entutor.inputs.radio.prototype.draw = function () {
    this.domElement = $('<span id="task' + this.id + '" class="task-radiobuttons' + this.classes + '"></span>');
    var self = this;
    var onchange = function (el) {
        var btn = $(el.target);
        self.domElement.find('label').removeClass('task-radio-checked');
        if (btn.is(':checked')) {
            self.value = btn.val();
            btn.parent().addClass('task-radio-checked');
        }
        $(document).trigger("task:newinput");
    };
    this.radioButtons = [];
    for (var k in this.options.variant) {
        var elm = $('<label class="task-radio-label task-radio-label-' + this.arrange + '" data-value="' + k + '"><input type="radio" name="task' + this.id + 'radio"  class="task-radio-btn" value="' + k + '">' + this.options.variant[k] + '</label>');
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

entutor.inputs.radio.prototype.hide = function () {
    this.domElement.hide();
};

entutor.inputs.radio.prototype.show = function () {
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
entutor.inputs.checkbox = function (parent, options) {
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

entutor.inputs.checkbox.prototype.test = function (parentCallback) {

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
        } else if (this.result.passed === false) {
            this.showError();
        } else {
            this.removeFeedback();
        }
    }
    parentCallback(this.id, this.result);

};

entutor.inputs.checkbox.prototype.draw = function () {
    this.checkbox = $('<input type="checkbox" id="task' + this.id + 'checkbox" class="task-checkbox">');
    var self = this;
    this.checkbox.change(function (ev) {
        var checkbox = $(ev.target)
        self.value = checkbox.prop('checked') ? 'checked' : 'unchecked';
        $(document).trigger("task:newinput");
    });
    this.domElement = $('<label id="task' + this.id + '" class="task-checkbox-label ' + this.classes + '"></label>');
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

entutor.inputs.checkbox.prototype.hide = function () {
    this.domElement.hide();
};

entutor.inputs.checkbox.prototype.show = function () {
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
entutor.inputs.sound = function (parent, options) {
    this.type = 'sound';
    this.parent = parent;
    this.options = options || {};
    this.id = this.parent.id + '_' + (this.options.id || (++entutor.guid));
    this.classes = this.options.classes || '';
    this.precondition = this.options.precondition || 'none';
    this.swfPath = this.options.swfPath || entutor.config.swfPath
    this.supplied = this.options.supplied || "mp3,oga,wav";

    this.maxScore = 1;
    this.passed=false;

    this.playlist = options.playlist || [];
    this.labels = options.labels || {};
    this.labels.playing = this.labels.playing || '||';
    this.labels.paused = this.labels.paused || '>';
    
    entutor.jplayers[this.id] = this;
};

entutor.inputs.sound.prototype.test = function (testFinishedCallback) {
    testFinishedCallback(this.id, {
        status: entutor.task.status.received,
        score: this.passed?1:0,
        passed: this.passed,
        maxScore: 0
    });
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
    html += '<span id="sound_' + this.id + '" class="task-sound"></span>';

    this.domElement = $('<span id="task' + this.id + '" class="task-sound ' + this.classes + '"></span>');
    this.domElement.append($(html));


    var player = this.domElement.find("#jquery_jplayer_" + this.id);
    var soundBlock = this.domElement.find('#sound_' + this.id);

    this.currenttrack = false;

    for (var i = 0; i < this.playlist.length; i++) {
        var html = "<span class='task-sound-label'><input type='button' id='sound_" + this.id + "_" + i + "' data-i='" + i + "' class='sound_button' value='>'>&nbsp;" + this.playlist[i].title + "</span>";
        soundBlock.append($(html));
    }

    soundBlock.find('.sound_button').click(function (ev) {
        var btn = $(this);
        var i = btn.attr('data-i');
        soundBlock.find('.sound_button').attr('value', self.labels.paused);
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

            btn.attr('value', self.labels.playing);
        }
    });

    player.jPlayer({
        ready: function () {  },
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
            self.passed=true;
            soundBlock.find('.sound_button').attr('value', self.labels.paused);
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

entutor.inputs.sound.prototype.hide = function () {
    this.domElement.hide();
};

entutor.inputs.sound.prototype.show = function () {
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
entutor.inputs.video = function (parent, options) {
    this.type = 'video';
    this.parent = parent;
    this.options = options || {};
    this.id = this.parent.id + '_' + (this.options.id || (++entutor.guid));
    this.classes = this.options.classes || '';
    this.precondition = this.options.precondition || 'none';
    this.supplied = this.options.supplied || "webmv, ogv, m4v";
    this.swfPath = this.options.swfPath || entutor.config.swfPath;
    this.maxScore = 1;
    this.passed=false;
    this.labels = options.labels || {};
    this.labels.playing = this.labels.playing || '||';
    this.labels.paused = this.labels.paused || '>';
    this.media = options.media || {};
    entutor.jplayers[this.id] = this;
};

entutor.inputs.video.prototype.test = function (testFinishedCallback) {
    testFinishedCallback(this.id, {
        status: entutor.task.status.received,
        score: this.passed?this.maxScore:0,
        passed: this.passed,
        maxScore: this.maxScore
    });
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

    html += "<script type=\"application/javascript\">\n";
    html += "    (function(){\n";
    html += "        $('#jquery_jplayer_" + this.id + "').jPlayer({\n";
    html += "            ready: function () { $(this).jPlayer(\"setMedia\", " + JSON.stringify(this.media) + "); },\n";
    html += "            swfPath: '" + this.swfPath + "',\n";
    html += "            supplied: '" + this.supplied + "',\n";
    html += "            cssSelectorAncestor: '#jp_container_" + this.id + "',\n";
    html += "            wmode: \"window\",\n";
    html += "            useStateClassSkin: true,\n";
    html += "            autoBlur: false,\n";
    html += "            smoothPlayBar: true,\n";
    html += "            keyEnabled: true,\n";
    html += "            remainingDuration: true,\n";
    html += "            toggleDuration: true,\n";
    html += "            volume:1,\n";
    html+="              ended:function(){  entutor.jplayers['" + this.id + "'].passed=true;}\n";
    html += "        });\n";
    html += "    })()\n";
    html += "</script>";

    this.domElement = $('<span id="task' + this.id + '" class="task-video ' + this.classes + '"></span>');
    this.domElement.append($(html));

    this.player = this.domElement.find("#jquery_jplayer_" + this.id);

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

entutor.inputs.video.prototype.hide = function () {
    this.domElement.hide();
};

entutor.inputs.video.prototype.show = function () {
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

entutor.inputs.counter = function (parent, options) {
    this.parent = parent;
    this.type = 'counter';
    this.options = options || {};
    this.id = this.parent.id + '_' + (this.options.id || (++entutor.guid));
    this.classes = this.options.classes || '';
    this.precondition = this.options.precondition || 'none';
    this.value = this.options.value || '';
};

entutor.inputs.counter.prototype.test = function (testFinishedCallback) {
    testFinishedCallback(this.id, {
        status: entutor.task.status.received,
        score: 0,
        passed: true,
        maxScore: 0
    });
};

entutor.inputs.counter.prototype.draw = function () {
    var self = this;

    this.counterplace = $('<span id="task' + this.id + 'counterplace"  data-id="' + this.id + '" class="task-counterplace ' + this.classes + '"></span>');
    this.counter = $('<span id="task' + this.id + 'counter" data-id="' + this.id + '" class="task-counter ' + this.classes + '">' + this.options.innerHtml + '</span>');
    if (this.value) {
        this.counter.attr('data-value', this.value);
    } else {
        this.counter.attr('data-value', this.counter.text());
    }
    this.counter.draggable({
        containment: 'document',
        // revert: true,
        start: function (event, ui) {
            if (!$(ui.helper).attr('data-top')) {
                $(ui.helper).attr('data-top', ui.position.top);
                $(ui.helper).attr('data-left', ui.position.left);
            }
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
                self.counter.animate(
                        {left: self.counter.attr('data-left') + 'px', top: self.counter.attr('data-top') + 'px'},
                "slow",
                        "swing",
                        function () {
                            for (var i in entutor.dropzones) {
                                entutor.dropzones[i].removeChild(self);
                            }
                        }
                );
            } else {
                for (var i in entutor.dropzones) {
                    if (i === j) {
                        entutor.dropzones[j].setChild(self);
                    } else {
                        entutor.dropzones[i].removeChild(self);
                    }
                }
            }
        }
    });

    // only for touchscreens
    this.counter.click(function(){
        if(entutor.currentCounter && entutor.currentCounter.id===self.id){
            entutor.currentCounter.counter.removeClass('task-counter-active');
            entutor.currentCounter=false;
        }else{
            if(entutor.currentCounter){
                entutor.currentCounter.counter.removeClass('task-counter-active');
                entutor.currentCounter=false;
            }



            entutor.currentCounter=self;
            entutor.currentCounter.counter.addClass('task-counter-active');
            if (!entutor.currentCounter.counter.attr('data-top')) {
                var position = entutor.currentCounter.counter.position();
                entutor.currentCounter.counter.attr('data-top',  position.top);
                entutor.currentCounter.counter.attr('data-left', position.left);
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
            entutor.currentCounter.counter.animate(
                {left: entutor.currentCounter.counter.attr('data-left') + 'px', top: entutor.currentCounter.counter.attr('data-top') + 'px'},
                "slow",
                "swing",
                function () {
                    for (var i in entutor.dropzones) {
                        entutor.dropzones[i].removeChild(entutor.currentCounter);
                    }
                    entutor.currentCounter=false;
                }
            );
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

entutor.inputs.counter.prototype.hide = function () {
    this.counterplace.hide();
    this.counter.hide();
};

entutor.inputs.counter.prototype.show = function () {
    this.counterplace.show();
    this.counter.show();
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
    // console.log(options);
    this.parent = parent;
    this.type = 'dropzone';
    this.options = options || {};
    this.id = this.parent.id + '_' + (this.options.id || (++entutor.guid));
    this.classes = this.options.classes || '';
    this.precondition = this.options.precondition || 'none';
    this.maxScore = (typeof (this.options.maxScore) !== 'undefined') ? this.options.maxScore : 1;
    this.result = null;
    this.pattern = this.options.pattern || null;
    if (typeof (this.pattern) === 'string') {
        this.pattern = new RegExp('^ *' + this.pattern + ' *$');
    }
    this.child = null;
    this.offset = null;
    this.customtest = this.options.customtest || false;
    this.value = false;

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

entutor.inputs.dropzone.prototype.test = function (parentCallback) {
    if (this.value === false) {
        this.result = {
            status: entutor.task.status.received,
            score: 0,
            passed: 'undefined',
            maxScore: this.maxScore
        };
    } else if (this.customtest) {
        this.result = this.customtest(this.value);
    } else if (this.pattern) {
        var isCorrect = this.pattern.test(this.value);
        this.result = {
            status: entutor.task.status.received,
            score: (isCorrect ? this.maxScore : 0),
            passed: isCorrect,
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

    this.removeFeedback();
    if (this.result && this.result.maxScore > 0) {
        if (this.result.passed === true) {
            this.showSuccess();
        } else if (this.result.passed === false) {
            this.showError();
        }
    }

    if (this.options.ejectCounterOnError && this.result.passed !== true) {
        if (this.child && this.child.counter) {
            this.child.counter.animate(
                    {left: this.child.counter.attr('data-left') + 'px', top: this.child.counter.attr('data-top') + 'px'},
                    "slow",
                    "swing"
            );
        }
        this.removeChild(this.child);
    }
    parentCallback(this.id, this.result);

};

entutor.inputs.dropzone.prototype.draw = function () {

    var self = this;

    this.dropzone = $('<span id="task' + this.id + 'dropzone" class="task-dropzone" style="width:' + (this.options.size || '4') + 'em;"></span>');

    if (this.precondition === 'beforeCorrect') {
        this.hide();
    }

// only for touchscreens
    this.dropzone.click(function(){
        if(entutor.currentCounter){
            self.setChild(entutor.currentCounter);
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

entutor.inputs.dropzone.prototype.hide = function () {
    this.dropzone.hide();
};

entutor.inputs.dropzone.prototype.show = function () {
    this.dropzone.show();
};



entutor.inputs.dropzone.prototype.overlap = function (left, top, dLeft, dTop) {
    var offset = this.dropzone.offset();
    var width = this.dropzone.width();
    var height = this.dropzone.height();
    var notContains = (left >= offset.left + width)
            || (left + dLeft <= offset.left)
            || (top >= offset.top + height)
            || (top + dTop <= offset.top);
    if (notContains) {
        return 0;
    }
    var xMin = (left > offset.left) ? left : offset.left;
    var xMax = (left + dLeft > offset.left + width) ? offset.left + width : left + dLeft;

    var yMin = (top > offset.top) ? top : offset.top;
    var yMax = (top + dTop > offset.top + height) ? offset.top + height : top + dLeft;

    return (xMax - xMin) * (yMax - yMin);
};

entutor.inputs.dropzone.prototype.setChild = function (child) {
    if (this.child && this.child.id !== child.id) {
        this.child.counter.animate(
                {left: this.child.counter.attr('data-left') + 'px', top: this.child.counter.attr('data-top') + 'px'},
        "slow",
                "swing"
                );
    }
    this.child = child;
    var offset = this.dropzone.offset();
    this.child.counter.offset({top: offset.top + 1, left: offset.left + 1});
    this.value = this.child.counter.attr('data-value');
    $(document).trigger("task:newinput");
};

entutor.inputs.dropzone.prototype.removeChild = function (child) {
    if (this.child && this.child.id === child.id) {
        this.value = '';
        this.child = false;
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

    this.currenttrack = false;
    
    entutor.jplayers[this.id] = this;
};

entutor.inputs.playlist.prototype.test = function (testFinishedCallback) {
    testFinishedCallback(this.id, {
        status: entutor.task.status.received,
        score: 0,
        passed: true,
        maxScore: 0
    });
};

entutor.inputs.playlist.prototype.draw = function () {
    var self = this;

    this.domElement = $('<span id="task' + this.id + '" class="task-playlist ' + this.classes + '"></span>');

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

    html += "<script type=\"application/javascript\">\n";
    html += "    (function(){\n";
    html += "        $('#jquery_jplayer_" + this.id + "').jPlayer({\n";
    html += "            ready: function () {  },\n";
    html += "            swfPath: '" + this.swfPath + "',\n";
    html += "            supplied: '" + this.supplied + "',\n";
    html += "            cssSelectorAncestor: '#jp_container_" + this.id + "',\n";
    html += "            wmode: \"window\",\n";
    html += "            useStateClassSkin: true,\n";
    html += "            autoBlur: false,\n";
    html += "            smoothPlayBar: true,\n";
    html += "            keyEnabled: true,\n";
    html += "            remainingDuration: true,\n";
    html += "            toggleDuration: true,\n";
    html += "            errorAlerts: false,\n";
    html += "            warningAlerts: false,\n";
    html += "            consoleAlerts: false,\n";
    html += "            volume:1,\n";
    html += "            ended:function(){  $('.playlist_button').attr('value','" + this.labels.paused + "');}\n";
    html += "        });\n";
    html += "    })()\n";
    html += "</script>";

    this.domElement.append($(html));

    var playlistBlock = $('<div id="playlist_' + this.id + '"></div>');
    this.domElement.append(playlistBlock);

    var item;
    for (var i = 0; i < this.playlist.length; i++) {
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

entutor.inputs.playlist.prototype.hide = function () {
    this.domElement.hide();
};

entutor.inputs.playlist.prototype.show = function () {
    this.domElement.show();
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
    this.type = 'playlist';
    this.parent = parent;
    this.options = options || {};
    this.id = this.parent.id + '_' + (this.options.id || (++entutor.guid));
    this.classes = this.options.classes || '';
    this.precondition = this.options.precondition || 'none';
    this.swfPath = this.options.swfPath || entutor.config.swfPath;
    this.supplied = this.options.supplied || "mp3,oga,wav";

    this.media = options.media || {};

    this.slides = this.options.slides || [];
    this.presentationCurrentSlide=false;

    this.currenttrack = false;
    
    this.passed=false;
    this.maxScore=1;
    
    entutor.jplayers[this.id] = this;
};

entutor.inputs.slideshow.prototype.test = function (testFinishedCallback) {
    var result={
        status: entutor.task.status.received,
        score: this.passed?1:0,
        passed: this.passed,
        maxScore: 1
    };
    testFinishedCallback(this.id, result);
};

entutor.inputs.slideshow.prototype.draw = function () {
    var self = this;

    this.domElement = $('<span id="task' + this.id + '" class="task-playlist ' + this.classes + '"></span>');

    var html = "";

    html+='<div id="taskPresentationText'+this.id+'" class="taskPresentationText"></div>';
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

    html += "<script type=\"application/javascript\">\n";
    html += "    (function(){\n";
    html += "        $('#jquery_jplayer_" + this.id + "').jPlayer({\n";
    html += "            ready: function () { $(this).jPlayer(\"setMedia\", "+JSON.stringify(this.media)+" ); },\n";
    html += "            timeupdate: entutor.jplayers['" + this.id + "'].timeupdate,\n";
    html += "            swfPath: '" + this.swfPath + "',\n";
    html += "            supplied: '" + this.supplied + "',\n";
    html += "            cssSelectorAncestor: '#jp_container_" + this.id + "',\n";
    html += "            wmode: \"window\",\n";
    html += "            useStateClassSkin: true,\n";
    html += "            autoBlur: false,\n";
    html += "            smoothPlayBar: true,\n";
    html += "            keyEnabled: true,\n";
    html += "            remainingDuration: true,\n";
    html += "            toggleDuration: true,\n";
    html += "            errorAlerts: false,\n";
    html += "            warningAlerts: false,\n";
    html += "            consoleAlerts: false,\n";
    html += "            volume:1,\n";
    html += "            ended:function(){  entutor.jplayers['" + this.id + "'].passed=true;}\n";
    html += "        });\n";
    html += "    })()\n";
    html += "</script>";


    this.domElement.append($(html));







    
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
  	    $('#taskPresentationText'+this.id).empty();
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
    }

    return this.domElement;
};

entutor.inputs.slideshow.prototype.getValue = function () {
    return null;
};

entutor.inputs.slideshow.prototype.getMaxScore = function () {
    return this.maxScore;
};

entutor.inputs.slideshow.prototype.hide = function () {
    this.domElement.hide();
};

entutor.inputs.slideshow.prototype.show = function () {
    this.domElement.show();
};


















// =============================================================================
// recorder configuration
//
entutor.recorderApp = {};
entutor.recorderApp.RECORDER_APP_ID = "recorderApp";
entutor.recorderApp.appWidth = 24;
entutor.recorderApp.appHeight = 24;
entutor.recorderApp.uploadFieldName = "upload_file";
entutor.recorderApp.swf = "./voiceinput2/recorder.swf";
entutor.recorderApp.receiver = './voiceinput2/upload.php';
entutor.recorderApp.iconRecord = '../../task/img/record.php';
entutor.recorderApp.iconStop = '../../task/img/stop.php';
entutor.recorderApp.salt='';


entutor.recorderApp.currentRecorderId = "01";
entutor.recorderApp.currentRecorderLevel = false;
entutor.recorderApp.currentRecorderText = false;
entutor.recorderApp.audioid='audio';
// =======================================================
// microphone settings
entutor.recorderApp.maxRecordTime = 30000;
entutor.recorderApp.silenceTimeout = 4000;
entutor.recorderApp.silenceLevel = 10; // 0 ... 100

// rate - at which the microphone captures sound, in kHz. default is 22. 
// Currently we only support 44 and 22.
// var rate= 44; // 44,100 Hz
// var rate= 22; // 22,050 Hz
// var rate= 11; // 11,025 Hz
// var rate= 8 ; //  8,000 Hz
// var rate= 5 ; //  5,512 Hz
entutor.recorderApp.rate = 22;



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
    
    FWRecorder.record(entutor.recorderApp.audioid, entutor.recorderApp.audioid+'.wav');
    if(FWRecorder.isReady){
        FWRecorder.observeLevel();
        recorder.find('.recorder-stop').removeClass('hide');
        recorder.find('.recorder-start').addClass('hide');
        entutor.recorderApp.stopRecordingTimeout = setTimeout(function () {
            entutor.recorderApp.stopRecordingTimeout = false;
            FWRecorder.stopRecording(entutor.recorderApp.audioid);
        }, entutor.recorderApp.maxRecordTime);
    }

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
            FWRecorder.record(entutor.recorderApp.audioid, entutor.recorderApp.audioid+'.wav');
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

            with(entutor.recorders[entutor.recorderApp.currentRecorderId]){
                value=FWRecorder.getBase64();
                result.status = entutor.task.status.waiting;
                result.score = 0;
                result.passed = 'undefined';
                result.maxScore = maxScore;
                result.details = false;
            }
        
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




function utf8_encode(argString) {
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
}

function md5(str) {
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

  var rotateLeft = function(lValue, iShiftBits) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  };

  var addUnsigned = function(lX, lY) {
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

  var _F = function(x, y, z) {
    return (x & y) | ((~x) & z);
  };
  var _G = function(x, y, z) {
    return (x & z) | (y & (~z));
  };
  var _H = function(x, y, z) {
    return (x ^ y ^ z);
  };
  var _I = function(x, y, z) {
    return (y ^ (x | (~z)));
  };

  var _FF = function(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(_F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };

  var _GG = function(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(_G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };

  var _HH = function(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(_H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };

  var _II = function(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(_I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };

  var convertToWordArray = function(str) {
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

  var wordToHex = function(lValue) {
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
}








// =============================================================================
//
//    options={
//        type:'recorder',
//        classes:''
//        maxScore:1
//        precondition:'none|beforeCorrect'
//        text:''
//     }
// 
entutor.inputs.recorder = function (parent, options) {
    // console.log(options);
    this.parent = parent;
    this.type = 'recorder';
    this.options = options || {};
    
    this.id = this.parent.id + '_' + (this.options.id || (++entutor.guid));
    this.classes = this.options.classes || '';
    this.maxScore = (typeof (this.options.maxScore) !== 'undefined') ? this.options.maxScore : 1;
    this.precondition = this.options.precondition || 'none';
    this.text = this.options.text || '';

    this.result = null;
    this.value = false;

    //this.id
    entutor.recorders[this.id] = this;
    // console.log(this);
};

entutor.inputs.recorder.prototype.showSuccess = function () {
    this.domElement.removeClass('task-recorder-error').addClass('task-recorder-correct');
};

entutor.inputs.recorder.prototype.showError = function () {
    this.domElement.removeClass('task-recorder-correct').addClass('task-recorder-error');
};

entutor.inputs.recorder.prototype.removeFeedback = function () {
    this.domElement.removeClass('task-recorder-correct').removeClass('task-recorder-error');
};

entutor.inputs.recorder.prototype.test = function (parentCallback) {

    // don't post if sound was not saved
    if(!this.value){
        this.result = {
            status: entutor.task.status.waiting,
            score: 0,
            passed: 'undefined',
            maxScore: this.maxScore,
            details: false
        };
        parentCallback(this.id, this.result);
        return;
    }

    // don't post the same sound again
    if( this.result && this.result.details && this.result.details ){
        parentCallback(this.id, this.result);
        return;
    }
    
    var self=this;
    
    self.result = {
        status: entutor.task.status.waiting,
        score: 0,
        passed: 'undefined',
        maxScore: this.maxScore
    };
    

    
    var today = new Date();
    var toDatetime = new Date(today);
    toDatetime.setDate(today.getMinutes()+10);
    
    
    var ye=toDatetime.getFullYear();
    var mo=toDatetime.getMonth();
    var da=toDatetime.getDay();
    var ho=toDatetime.getHours();
    var mi=toDatetime.getMinutes();
    var toDatetimeString = ye + '-' 
            + (mo<10?'0':'') + mo + '-'
            + (da<10?'0':'') + da + ' '
            + (ho<10?'0':'') + ho + ':'
            + (mi<10?'0':'') + mi;
    var token = md5(toDatetimeString +';'+ entutor.recorderApp.salt);
    
    
    var formData = {
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
            } else if (self.result.passed === false) {
                self.showError();
            }
        }
        parentCallback(self.id, self.result);
    });

};

entutor.inputs.recorder.prototype.draw = function () {

    var self = this;

    this.domElement = $('<span id="task' + this.id + 'recorder" class="task-recorder" style="width:' + (this.options.size || '4') + 'em;"></span>');

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

entutor.inputs.recorder.prototype.getValue = function () {
    return this.value;
};

entutor.inputs.recorder.prototype.getMaxScore = function () {
    return this.maxScore;
};

entutor.inputs.recorder.prototype.hide = function () {
    this.domElement.hide();
};

entutor.inputs.recorder.prototype.show = function () {
    this.domElement.show();
};


