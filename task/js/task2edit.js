// todo:
//    this.autocheck=this.options.autocheck||false;
//    task      card        text        radio
//    checkbox  dropzone    recorder
//    
// TODO: запрограммировать предварительный просмотр в редакторе


if (typeof (entutor) === 'undefined') {
    var entutor = {};
}
entutor.editors = {};

entutor.loadEditor = function (jsonURL, containerSelector) {
    $.ajax({
        type: 'GET', // define the type of HTTP verb we want to use (POST for our form)
        url: jsonURL, // the url where we want to POST
        dataType: 'json', // what type of data do we expect back from the server
        encode: true,
        error: function( jqXHR, textStatus, errorThrown ){
            console.log(errorThrown);
        }
    }).done(function (json) {
        entutor.currentEditor = new entutor.editor(json);
        $(containerSelector).empty().append(entutor.currentEditor.draw());
        // window.location.hash = json.id;
    });
};


entutor.editor = function (value) {

    var self = this;

    this.value = value || {};

    this.id = value.id || (++entutor.guid);

    // create presentation
    this.presentation = new entutor.presentationeditor(this, this.value.presentation.innerHtml);


    //    // text messages
    //    if (this.value.text) {
    //        for (var msgId in this.text) {
    //            if (this.value.text[msgId]) {
    //                this.text[msgId] = this.value.text[msgId];
    //            }
    //        }
    //    }


    // create inputs
    this.inputs = new entutor.editors.card(this, this.value.inputs);

};

entutor.editor.prototype.draw = function () {
    var self=this;
    this.container = $("<div class=\"editor-container\"></div>");
    this.toolbar = $('<div class="editor-toolbar">task #' + this.id + '</div>');
    this.container.append(this.toolbar);

    this.optionsLink = $('<a class="editor-options-link" href="javascript:void(\'options\')">&Congruent;</a>');
    this.toolbar.prepend(this.optionsLink);
    this.optionsLink.click(function () {
        self.optionBlock.toggle();
    });

    this.optionBlock = $("<div class=\"editor-element-options\"></div>");
    this.optionBlock.hide();
    this.container.append(this.optionBlock);

    this.optionBlock.append(entutor.components.checkbox(this.value, 'autocheck', entutor.i18n['Autocheck']));
    
    this.container.append(this.presentation.draw());
    this.container.append(this.inputs.draw());
    return this.container;
};

entutor.editor.prototype.getValue = function () {
    this.value.presentation = {innerHtml:this.presentation.getValue()};
    this.value.inputs = this.inputs.getValue();
    return this.value;
};



// =============================================================================
entutor.i18n={
    'testbutton': 'Готово',
    'nextbutton': 'Далее',
    'restartbutton': 'Начать задание заново',
    'Presentation':'Presentation',
    'CSS classes':'CSS classes',
    'Arrange subelements':'Arrange subelements',
    'Hint':'Hint',
    'Precondition':'Precondition',
    'Autocheck':'Autocheck',
    'Task Pass Score':'Task Pass Score',
    'Max Score':'Max Score',
    'Hide if Correct':'Hide if Correct',
    'horizontal':'horizontal',
    'vertical':'vertical',
    'flow':'flow',
    'Duration, seconds':'Duration, seconds',
    'Animation Frame':'Animation Frame',
    'type correct answer here':'type correct answer here',
    'Correct value*':'Correct value*',
    'Initial value':'Initial value',
    'Correct values<br>(one per string)':'Correct values<br>(one per string)',
    'Test rule':'Test rule',
    'Width':'Width',
    'Accept multiple counters':'Accept multiple counters',
    'Eject counter on error':'Eject counter on error',
    'Autostart':'Autostart',
    'Require Complete View':'Require Complete View',
    'WEBMV file URL':'WEBMV file URL',
    'OGV file URL':'OGV file URL',
    'M4V file URL':'M4V file URL',
    'Subtitle':'Subtitle',
    'Sound title':'Sound title',
    'MP3 file URL':'MP3 file URL',
    'OGA file URL':'OGA file URL',
    'WAV file URL':'WAV file URL',
    'Slide':'Slide',
    'From time':'From time',
    'To time':'To time',
    'Min score to pass (0 ... 1)':'Min score to pass (0 ... 1)',
    'beforeCorrect':'beforeCorrect',
    'Maximal length':'Maximal length',
    'Reset if Error':'Reset if Error',
    'type checkbox label here':'type checkbox label here',
    'type visible text here':'type visible text here',
    'Value provided to dropzone':'Value provided to dropzone',
    'testSet':'testSet',
    'testSequence':'testSequence',
    'mp3 file URL':'mp3 file URL',
    'oga file URL':'oga file URL',
    'wav file URL':'wav file URL',
    'm4v file URL':'m4v file URL',
    'ogv file URL':'ogv file URL',
    'webmv file URL':'webmv file URL',
    'Video title':'Video title',
    'Initial seqence':'Initial seqence',
    'card':'card',
    'html':'html',
    'text':'text',
    'radio':'radio',
    'checkbox':'checkbox',
    'counter':'counter',
    'dropzone':'dropzone',
    'sound':'sound',
    'video':'video',
    'playlist':'playlist',
    'slideshow':'slideshow',
    'recorder':'recorder',
    'sequence':'sequence'
};


// =============================================================================
entutor.presentationeditor = function (parent, value) {
    this.parent = parent;
    this.value = value;
};

entutor.presentationeditor.prototype.draw = function () {
    var self = this;
    this.container = $("<div class=\"editor-element-container presentation\"></div>");
    this.container.append('<div class="editor-toolbar">'+entutor.i18n['Presentation']+'</div>');
    this.textarea = $("<textarea class=\"editor-presentation-textarea\"></textarea>");
    this.textarea.val(this.value);
    this.container.append(this.textarea);
    this.textarea.change(function () {
        self.value = self.textarea.val();
        $(document).trigger("editor:updated");
    });
    return this.container;
};

entutor.presentationeditor.prototype.getValue = function () {
    return this.value;
};


// =============================================================================

entutor.components = {};

entutor.components.string = function (value, attr, labelText, callback) {
    var container = $("<div class=\"editor-component-container string\"></div>");

    var label = $("<span class=\"editor-component-label string\"></span>");
    label.html(labelText);
    container.append(label);

    var input = $("<input class=\"editor-component-input string\" type=text>");
    container.append(input);
    input.val(value[attr]);
    if (callback) {
        input.change(function () { value[attr] = input.val();  callback(input.val());  $(document).trigger("editor:updated"); });
    } else {
        input.change(function () { value[attr] = input.val();   $(document).trigger("editor:updated");  });
    }

    return container;
};

entutor.components.float = function (value, attr, labelText, callback) {
    var container = $("<div class=\"editor-component-container number\"></div>");

    var label = $("<span class=\"editor-component-label number\"></span>");
    label.html(labelText);
    container.append(label);

    var input = $("<input class=\"editor-component-input number\" type=text>");
    container.append(input);
    input.val(value[attr]);
    if (callback) {
        input.change(function () { var v=parseFloat(input.val()); if(isNaN(v)){alert('Number required');} value[attr] = v;  callback(input.val());  $(document).trigger("editor:updated"); });
    } else {
        input.change(function () { var v=parseFloat(input.val()); if(isNaN(v)){alert('Number required');} value[attr] = v;   $(document).trigger("editor:updated");  });
    }

    return container;
};

entutor.components.integer = function (value, attr, labelText, callback) {
    var container = $("<div class=\"editor-component-container number\"></div>");

    var label = $("<span class=\"editor-component-label number\"></span>");
    label.html(labelText);
    container.append(label);

    var input = $("<input class=\"editor-component-input number\" type=text>");
    container.append(input);
    input.val(value[attr]);
    if (callback) {
        input.change(function () { var v=parseInt(input.val()); if(isNaN(v)){alert('Number required');} value[attr] = v;  callback(input.val());  $(document).trigger("editor:updated"); });
    } else {
        input.change(function () { var v=parseInt(input.val()); if(isNaN(v)){alert('Number required');} value[attr] = v;   $(document).trigger("editor:updated");  });
    }

    return container;
};

entutor.components.select = function (value, attr, labelText, options, callback) {
    var container = $("<div class=\"editor-component-container string\"></div>");

    var label = $("<span class=\"editor-component-label string\"></span>");
    label.html(labelText);
    container.append(label);

    var input = $("<select class=\"editor-component-input select\"></select>");
    container.append(input);
    for (var vl in options) {
        input.append($('<option value="' + vl + '">' + options[vl] + '</option>'));
    }

    input.val(value[attr]);
    if (callback) {
        input.change(function () { value[attr] = input.val(); callback(input.val()); $(document).trigger("editor:updated"); });
    } else {
        input.change(function () { value[attr] = input.val(); $(document).trigger("editor:updated"); });
    }
    return container;
};

entutor.components.text = function (value, attr, labelText, callback) {

    var container = $("<div class=\"editor-component-container string\"></div>");

    var label = $("<span class=\"editor-component-label string\"></span>");
    label.html(labelText);
    container.append(label);


    var input = $("<textarea class=\"editor-component-input text\"></textarea>");
    container.append(input);
    input.val(value[attr]);
    if (callback) {
        input.change(function () { value[attr] = input.val();  callback(input.val());  $(document).trigger("editor:updated"); });
    } else {
        input.change(function () { value[attr] = input.val();   $(document).trigger("editor:updated");  });
    }
    return container;
};

entutor.components.checkbox = function (value, attr, labelText, callback) {
    var container = $("<div class=\"editor-component-container checkbox\"></div>");

    var input = $("<input class=\"editor-component-input checkbox\" type=\"checkbox\">");
    
    var label = $("<span class=\"editor-component-label checkbox\"></span>");
    label.append(input);
    label.append(labelText);
    container.append(label);

    input.prop( "checked", value[attr] );
    // input.val(value[attr]);
    if (callback) {
        input.change(function () { value[attr] = input.prop("checked");  callback(input.val());  $(document).trigger("editor:updated"); });
    } else {
        input.change(function () { value[attr] = input.prop("checked");   $(document).trigger("editor:updated");  });
    }

    return container;
};

// =============================================================================

$(document).click(function(ev){
    var tgt=$(ev.target);
    var L1=tgt.parents('.editor-element-options').length;
    var L2=tgt.parents('.editor-options-link').length;
    var L3=tgt.hasClass('editor-options-link');
    if( L1>0 || L2>0 || L3){
        return;
    }
    $('.editor-element-options').hide();
});

// =============================================================================
//    value={
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
entutor.editors.card = function (parent, value) {
    this.type = 'card';
    this.parent = parent;

    this.value = value || {};
    this.id = this.parent.id + '_' + (this.value.id || (++entutor.guid));


    this.value.classes = this.value.classes || '';
    this.value.arrange = this.value.arrange || 'vertical';
    this.value.taskPassScore = this.value.taskPassScore || 1;
    this.value.precondition = this.value.precondition || 'none';
    this.value.customtest = this.value.customtest || '';
    this.value.maxScore = (typeof (this.value.maxScore) !== 'undefined') ? this.value.maxScore : 1;

    this.value.hideOnCorrect = this.value.hideOnCorrect? true :false;
    this.value.children = this.value.children || [];


    // create child elements
    this.children = [];

    for (var key = 0; key < this.value.children.length; key++) {
        var child = this.value.children[key];
        if (typeof (entutor.editors[child.type]) === 'function') {
            var constructor = entutor.editors[child.type];
            var childObject = new constructor(this, child);
            this.children.push(childObject);
        }
    }

};

entutor.editors.card.prototype.draw = function () {
    // console.log('entutor.editors.card.prototype.draw ' + this.id);
    var self = this;
    this.container = $("<div class=\"editor-element-container " + this.type + "\"></div>");
    this.toolbar = $('<div class="editor-toolbar">card #' + this.id + '</div>');
    this.container.append(this.toolbar);

    this.optionsLink = $('<a class="editor-options-link" href="javascript:void(\'options\')">&Congruent;</a>');
    this.toolbar.prepend(this.optionsLink);
    this.optionsLink.click(function () {
        self.optionBlock.toggle();
    });

    this.optionBlock = $("<div class=\"editor-element-options\"></div>");
    this.optionBlock.hide();
    this.container.append(this.optionBlock);

    this.optionBlock.append(entutor.components.string(this.value, 'classes', entutor.i18n['CSS classes']));
    this.optionBlock.append(entutor.components.select(this.value, 'arrange', entutor.i18n['Arrange subelements'], {'horizontal': entutor.i18n['horizontal'], 'vertical': entutor.i18n['vertical'],'flow':entutor.i18n['flow']} , function(value){self.childContainer.removeClass('flow').removeClass('vertical').removeClass('horizontal').addClass(value);}));
    this.optionBlock.append(entutor.components.string(this.value, 'taskPassScore', entutor.i18n['Task Pass Score']));
    this.optionBlock.append(entutor.components.select(this.value, 'precondition', entutor.i18n['Precondition'], {'none': entutor.i18n['none'], 'beforeCorrect': entutor.i18n['beforeCorrect']} /*, callback */));
    this.optionBlock.append(entutor.components.string(this.value, 'maxScore', entutor.i18n['Max Score']));
    this.optionBlock.append(entutor.components.checkbox(this.value, 'autocheck', entutor.i18n['Autocheck']));
    this.optionBlock.append(entutor.components.checkbox(this.value, 'hideOnCorrect', entutor.i18n['Hide if Correct']));




    this.addLink = $('<a class="editor-options-link" href="javascript:void(\'+\')">+</a>');
    this.toolbar.prepend(this.addLink);
    this.addLink.click(function () {
        self.addChildBlock.toggle();
    });
    this.addChildBlock = $("<div class=\"editor-element-options\"></div>");
    this.addChildBlock.hide();
    this.container.append(this.addChildBlock);
    for(var ctp in entutor.editors){
        var lnk=$('<a href="javascript:void(\'add_'+ctp+'\')" class="addChildLink" data-type="'+ctp+'">'+entutor.i18n[ctp]+'</a>');
        this.addChildBlock.append(lnk);
        lnk.click(function(){
            var ctp=$(this).attr('data-type');
            self.addChild(ctp);
        });
    }

    self.addChild=function(type){
        if (typeof (entutor.editors[type]) === 'function') {
            var constructor = entutor.editors[type];
            var childObject = new constructor(self, {type:type});
            self.children.push(childObject);

            var i=self.children.length-1;
            var childDomElement = self.children[i].draw();
            self.childContainer.append(childDomElement);

            self.children[i].delLink=$('<a class="editor-options-link" href="javascript:void(\'del\')" data-i=\"'+i+'\">&times;</a>');
            self.children[i].delLink.click(function(ev){
                var trg=$(ev.target);
                var j=trg.attr('data-i');
                self.children[j].container.remove();
                self.children.splice(j,1);
                for (var i = 0; i < self.children.length; i++) {
                    self.children[i].delLink.attr('data-i',i);
                    self.children[i].upLink.attr('data-i',i);
                    self.children[i].downLink.attr('data-i',i);
                }
                $(document).trigger("editor:updated");
            });
            self.children[i].toolbar.prepend(self.children[i].delLink);

            self.children[i].upLink=$('<a class="editor-options-link" href="javascript:void(\'up\')" data-i=\"'+i+'\">&Wedge;</a>');
            self.children[i].upLink.click(self.getUpMover);
            self.children[i].toolbar.prepend(self.children[i].upLink);

            self.children[i].downLink=$('<a class="editor-options-link" href="javascript:void(\'down\')" data-i=\"'+i+'\">&Vee;</a>');
            self.children[i].downLink.click(self.getDownMover);
            self.children[i].toolbar.prepend(self.children[i].downLink);

            $(document).trigger("editor:updated");
        }
    };


    this.delChild=function(ev){
        var trg=$(ev.target);
        var j=trg.attr('data-i');
        self.children[j].container.remove();
        self.children.splice(j,1);
        for (var i = 0; i < self.children.length; i++) {
            self.children[i].delLink.attr('data-i',i);
            self.children[i].upLink.attr('data-i',i);
            self.children[i].downLink.attr('data-i',i);
        }
        $(document).trigger("editor:updated");
    };
    
    this.getUpMover=function(ev){
        var tgt=$(ev.target);
        var i=parseInt(tgt.attr('data-i'));
        if(i>0){
            self.children[i].container.after(self.children[i-1].container);
            var tmp=self.children[i-1];
            self.children[i-1]=self.children[i];
            self.children[i]=tmp;
            
            self.children[i].upLink.attr('data-i',i);
            self.children[i-1].upLink.attr('data-i',i-1);
            self.children[i].downLink.attr('data-i',i);
            self.children[i-1].downLink.attr('data-i',i-1);
            
            $(document).trigger("editor:updated");
        }
    };
    this.getDownMover=function(ev){
        var tgt=$(ev.target);
        var i=parseInt(tgt.attr('data-i'));
        if( i < ( self.children.length - 1 )  ){
            self.children[i+1].container.after(self.children[i].container);

            var tmp=self.children[i+1];
            self.children[i+1]=self.children[i];
            self.children[i]=tmp;
            
            self.children[i].upLink.attr('data-i',i);
            self.children[i+1].upLink.attr('data-i',i+1);
            self.children[i].downLink.attr('data-i',i);
            self.children[i+1].downLink.attr('data-i',i+1);
            
            $(document).trigger("editor:updated");
        }
    };

    this.childContainer=$("<div class=\"editor-card-children\"></div>");
    this.childContainer.addClass(this.value.arrange);
    for (var i = 0; i < this.children.length; i++) {

        var childDomElement = this.children[i].draw();
        this.childContainer.append(childDomElement);

        this.children[i].delLink=$('<a class="editor-options-link" href="javascript:void(\'del\')" data-i=\"'+i+'\">&times;</a>');
        this.children[i].delLink.click(this.delChild);
        this.children[i].toolbar.prepend(this.children[i].delLink);

        this.children[i].upLink=$('<a class="editor-options-link" href="javascript:void(\'up\')" data-i=\"'+i+'\">&Wedge;</a>');
        this.children[i].upLink.click(this.getUpMover);
        this.children[i].toolbar.prepend(this.children[i].upLink);

        this.children[i].downLink=$('<a class="editor-options-link" href="javascript:void(\'down\')" data-i=\"'+i+'\">&Vee;</a>');
        this.children[i].downLink.click(this.getDownMover);
        this.children[i].toolbar.prepend(this.children[i].downLink);
    }
    this.container.append(this.childContainer);

    return this.container;
};

entutor.editors.card.prototype.getValue = function () {
    for (var i = 0; i < this.children.length; i++) {
        this.value.children[i] = this.children[i].getValue();
    }
    for(var i = this.children.length; i < this.value.children.length; i++){
        this.value.children.splice(this.children.length,1);
    }
    return this.value;
};





// =============================================================================
entutor.editors.html = function (parent, value) {
    this.type = 'html';
    this.parent = parent;
    this.value = value || {};
    this.id = this.parent.id + '_' + (this.value.id || (++entutor.guid));
    this.value.classes = this.value.classes || '';
    this.value.precondition = this.value.precondition || 'none';
    this.value.hideOnCorrect = this.value.hideOnCorrect? true :false;
    this.value.duration = this.value.duration || 0;
    
    if(typeof(this.value.animationFrame)==='undefined'){
        this.value.animationFrame = true;
    }else{
        this.value.animationFrame = this.value.animationFrame? true : false;
    }
    this.maxScore = 1;
};

entutor.editors.html.prototype.draw = function () {
    // console.log('entutor.editors.card.prototype.draw ' + this.id);
    var self = this;
    this.container = $("<div class=\"editor-element-container " + this.type + "\"></div>");
    this.toolbar = $('<div class="editor-toolbar">' + this.type +' #' + this.id + '</div>');
    this.container.append(this.toolbar);

    this.optionsLink = $('<a class="editor-options-link" href="javascript:void(\'options\')">&Congruent;</a>');
    this.toolbar.prepend(this.optionsLink);
    this.optionsLink.click(function () {
        self.optionBlock.toggle();
    });

    this.optionBlock = $("<div class=\"editor-element-options\"></div>");
    this.optionBlock.hide();
    this.container.append(this.optionBlock);

    this.optionBlock.append(entutor.components.string(this.value, 'classes', entutor.i18n['CSS classes']));
    this.optionBlock.append(entutor.components.select(this.value, 'precondition', entutor.i18n['Precondition'], {'none': entutor.i18n['none'], 'beforeCorrect': entutor.i18n['beforeCorrect']} /*, callback */));
    this.optionBlock.append(entutor.components.string(this.value, 'duration', entutor.i18n['Duration, seconds']));
    this.optionBlock.append(entutor.components.checkbox(this.value, 'hideOnCorrect', entutor.i18n['Hide if Correct']));
    this.optionBlock.append(entutor.components.checkbox(this.value, 'animationFrame', entutor.i18n['Animation Frame']));


    
    // add textarea
    var input = $("<textarea class=\"editor-html-content\"></textarea>");
    this.container.append(input);
    input.val(this.value.innerHtml);
    input.change(function () { self.value.innerHtml= input.val();   $(document).trigger("editor:updated");  });

    return this.container;
};

entutor.editors.html.prototype.getValue = function () {
    return this.value;
};



// =============================================================================
entutor.editors.text = function (parent, value) {
    this.type = 'text';
    this.parent = parent;
    this.value = value || {};

    this.id = this.parent.id + '_' + (this.value.id || (++entutor.guid));

    this.maxScore = 1;

    this.value.classes = this.value.classes || '';
    this.value.precondition = this.value.precondition || 'none';
    this.value.hideOnCorrect = this.value.hideOnCorrect? true :false;
    this.value.pattern = this.value.pattern || entutor.i18n['type correct answer here'];
    this.value.value = this.value.value || '';
    this.value.size = this.value.size || '5';
};

entutor.editors.text.prototype.draw = function () {
    // console.log('entutor.editors.card.prototype.draw ' + this.id);
    var self = this;
    this.container = $("<div class=\"editor-element-container " + this.type + "\"></div>");
    this.toolbar = $('<div class="editor-toolbar">' + this.type + ' #' + this.id + '</div>');
    this.container.append(this.toolbar);

    this.optionsLink = $('<a class="editor-options-link" href="javascript:void(\'options\')">&Congruent;</a>');
    this.toolbar.prepend(this.optionsLink);
    this.optionsLink.click(function () {
        self.optionBlock.toggle();
    });

    this.optionBlock = $("<div class=\"editor-element-options\"></div>");
    this.optionBlock.hide();
    this.container.append(this.optionBlock);

    this.optionBlock.append(entutor.components.string(this.value, 'pattern', entutor.i18n['Correct value*'],function(value){self.input.val(value);}));
    this.optionBlock.append(entutor.components.string(this.value, 'value', entutor.i18n['Initial value']));
    this.optionBlock.append(entutor.components.string(this.value, 'hint', entutor.i18n['Hint']));
    this.optionBlock.append(entutor.components.integer(this.value, 'maxlength', entutor.i18n['Maximal length']));
    this.optionBlock.append(entutor.components.checkbox(this.value, 'autocheck', entutor.i18n['Autocheck']));
    this.optionBlock.append(entutor.components.checkbox(this.value, 'hideOnCorrect', entutor.i18n['Hide if Correct']));
    this.optionBlock.append(entutor.components.checkbox(this.value, 'resetOnError', entutor.i18n['Reset if Error']));
    
    
    
    this.optionBlock.append(entutor.components.integer(this.value, 'size', entutor.i18n['Width'],function(value){self.input.attr('size',value);}));
    this.optionBlock.append(entutor.components.string(this.value, 'classes', entutor.i18n['CSS classes']));
    this.optionBlock.append(entutor.components.select(this.value, 'precondition', entutor.i18n['Precondition'], {'none': entutor.i18n['none'], 'beforeCorrect': entutor.i18n['beforeCorrect']} /*, callback */));

    // add text field
    this.input = $("<input type=text class=\"editor-html-content\" size=\""+this.value.size+"\" disabled=\"true\">");
    this.container.append(this.input);
    this.input.val(this.value.pattern);
    this.input.change(function () { self.value.pattern= self.input.val();   $(document).trigger("editor:updated");  });

    return this.container;
};

entutor.editors.text.prototype.getValue = function () {
    return this.value;
};








// =============================================================================
entutor.editors.radio = function (parent, value) {
    this.type = 'radio';
    this.parent = parent;
    this.value = value || {};

    this.id = this.parent.id + '_' + (this.value.id || (++entutor.guid));

    this.maxScore = 1;

    this.value.classes = this.value.classes || '';
    this.value.precondition = this.value.precondition || 'none';
    this.value.hideOnCorrect = this.value.hideOnCorrect? true :false;

    this.value.correctVariant = this.value.correctVariant || '';


    this.value.size = this.value.size || '5';
    this.value.arrange = this.value.arrange || 'vertical';

    this.newkey=function(){
        var k=0;
        do{
            k++;
            var unique=true;
            for (var key in this.value.variant) {
                if(key==k){
                    unique=false;
                }
            }
        }while(!unique);
        return k;
    };
};

entutor.editors.radio.prototype.draw = function () {
    // console.log('entutor.editors.card.prototype.draw ' + this.id);
    var self = this;
    this.container = $("<div class=\"editor-element-container " + this.type + "\"></div>");
    this.toolbar = $('<div class="editor-toolbar">' + this.type + ' #' + this.id + '</div>');
    this.container.append(this.toolbar);

    this.optionsLink = $('<a class="editor-options-link" href="javascript:void(\'options\')">&Congruent;</a>');
    this.toolbar.prepend(this.optionsLink);
    this.optionsLink.click(function () {
        self.optionBlock.toggle();
    });

    this.optionBlock = $("<div class=\"editor-element-options\"></div>");
    this.optionBlock.hide();
    this.container.append(this.optionBlock);



    this.value.arrange = this.value.arrange || 'vertical';

    this.optionBlock.append(entutor.components.select(this.value, 'arrange', entutor.i18n['Arrange subelements'], {'horizontal': entutor.i18n['horizontal'], 'vertical': entutor.i18n['vertical'],'flow':entutor.i18n['flow']} , function(value){self.variantContainer.removeClass('flow').removeClass('vertical').removeClass('horizontal').addClass(value);}));
    this.optionBlock.append(entutor.components.string(this.value, 'classes', entutor.i18n['CSS classes']));
    this.optionBlock.append(entutor.components.string(this.value, 'hint', entutor.i18n['Hint']));
    this.optionBlock.append(entutor.components.select(this.value, 'precondition', entutor.i18n['Precondition'], {'none': entutor.i18n['none'], 'beforeCorrect': entutor.i18n['beforeCorrect']} /*, callback */));
    this.optionBlock.append(entutor.components.checkbox(this.value, 'autocheck', entutor.i18n['Autocheck']));
    this.optionBlock.append(entutor.components.checkbox(this.value, 'hideOnCorrect', entutor.i18n['Hide if Correct']));

    this.addLink = $('<a class="editor-options-link" href="javascript:void(\'+variant\')">+</a>');
    this.toolbar.prepend(this.addLink);
    this.addLink.click(function () {
        self.addVariant(self.newkey(),'');
        $(document).trigger("editor:updated");
    });


    this.delVariant=function(key){
        for(var i=0; i<self.variant.length; i++){
            if( self.variant[i].key === key ){
               self.variantContainer.find('.label[data-id="'+key+'"]').remove();
               self.variant.splice(i,1); 
               $(document).trigger("editor:updated");
               return;
            }
        }
    };

    this.addVariant=function(key,value){
        var self=this;
        this.variant.push({key:key, value:value});
        var label=$('<span class="label" data-id="' + key + '"></class>');
        this.variantContainer.append(label);

        var delRowLink=$('<a class="delete-link" href="javascript:void(\'del'+key+'\')">&times;</a>');
        delRowLink.click(function(){
            self.delVariant(key);
        });
        label.append(delRowLink);
      
        var radio=$('<input type="radio" name="task' + this.id + 'radio" value="' + key + '" data-id="' + key + '">');
        radio.click(function(){
            self.value.correctVariant=$(this).attr('value');
            $(document).trigger('editor:updated')
        });
        label.append(radio);
        if(this.value.correctVariant===radio.attr('value')){
            radio.prop('checked',true);
        }
        
        
        var keyinput=$('<input type="text" size="2" value="' + key + '">');
        label.append(keyinput);
        keyinput.change(function(ev){
            var newKey=$(ev.target).val();
            for(var i=0; i<self.variant.length; i++){
                if( self.variant[i].key === key ){
                   self.variant[i].key=newKey; 
                   $(document).trigger('editor:updated')
                   return;
                }
            }
        });

        //var valueinput=$('<input type="text" size="17" value="' + value + '">');
        var valueinput=$('<textarea rows="3"></textarea>');
        valueinput.val(value);
        label.append(valueinput);
        valueinput.change(function(ev){
            var newValue=$(ev.target).val();
            for(var i=0; i<self.variant.length; i++){
                if( self.variant[i].key === key ){
                   self.variant[i].value=newValue; 
                   $(document).trigger('editor:updated')
                   return;
                }
            }
        });
        
    };

    this.variant=[];
    this.variantContainer=$('<span class="editor-radio-variants ' + this.value.arrange + '"></span>');
    for (var k in this.value.variant) {
        this.addVariant(k, this.value.variant[k]);
    }
    this.container.append(this.variantContainer);

    return this.container;
};

entutor.editors.radio.prototype.getValue = function () {
    this.value.variant={};
    for(var i=0; i<this.variant.length; i++){
        this.value.variant[this.variant[i].key]=this.variant[i].value;
    }
    return this.value;
};


















// =============================================================================
entutor.editors.checkbox = function (parent, value) {
    this.type = 'checkbox';
    this.parent = parent;
    this.value = value || {};

    this.id = this.parent.id + '_' + (this.value.id || (++entutor.guid));

    this.maxScore = 1;

    this.value.classes = this.value.classes || '';
    this.value.precondition = this.value.precondition || 'none';
    this.value.hideOnCorrect = this.value.hideOnCorrect? true :false;

    this.value.label = this.value.label || entutor.i18n['type checkbox label here'];
    this.value.correctVariant = this.value.correctVariant || true;

};

entutor.editors.checkbox.prototype.draw = function () {
    // console.log('entutor.editors.card.prototype.draw ' + this.id);
    var self = this;
    this.container = $("<div class=\"editor-element-container " + this.type + "\"></div>");
    this.toolbar = $('<div class="editor-toolbar">' + this.type + ' #' + this.id + '</div>');
    this.container.append(this.toolbar);

    this.optionsLink = $('<a class="editor-options-link" href="javascript:void(\'options\')">&Congruent;</a>');
    this.toolbar.prepend(this.optionsLink);
    this.optionsLink.click(function () {
        self.optionBlock.toggle();
    });

    this.optionBlock = $("<div class=\"editor-element-options\"></div>");
    this.optionBlock.hide();
    this.container.append(this.optionBlock);

    this.optionBlock.append(entutor.components.string(this.value, 'classes', entutor.i18n['CSS classes']));
    this.optionBlock.append(entutor.components.select(this.value, 'precondition', entutor.i18n['Precondition'], {'none': entutor.i18n['none'], 'beforeCorrect': entutor.i18n['beforeCorrect']} /*, callback */));
    this.optionBlock.append(entutor.components.string(this.value, 'hint', entutor.i18n['Hint']));
    this.optionBlock.append(entutor.components.checkbox(this.value, 'autocheck', entutor.i18n['Autocheck']));
    this.optionBlock.append(entutor.components.checkbox(this.value, 'hideOnCorrect', entutor.i18n['Hide if Correct']));

    // add checkbox field with label
    this.checkbox = $("<input type=checkbox>");
    this.checkbox.prop("checked",this.value.correctVariant);
    this.checkbox.change(function () { self.value.correctVariant= self.checkbox.prop("checked");   $(document).trigger("editor:updated");  });
    this.container.append(this.checkbox);
    
    this.input = $("<input type=text size=\"16\">");
    this.input.val(this.value.label);
    this.input.change(function () { self.value.label= self.input.val();   $(document).trigger("editor:updated");  });
    this.container.append(this.input);

    return this.container;
};

entutor.editors.checkbox.prototype.getValue = function () {
    return this.value;
};













// =============================================================================
entutor.editors.counter = function (parent, value) {
    this.type = 'counter';
    this.parent = parent;
    this.value = value || {};

    this.id = this.parent.id + '_' + (this.value.id || (++entutor.guid));

    this.maxScore = 1;

    this.value.classes = this.value.classes || '';
    this.value.precondition = this.value.precondition || 'none';

    this.value.innerHtml = this.value.innerHtml || entutor.i18n['type visible text here'];
    this.value.value = this.value.value || '';

};

entutor.editors.counter.prototype.draw = function () {
    // console.log('entutor.editors.card.prototype.draw ' + this.id);
    var self = this;
    this.container = $("<div class=\"editor-element-container " + this.type + "\"></div>");
    this.toolbar = $('<div class="editor-toolbar">' + this.type + ' #' + this.id + '</div>');
    this.container.append(this.toolbar);

    this.optionsLink = $('<a class="editor-options-link" href="javascript:void(\'options\')">&Congruent;</a>');
    this.toolbar.prepend(this.optionsLink);
    this.optionsLink.click(function () {
        self.optionBlock.toggle();
    });

    this.optionBlock = $("<div class=\"editor-element-options\"></div>");
    this.optionBlock.hide();
    this.container.append(this.optionBlock);

    this.optionBlock.append(entutor.components.string(this.value, 'value', entutor.i18n['Value provided to dropzone']));
    this.optionBlock.append(entutor.components.string(this.value, 'classes', entutor.i18n['CSS classes']));
    this.optionBlock.append(entutor.components.select(this.value, 'precondition', entutor.i18n['Precondition'], {'none': entutor.i18n['none'], 'beforeCorrect': entutor.i18n['beforeCorrect']} /*, callback */));
    this.optionBlock.append(entutor.components.checkbox(this.value, 'autocheck', entutor.i18n['Autocheck']));

    // add checkbox field with label
    this.input = $("<input type=text class=\"editor-counter-html\">");
    this.input.val(this.value.innerHtml);
    this.input.change(function () { self.value.innerHtml= self.input.val();   $(document).trigger("editor:updated");  });
    this.container.append(this.input);

    return this.container;
};

entutor.editors.counter.prototype.getValue = function () {
    return this.value;
};












// =============================================================================
entutor.editors.dropzone = function (parent, value) {
    this.type = 'dropzone';
    this.parent = parent;
    this.value = value || {};

    this.id = this.parent.id + '_' + (this.value.id || (++entutor.guid));

    this.maxScore = 1;

    this.value.classes = this.value.classes || '';
    this.value.precondition = this.value.precondition || 'none';
    this.value.test = this.value.test || 'testSet';
    
    
    
    this.value.hideOnCorrect = this.value.hideOnCorrect ? true :false;
    this.value.ejectCounterOnError = this.value.ejectCounterOnError ? true :false;




    this.value.pattern = this.value.pattern || 'type correct answers here';
    this.value.ejectCounterOnError = typeof(this.value.ejectCounterOnError)!=='undefined' ? this.value.ejectCounterOnError : false;
    this.value.size = this.value.size || '5';
};

entutor.editors.dropzone.prototype.draw = function () {
    // console.log('entutor.editors.card.prototype.draw ' + this.id);
    var self = this;
    this.container = $("<div class=\"editor-element-container " + this.type + "\"></div>");
    this.toolbar = $('<div class="editor-toolbar">' + this.type + ' #' + this.id + '</div>');
    this.container.append(this.toolbar);

    this.optionsLink = $('<a class="editor-options-link" href="javascript:void(\'options\')">&Congruent;</a>');
    this.toolbar.prepend(this.optionsLink);
    this.optionsLink.click(function () {
        self.optionBlock.toggle();
    });

    this.optionBlock = $("<div class=\"editor-element-options\"></div>");
    this.optionBlock.hide();
    this.container.append(this.optionBlock);

    this.optionBlock.append(entutor.components.text(this.value, 'pattern', entutor.i18n['Correct values<br>(one per string)'],function(value){self.input.val(value);}));
    this.optionBlock.append(entutor.components.select(this.value, 'test', entutor.i18n['Test rule'], {'testSet': entutor.i18n['testSet'], 'testSequence': entutor.i18n['testSequence']} /*, callback */));
    this.optionBlock.append(entutor.components.string(this.value, 'value', entutor.i18n['Initial value']));
    this.optionBlock.append(entutor.components.string(this.value, 'size', entutor.i18n['Width'],function(value){self.input.attr('size',value);}));
    this.optionBlock.append(entutor.components.string(this.value, 'hint', entutor.i18n['Hint']));
    this.optionBlock.append(entutor.components.string(this.value, 'classes', entutor.i18n['CSS classes']));
    this.optionBlock.append(entutor.components.select(this.value, 'precondition', entutor.i18n['Precondition'], {'none': entutor.i18n['none'], 'beforeCorrect': entutor.i18n['beforeCorrect']} /*, callback */));
    this.optionBlock.append(entutor.components.checkbox(this.value, 'autocheck', entutor.i18n['Autocheck']));
    this.optionBlock.append(entutor.components.checkbox(this.value, 'multiple', entutor.i18n['Accept multiple counters']));
    this.optionBlock.append(entutor.components.checkbox(this.value, 'hideOnCorrect', entutor.i18n['Hide if Correct']));
    this.optionBlock.append(entutor.components.checkbox(this.value, 'ejectCounterOnError', entutor.i18n['Eject counter on error']));



    // add text field
    this.input = $("<textarea class=\"editor-html-content\" disabled=\"true\">");
    this.container.append(this.input);
    this.input.val(this.value.pattern);
    this.input.change(function () { self.value.pattern= self.input.val();   $(document).trigger("editor:updated");  });

    return this.container;
};

entutor.editors.dropzone.prototype.getValue = function () {
    return this.value;
};





// .sound
//    options={
//        type:'sound',
//        id:''
//        classes:''
//        precondition:'none|beforeCorrect'
//        autostart:true|false
//        supplied : "mp3,oga,wav"
//        media:{
//                 title:'Бублички',
//                 mp3:'./playmessage/bublichki.mp3'
//                 oga:
//                 wav:
//          }

// =============================================================================
entutor.editors.sound = function (parent, value) {
    this.type = 'sound';
    this.parent = parent;
    this.value = value || {};

    this.id = this.parent.id + '_' + (this.value.id || (++entutor.guid));

    this.maxScore = 1;

    this.value.classes = this.value.classes || '';
    this.value.precondition = this.value.precondition || 'none';
    this.value.autostart = this.value.autostart || false;
    this.value.completeViewRequired = this.value.completeViewRequired || false;
    this.value.supplied = this.value.supplied || "mp3,oga,wav";
    this.value.hideOnCorrect = this.value.hideOnCorrect? true :false;

    this.value.media = this.value.media || {};
    this.value.media.title=this.value.media.title || '';
    this.value.media.mp3=this.value.media.mp3 || entutor.i18n['mp3 file URL'];
    this.value.media.oga=this.value.media.oga || entutor.i18n['oga file URL'];
    this.value.media.wav=this.value.media.wav || entutor.i18n['wav file URL'];
    
    
};

entutor.editors.sound.prototype.draw = function () {
    // console.log('entutor.editors.card.prototype.draw ' + this.id);
    var self = this;
    this.container = $("<div class=\"editor-element-container " + this.type + "\"></div>");
    this.toolbar = $('<div class="editor-toolbar">' + this.type + ' #' + this.id + '</div>');
    this.container.append(this.toolbar);

    this.optionsLink = $('<a class="editor-options-link" href="javascript:void(\'options\')">&Congruent;</a>');
    this.toolbar.prepend(this.optionsLink);
    this.optionsLink.click(function () { self.optionBlock.toggle(); });

    this.optionBlock = $("<div class=\"editor-element-options\"></div>");
    this.optionBlock.hide();
    this.container.append(this.optionBlock);

    this.optionBlock.append(entutor.components.string(this.value, 'classes', entutor.i18n['CSS classes']));
    this.optionBlock.append(entutor.components.select(this.value, 'precondition', entutor.i18n['Precondition'], {'none': entutor.i18n['none'], 'beforeCorrect': entutor.i18n['beforeCorrect']} /*, callback */));
    this.optionBlock.append(entutor.components.checkbox(this.value, 'autostart', entutor.i18n['Autostart']));
    this.optionBlock.append(entutor.components.checkbox(this.value, 'completeViewRequired', entutor.i18n['Require Complete View']));
    // this.optionBlock.append(entutor.components.checkbox(this.value, 'hideOnCorrect', entutor.i18n['Hide if Correct']));


    // add text field
    this.container.append("<div>"+entutor.i18n['Sound title']+"</div>");
    this.mediaTitleInput = $("<input type=text class=\"editor-html-content\">");
    this.container.append(this.mediaTitleInput);
    this.mediaTitleInput.val(this.value.media.title);
    this.mediaTitleInput.change(function () { self.value.media.title= self.mediaTitleInput.val();   $(document).trigger("editor:updated");  });

    this.container.append("<div>"+entutor.i18n['MP3 file URL']+"</div>");
    this.mediaMP3Input = $("<input type=text class=\"editor-html-content\">");
    this.container.append(this.mediaMP3Input);
    this.mediaMP3Input.val(this.value.media.mp3);
    this.mediaMP3Input.change(function () { self.value.media.mp3= self.mediaMP3Input.val();   $(document).trigger("editor:updated");  });

    this.container.append("<div>"+entutor.i18n['OGA file URL']+"</div>");
    this.mediaOGAInput = $("<input type=text class=\"editor-html-content\">");
    this.container.append(this.mediaOGAInput);
    this.mediaOGAInput.val(this.value.media.oga);
    this.mediaOGAInput.change(function () { self.value.media.oga= self.mediaOGAInput.val();   $(document).trigger("editor:updated");  });

    this.container.append("<div>"+entutor.i18n['WAV file URL']+"</div>");
    this.mediaWAVInput = $("<input type=text class=\"editor-html-content\">");
    this.container.append(this.mediaWAVInput);
    this.mediaWAVInput.val(this.value.media.wav);
    this.mediaWAVInput.change(function () { self.value.media.wav= self.mediaWAVInput.val();   $(document).trigger("editor:updated");  });

    return this.container;
};

entutor.editors.sound.prototype.getValue = function () {
    return this.value;
};







// 
// 
// 
// 
// 
// .video
// =============================================================================
entutor.editors.video = function (parent, value) {
    this.type = 'video';
    this.parent = parent;
    this.value = value || {};

    this.id = this.parent.id + '_' + (this.value.id || (++entutor.guid));

    this.maxScore = 1;

    this.value.classes = this.value.classes || '';
    this.value.precondition = this.value.precondition || 'none';
    this.value.autostart = this.value.autostart || false;
    this.value.supplied = this.value.supplied || "m4v,ogv,webmv";
    this.value.hideOnCorrect = this.value.hideOnCorrect? true :false;
    this.value.completeViewRequired = this.value.completeViewRequired? true :false;



    this.value.media = this.value.media || {};
    this.value.media.title=this.value.media.title || '';
    this.value.media.m4v=this.value.media.m4v || entutor.i18n['m4v file URL'];
    this.value.media.ogv=this.value.media.ogv || entutor.i18n['ogv file URL'];
    this.value.media.wav=this.value.media.webmv || entutor.i18n['webmv file URL'];
    
    this.value.subtitles = this.value.subtitles || [];
    
};

entutor.editors.video.prototype.draw = function () {
    // console.log('entutor.editors.card.prototype.draw ' + this.id);
    var self = this;
    this.container = $("<div class=\"editor-element-container " + this.type + "\"></div>");
    this.toolbar = $('<div class="editor-toolbar">' + this.type + ' #' + this.id + '</div>');
    this.container.append(this.toolbar);

    this.optionsLink = $('<a class="editor-options-link" href="javascript:void(\'options\')">&Congruent;</a>');
    this.toolbar.prepend(this.optionsLink);
    this.optionsLink.click(function () { self.optionBlock.toggle(); });

    this.optionBlock = $("<div class=\"editor-element-options\"></div>");
    this.optionBlock.hide();
    this.container.append(this.optionBlock);

    this.optionBlock.append(entutor.components.string(this.value, 'classes', entutor.i18n['CSS classes']));
    this.optionBlock.append(entutor.components.select(this.value, 'precondition', entutor.i18n['Precondition'], {'none': entutor.i18n['none'], 'beforeCorrect': entutor.i18n['beforeCorrect']} /*, callback */));
    this.optionBlock.append(entutor.components.checkbox(this.value, 'autostart', entutor.i18n['Autostart']));
    this.optionBlock.append(entutor.components.checkbox(this.value, 'hideOnCorrect', entutor.i18n['Hide if Correct']));
    this.optionBlock.append(entutor.components.checkbox(this.value, 'completeViewRequired', entutor.i18n['Require Complete View']));


    // add text field
    //this.container.append("<div class=\"label\">"+entutor.i18n['Video title']+"</div>");
    //this.mediaTitleInput = $("<input type=text class=\"editor-html-content\">");
    //this.container.append(this.mediaTitleInput);
    //this.mediaTitleInput.val(this.value.media.title);
    //this.mediaTitleInput.change(function () { self.value.media.title= self.mediaTitleInput.val();   $(document).trigger("editor:updated");  });

    this.container.append("<div class=\"label\">"+entutor.i18n['WEBMV file URL']+"</div>");
    this.mediaWEBMVInput = $("<input type=text class=\"editor-html-content\">");
    this.container.append(this.mediaWEBMVInput);
    this.mediaWEBMVInput.val(this.value.media.webmv);
    this.mediaWEBMVInput.change(function () { self.value.media.webmv= self.mediaWEBMVInput.val();   $(document).trigger("editor:updated");  });

    this.container.append("<div class=\"label\">"+entutor.i18n['OGV file URL']+"</div>");
    this.mediaOGVInput = $("<input type=text class=\"editor-html-content\">");
    this.container.append(this.mediaOGVInput);
    this.mediaOGVInput.val(this.value.media.ogv);
    this.mediaOGVInput.change(function () { self.value.media.ogv= self.mediaOGVInput.val();   $(document).trigger("editor:updated");  });

    this.container.append("<div class=\"label\">"+entutor.i18n['M4V file URL']+"</div>");
    this.mediaM4VInput = $("<input type=text class=\"editor-html-content\">");
    this.container.append(this.mediaM4VInput);
    this.mediaM4VInput.val(this.value.media.m4v);
    this.mediaM4VInput.change(function () { self.value.media.m4v= self.mediaM4VInput.val();   $(document).trigger("editor:updated");  });




    var deleteSubtitle=function(ev){
        var lnk=$(ev.target);
        var uid=lnk.attr("data-uid");
        for(var i=0; i<self.subtitlesDom.length; i++){
            if(self.subtitlesDom[i].uid === uid){
                self.subtitlesDom[i].container.remove();
                self.subtitlesDom.splice(i, 1);
                self.value.subtitles.splice(i, 1);
                return;
            }
        }
    };

    var updateSubtitleHtml=function(ev){
        var fld=$(ev.target);
        var uid=fld.attr("data-uid");
        for(var i=0; i<self.subtitlesDom.length; i++){
            if(self.subtitlesDom[i].uid === uid){
                self.value.subtitles[i].html=fld.val();
                $(document).trigger("editor:updated");
                return;
            }
        }
    };

    var updateSubtitleFrom=function(ev){
        var fld=$(ev.target);
        var uid=fld.attr("data-uid");
        for(var i=0; i<self.subtitlesDom.length; i++){
            if(self.subtitlesDom[i].uid === uid){
                self.value.subtitles[i].from=fld.val();
                $(document).trigger("editor:updated");
                return;
            }
        }
    };
    
    var updateSlideTo=function(ev){
        var fld=$(ev.target);
        var uid=fld.attr("data-uid");
        for(var i=0; i<self.subtitlesDom.length; i++){
            if(self.subtitlesDom[i].uid === uid){
                self.value.subtitles[i].to=fld.val();
                $(document).trigger("editor:updated");
                return;
            }
        }
    };

    this.subtitlesDom=[];
    var lbl;
    for(var i=0; i<this.value.subtitles.length; i++){
        
        var subtitleData = this.value.subtitles[i];
        
        var subtitleDom={};
        
        subtitleDom.uid="subtitle" + this.id + "_subtitle_" + Math.random();
        
        subtitleDom.container=$("<div class=\"subtitle-item\" id=\"" + subtitleDom.uid + "\"></div>");
        this.container.append(subtitleDom.container);
        
        subtitleDom.toolbar=$("<div class=\"toolbar\"></div>");
        subtitleDom.container.append(subtitleDom.toolbar);
        
        subtitleDom.deleteSlide=$("<a class='delete-link' data-uid=\"" + subtitleDom.uid + "\">&times;</a>");
        subtitleDom.toolbar.append(subtitleDom.deleteSlide);
        subtitleDom.deleteSlide.click(deleteSubtitle);
        
        
        // slideDom.container.append("<div class=\"label\">Slide html</div>");
        subtitleDom.html = $("<textarea class=\"editor-html-content\" data-uid=\"" + subtitleDom.uid + "\"></textarea>");
        subtitleDom.container.append(subtitleDom.html);
        subtitleDom.html.val(subtitleData.html);
        subtitleDom.html.change(updateSubtitleHtml);

        lbl=$("<div class=\"label short\">From time</div>");
        subtitleDom.container.append(lbl);
        subtitleDom.fromInput = $("<input type=text class=\"editor-html-content\" data-uid=\"" + subtitleDom.uid + "\">");
        lbl.append(subtitleDom.fromInput);
        subtitleDom.fromInput.val(subtitleData.from);
        subtitleDom.fromInput.change(updateSubtitleFrom);

        lbl=$("<div class=\"label short\">To time</div>");
        subtitleDom.container.append(lbl);
        subtitleDom.toInput = $("<input type=text class=\"editor-html-content\" data-uid=\"" + subtitleDom.uid + "\">");
        lbl.append(subtitleDom.toInput);
        subtitleDom.toInput.val(subtitleData.to);
        subtitleDom.toInput.change(updateSlideTo);
        
        this.subtitlesDom[i]=subtitleDom;

    }



    this.addLink = $('<a class="editor-options-link" href="javascript:void(\'+variant\')">+</a>');
    this.toolbar.prepend(this.addLink);
    this.addLink.click(function () {
        var subtitleData={ html:'', from:'', to:''};
        var lbl;
        var subtitleDom={};
        
        subtitleDom.uid="subtitle" + this.id + "_subtitle_" + Math.random();
        
        subtitleDom.container=$("<div class=\"subtitle-item\" id=\"" + subtitleDom.uid + "\"></div>");
        self.container.append(subtitleDom.container);
        
        subtitleDom.toolbar=$("<div class=\"toolbar\">"+entutor.i18n['Subtitle']+"</div>");
        subtitleDom.container.append(subtitleDom.toolbar);
        
        subtitleDom.deleteSlide=$("<a class='delete-link' data-uid=\"" + subtitleDom.uid + "\">&times;</a>");
        subtitleDom.toolbar.append(subtitleDom.deleteSlide);
        subtitleDom.deleteSlide.click(deleteSubtitle);
        
        
        // slideDom.container.append("<div class=\"label\">Slide html</div>");
        subtitleDom.html = $("<textarea class=\"editor-html-content\" data-uid=\"" + subtitleDom.uid + "\"></textarea>");
        subtitleDom.container.append(subtitleDom.html);
        subtitleDom.html.val(subtitleData.html);
        subtitleDom.html.change(updateSubtitleHtml);

        lbl=$("<div class=\"label short\">From time</div>");
        subtitleDom.container.append(lbl);
        subtitleDom.fromInput = $("<input type=text class=\"editor-html-content\" data-uid=\"" + subtitleDom.uid + "\">");
        lbl.append(subtitleDom.fromInput);
        subtitleDom.fromInput.val(subtitleData.from);
        subtitleDom.fromInput.change(updateSubtitleFrom);

        lbl=$("<div class=\"label short\">To time</div>");
        subtitleDom.container.append(lbl);
        subtitleDom.toInput = $("<input type=text class=\"editor-html-content\" data-uid=\"" + subtitleDom.uid + "\">");
        lbl.append(subtitleDom.toInput);
        subtitleDom.toInput.val(subtitleData.to);
        subtitleDom.toInput.change(updateSlideTo);
        
        self.value.subtitles.push(subtitleData);
        self.subtitlesDom.push(subtitleDom);
        $(document).trigger("editor:updated");
    });



    return this.container;
};

entutor.editors.video.prototype.getValue = function () {
    return this.value;
};









// =============================================================================
// 
// playlist
//
entutor.editors.playlist = function (parent, value) {
    this.type = 'playlist';
    this.parent = parent;
    this.value = value || {};

    this.id = this.parent.id + '_' + (this.value.id || (++entutor.guid));

    this.maxScore = 1;

    this.value.classes = this.value.classes || '';
    this.value.precondition = this.value.precondition || 'none';
    this.value.supplied = this.value.supplied || "mp3,oga,wav";

    this.value.playlist = this.value.playlist || [];
    if(!$.isArray(this.value.playlist)){
        this.value.playlist = [];
    }
};

entutor.editors.playlist.prototype.draw = function () {
    // console.log('entutor.editors.card.prototype.draw ' + this.id);
    var self = this;
    this.container = $("<div class=\"editor-element-container " + this.type + "\"></div>");
    this.toolbar = $('<div class="editor-toolbar">' + this.type + ' #' + this.id + '</div>');
    this.container.append(this.toolbar);





    this.optionsLink = $('<a class="editor-options-link" href="javascript:void(\'options\')">&Congruent;</a>');
    this.toolbar.prepend(this.optionsLink);
    this.optionsLink.click(function () { self.optionBlock.toggle(); });

    this.optionBlock = $("<div class=\"editor-element-options\"></div>");
    this.optionBlock.hide();
    this.container.append(this.optionBlock);

    this.optionBlock.append(entutor.components.string(this.value, 'classes', entutor.i18n['CSS classes']));
    this.optionBlock.append(entutor.components.select(this.value, 'precondition', entutor.i18n['Precondition'], {'none': entutor.i18n['none'], 'beforeCorrect': entutor.i18n['beforeCorrect']} /*, callback */));
    // this.optionBlock.append(entutor.components.checkbox(this.value, 'autostart', entutor.i18n['Autostart']));


    var deletePlaylistItem=function(ev){
        var lnk=$(ev.target);
        var uid=lnk.attr("data-uid");
        for(var i=0; i<self.playlistDom.length; i++){
            if(self.playlistDom[i].uid === uid){
                self.playlistDom[i].listitemContainer.remove();
                self.playlistDom.splice(i, 1);
                self.playlist.splice(i, 1);
                return;
            }
        }
    };

    var updatePlaylistItemTitle=function(ev){
        var fld=$(ev.target);
        var uid=fld.attr("data-uid");
        for(var i=0; i<self.playlistDom.length; i++){
            if(self.playlistDom[i].uid === uid){
                self.value.playlist[i].title=fld.val();
                $(document).trigger("editor:updated");
                return;
            }
        }
    };

    var updatePlaylistItemMp3=function(ev){
        var fld=$(ev.target);
        var uid=fld.attr("data-uid");
        for(var i=0; i<self.playlistDom.length; i++){
            if(self.playlistDom[i].uid === uid){
                self.value.playlist[i].mp3=fld.val();
                $(document).trigger("editor:updated");
                return;
            }
        }
    };
    
    var updatePlaylistItemOga=function(ev){
        var fld=$(ev.target);
        var uid=fld.attr("data-uid");
        for(var i=0; i<self.playlistDom.length; i++){
            if(self.playlistDom[i].uid === uid){
                self.value.playlist[i].oga=fld.val();
                $(document).trigger("editor:updated");
                return;
            }
        }
    };
    
    var updatePlaylistItemWav=function(ev){
        var fld=$(ev.target);
        var uid=fld.attr("data-uid");
        for(var i=0; i<self.playlistDom.length; i++){
            if(self.playlistDom[i].uid === uid){
                self.value.playlist[i].wav=fld.val();
                $(document).trigger("editor:updated");
                return;
            }
        }
    };

    this.playlistDom=[];
    for(var i=0; i<this.value.playlist.length; i++){
        
        var playlistItemData = this.value.playlist[i];
        
        var playlistDomItem={};
        
        playlistDomItem.uid="playlist" + this.id + "_media_" + Math.random();
        
        playlistDomItem.listitemContainer=$("<div class=\"playlist-item\" id=\"" + playlistDomItem.uid + "\"></div>");
        this.container.append(playlistDomItem.listitemContainer);
        
        playlistDomItem.listitemToolbar=$("<div></div>");
        playlistDomItem.listitemContainer.append(playlistDomItem.listitemToolbar);
        
        playlistDomItem.listitemDelete=$("<a class='delete-link' data-uid=\"" + playlistDomItem.uid + "\">&times;</a>");
        playlistDomItem.listitemToolbar.append(playlistDomItem.listitemDelete);
        playlistDomItem.listitemDelete.click(deletePlaylistItem);
        
        
        playlistDomItem.listitemContainer.append("<div class=\"label\">"+entutor.i18n['Sound title']+"</div>");
        playlistDomItem.titleInput = $("<input type=text class=\"editor-html-content\" data-uid=\"" + playlistDomItem.uid + "\">");
        playlistDomItem.listitemContainer.append(playlistDomItem.titleInput);
        playlistDomItem.titleInput.val(playlistItemData.title);
        playlistDomItem.titleInput.change(updatePlaylistItemTitle);

        playlistDomItem.listitemContainer.append("<div class=\"label\">"+entutor.i18n['MP3 file URL']+"</div>");
        playlistDomItem.mp3Input = $("<input type=text class=\"editor-html-content\" data-uid=\"" + playlistDomItem.uid + "\">");
        playlistDomItem.listitemContainer.append(playlistDomItem.mp3Input);
        playlistDomItem.mp3Input.val(playlistItemData.mp3);
        playlistDomItem.mp3Input.change(updatePlaylistItemMp3);

        playlistDomItem.listitemContainer.append("<div class=\"label\">"+entutor.i18n['OGA file URL']+"</div>");
        playlistDomItem.ogaInput = $("<input type=text class=\"editor-html-content\" data-uid=\"" + playlistDomItem.uid + "\">");
        playlistDomItem.listitemContainer.append(playlistDomItem.ogaInput);
        playlistDomItem.ogaInput.val(playlistItemData.oga);
        playlistDomItem.ogaInput.change(updatePlaylistItemOga);

        playlistDomItem.listitemContainer.append("<div class=\"label\">"+entutor.i18n['WAV file URL']+"</div>");
        playlistDomItem.wavInput = $("<input type=text class=\"editor-html-content\" data-uid=\"" + playlistDomItem.uid + "\">");
        playlistDomItem.listitemContainer.append(playlistDomItem.wavInput);
        playlistDomItem.wavInput.val(playlistItemData.wav);
        playlistDomItem.wavInput.change(updatePlaylistItemWav);
        
        
        this.playlistDom[i]=playlistDomItem;

    }



    this.addLink = $('<a class="editor-options-link" href="javascript:void(\'+variant\')">+</a>');
    this.toolbar.prepend(this.addLink);
    this.addLink.click(function () {
        var playlistItemData={ title:'', mp3:'', oga:'', wav:''};
        var playlistDomItem={};
        
        playlistDomItem.uid="playlist" + this.id + "_media_" + Math.random();
        
        playlistDomItem.listitemContainer=$("<div class=\"playlist-item\" id=\"" + playlistDomItem.uid + "\"></div>");
        self.container.append(playlistDomItem.listitemContainer);
        
        playlistDomItem.listitemToolbar=$("<div class='toolbar'></div>");
        playlistDomItem.listitemContainer.append(playlistDomItem.listitemToolbar);
        
        playlistDomItem.listitemDelete=$("<a class='delete-link' data-uid=\"" + playlistDomItem.uid + "\">&times;</a>");
        playlistDomItem.listitemToolbar.append(playlistDomItem.listitemDelete);
        playlistDomItem.listitemDelete.click(deletePlaylistItem);
        
        
        playlistDomItem.listitemContainer.append("<div class=\"label\">"+entutor.i18n['Sound title']+"</div>");
        playlistDomItem.titleInput = $("<input type=text class=\"editor-html-content\" data-uid=\"" + playlistDomItem.uid + "\">");
        playlistDomItem.listitemContainer.append(playlistDomItem.titleInput);
        playlistDomItem.titleInput.val(playlistItemData.title);
        playlistDomItem.titleInput.change(updatePlaylistItemTitle);

        playlistDomItem.listitemContainer.append("<div class=\"label\">"+entutor.i18n['MP3 file URL']+"</div>");
        playlistDomItem.mp3Input = $("<input type=text class=\"editor-html-content\" data-uid=\"" + playlistDomItem.uid + "\">");
        playlistDomItem.listitemContainer.append(playlistDomItem.mp3Input);
        playlistDomItem.mp3Input.val(playlistItemData.mp3);
        playlistDomItem.mp3Input.change(updatePlaylistItemMp3);

        playlistDomItem.listitemContainer.append("<div class=\"label\">"+entutor.i18n['OGA file URL']+"</div>");
        playlistDomItem.ogaInput = $("<input type=text class=\"editor-html-content\" data-uid=\"" + playlistDomItem.uid + "\">");
        playlistDomItem.listitemContainer.append(playlistDomItem.ogaInput);
        playlistDomItem.ogaInput.val(playlistItemData.oga);
        playlistDomItem.ogaInput.change(updatePlaylistItemOga);

        playlistDomItem.listitemContainer.append("<div class=\"label\">"+entutor.i18n['WAV file URL']+"</div>");
        playlistDomItem.wavInput = $("<input type=text class=\"editor-html-content\" data-uid=\"" + playlistDomItem.uid + "\">");
        playlistDomItem.listitemContainer.append(playlistDomItem.wavInput);
        playlistDomItem.wavInput.val(playlistItemData.wav);
        playlistDomItem.wavInput.change(updatePlaylistItemWav);
        
        self.value.playlist.push(playlistItemData);
        self.playlistDom.push(playlistDomItem);
        $(document).trigger("editor:updated");
    });



    return this.container;
};

entutor.editors.playlist.prototype.getValue = function () {
    return this.value;
};






// =============================================================================
// 
// slideshow
//
entutor.editors.slideshow = function (parent, value) {
    this.type = 'slideshow';
    this.parent = parent;
    this.value = value || {};

    this.id = this.parent.id + '_' + (this.value.id || (++entutor.guid));

    this.maxScore = 1;

    this.value.classes = this.value.classes || '';
    this.value.precondition = this.value.precondition || 'none';
    this.value.supplied = this.value.supplied || "mp3,oga,wav";
    this.value.hideOnCorrect = this.value.hideOnCorrect? true :false;
    this.value.autostart = this.value.autostart? true :false;


    this.value.media = this.value.media || {};
    this.value.media.title=this.value.media.title || 'title';
    this.value.media.mp3=this.value.media.mp3 || entutor.i18n['mp3 file URL'];
    this.value.media.oga=this.value.media.oga || entutor.i18n['oga file URL'];
    this.value.media.wav=this.value.media.wav || entutor.i18n['wav file URL'];
    

    this.value.slides = this.value.slides || [];
    if(!$.isArray(this.value.slides)){
        this.value.slides = [];
    }
};

entutor.editors.slideshow.prototype.draw = function () {
    // console.log('entutor.editors.card.prototype.draw ' + this.id);
    var self = this;
    this.container = $("<div class=\"editor-element-container " + this.type + "\"></div>");
    this.toolbar = $('<div class="editor-toolbar">' + this.type + ' #' + this.id + '</div>');
    this.container.append(this.toolbar);





    this.optionsLink = $('<a class="editor-options-link" href="javascript:void(\'options\')">&Congruent;</a>');
    this.toolbar.prepend(this.optionsLink);
    this.optionsLink.click(function () { self.optionBlock.toggle(); });

    this.optionBlock = $("<div class=\"editor-element-options\"></div>");
    this.optionBlock.hide();
    this.container.append(this.optionBlock);

    this.optionBlock.append(entutor.components.string(this.value, 'classes', entutor.i18n['CSS classes']));
    this.optionBlock.append(entutor.components.select(this.value, 'precondition', entutor.i18n['Precondition'], {'none': entutor.i18n['none'], 'beforeCorrect': entutor.i18n['beforeCorrect']} /*, callback */));
    this.optionBlock.append(entutor.components.checkbox(this.value, 'autostart', entutor.i18n['Autostart']));
    this.optionBlock.append(entutor.components.checkbox(this.value, 'hideOnCorrect', entutor.i18n['Hide if Correct']));



    // add text field
    //    this.container.append("<div class=\"label\">"+entutor.i18n['Sound title']+"</div>");
    //    this.mediaTitleInput = $("<input type=text class=\"editor-html-content\">");
    //    this.container.append(this.mediaTitleInput);
    //    this.mediaTitleInput.val(this.value.media.title);
    //    this.mediaTitleInput.change(function () { self.value.media.title= self.mediaTitleInput.val();   $(document).trigger("editor:updated");  });

    this.container.append("<div class=\"label\">"+entutor.i18n['MP3 file URL']+"</div>");
    this.mediaMP3Input = $("<input type=text class=\"editor-html-content\">");
    this.container.append(this.mediaMP3Input);
    this.mediaMP3Input.val(this.value.media.mp3);
    this.mediaMP3Input.change(function () { self.value.media.mp3= self.mediaMP3Input.val();   $(document).trigger("editor:updated");  });

    this.container.append("<div class=\"label\">"+entutor.i18n['OGA file URL']+"</div>");
    this.mediaOGAInput = $("<input type=text class=\"editor-html-content\">");
    this.container.append(this.mediaOGAInput);
    this.mediaOGAInput.val(this.value.media.oga);
    this.mediaOGAInput.change(function () { self.value.media.oga= self.mediaOGAInput.val();   $(document).trigger("editor:updated");  });

    this.container.append("<div class=\"label\">"+entutor.i18n['WAV file URL']+"</div>");
    this.mediaWAVInput = $("<input type=text class=\"editor-html-content\">");
    this.container.append(this.mediaWAVInput);
    this.mediaWAVInput.val(this.value.media.wav);
    this.mediaWAVInput.change(function () { self.value.media.wav= self.mediaWAVInput.val();   $(document).trigger("editor:updated");  });





    var deleteSlide=function(ev){
        var lnk=$(ev.target);
        var uid=lnk.attr("data-uid");
        for(var i=0; i<self.slidesDom.length; i++){
            if(self.slidesDom[i].uid === uid){
                self.slidesDom[i].container.remove();
                self.slidesDom.splice(i, 1);
                self.value.slides.splice(i, 1);
                return;
            }
        }
    };

    var updateSlideHtml=function(ev){
        var fld=$(ev.target);
        var uid=fld.attr("data-uid");
        for(var i=0; i<self.slidesDom.length; i++){
            if(self.slidesDom[i].uid === uid){
                self.value.slides[i].html=fld.val();
                $(document).trigger("editor:updated");
                return;
            }
        }
    };

    var updateSlideFrom=function(ev){
        var fld=$(ev.target);
        var uid=fld.attr("data-uid");
        for(var i=0; i<self.slidesDom.length; i++){
            if(self.slidesDom[i].uid === uid){
                self.value.slides[i].from=fld.val();
                $(document).trigger("editor:updated");
                return;
            }
        }
    };
    
    var updateSlideTo=function(ev){
        var fld=$(ev.target);
        var uid=fld.attr("data-uid");
        for(var i=0; i<self.slidesDom.length; i++){
            if(self.slidesDom[i].uid === uid){
                self.value.slides[i].to=fld.val();
                $(document).trigger("editor:updated");
                return;
            }
        }
    };


    this.slidesDom=[];
    var lbl;
    for(var i=0; i<this.value.slides.length; i++){
        
        var slideData = this.value.slides[i];
        
        var slideDom={};
        
        slideDom.uid="slide" + this.id + "_slide_" + Math.random();
        
        slideDom.container=$("<div class=\"slide-item\" id=\"" + slideDom.uid + "\"></div>");
        this.container.append(slideDom.container);
        
        slideDom.toolbar=$("<div class=\"toolbar\">"+entutor.i18n['Slide']+"</div>");
        slideDom.container.append(slideDom.toolbar);
        
        slideDom.deleteSlide=$("<a class='delete-link' data-uid=\"" + slideDom.uid + "\">&times;</a>");
        slideDom.toolbar.append(slideDom.deleteSlide);
        slideDom.deleteSlide.click(deleteSlide);
        
        
        // slideDom.container.append("<div class=\"label\">Slide html</div>");
        slideDom.html = $("<textarea class=\"editor-html-content\" data-uid=\"" + slideDom.uid + "\"></textarea>");
        slideDom.container.append(slideDom.html);
        slideDom.html.val(slideData.html);
        slideDom.html.change(updateSlideHtml);

        lbl=$("<div class=\"label short\">"+entutor.i18n['From time']+"</div>");
        slideDom.container.append(lbl);
        slideDom.fromInput = $("<input type=text class=\"editor-html-content\" data-uid=\"" + slideDom.uid + "\">");
        lbl.append(slideDom.fromInput);
        slideDom.fromInput.val(slideData.from);
        slideDom.fromInput.change(updateSlideFrom);

        lbl=$("<div class=\"label short\">"+entutor.i18n['To time']+"</div>");
        slideDom.container.append(lbl);
        slideDom.toInput = $("<input type=text class=\"editor-html-content\" data-uid=\"" + slideDom.uid + "\">");
        lbl.append(slideDom.toInput);
        slideDom.toInput.val(slideData.to);
        slideDom.toInput.change(updateSlideTo);
        
        this.slidesDom[i]=slideDom;

    }



    this.addLink = $('<a class="editor-options-link" href="javascript:void(\'+variant\')">+</a>');
    this.toolbar.prepend(this.addLink);
    this.addLink.click(function () {
        var slideData={ html:'', from:'', to:''};
        var slideDom={};
        var lbl;
        var slideDom={};
        
        slideDom.uid="slide" + this.id + "_slide_" + Math.random();
        
        slideDom.container=$("<div class=\"slide-item\" id=\"" + slideDom.uid + "\"></div>");
        self.container.append(slideDom.container);
        
        slideDom.toolbar=$("<div class=\"toolbar\">Slide</div>");
        slideDom.container.append(slideDom.toolbar);
        
        slideDom.deleteSlide=$("<a class='delete-link' data-uid=\"" + slideDom.uid + "\">&times;</a>");
        slideDom.toolbar.append(slideDom.deleteSlide);
        slideDom.deleteSlide.click(deleteSlide);
        
        
        // slideDom.container.append("<div class=\"label\">Slide html</div>");
        slideDom.html = $("<textarea class=\"editor-html-content\" data-uid=\"" + slideDom.uid + "\"></textarea>");
        slideDom.container.append(slideDom.html);
        slideDom.html.val(slideData.html);
        slideDom.html.change(updateSlideHtml);

        lbl=$("<div class=\"label short\">"+entutor.i18n['From time']+"</div>");
        slideDom.container.append(lbl);
        slideDom.fromInput = $("<input type=text class=\"editor-html-content\" data-uid=\"" + slideDom.uid + "\">");
        lbl.append(slideDom.fromInput);
        slideDom.fromInput.val(slideData.from);
        slideDom.fromInput.change(updateSlideFrom);

        lbl=$("<div class=\"label short\">"+entutor.i18n['To time']+"</div>");
        slideDom.container.append(lbl);
        slideDom.toInput = $("<input type=text class=\"editor-html-content\" data-uid=\"" + slideDom.uid + "\">");
        lbl.append(slideDom.toInput);
        slideDom.toInput.val(slideData.to);
        slideDom.toInput.change(updateSlideTo);
        
        self.value.slides.push(slideData);
        self.slidesDom.push(slideDom);
        $(document).trigger("editor:updated");
    });

    return this.container;
};

entutor.editors.slideshow.prototype.getValue = function () {
    return this.value;
};






// =============================================================================
//  recorder
entutor.editors.recorder = function (parent, value) {
    this.type = 'recorder';
    this.parent = parent;
    this.value = value || {};

    this.id = this.parent.id + '_' + (this.value.id || (++entutor.guid));

    this.maxScore = 1;

    this.value.classes = this.value.classes || '';
    this.value.precondition = this.value.precondition || 'none';
    this.value.autostart = this.value.autostart ? true : false;
    this.value.autocheck = this.value.autocheck ? true : false;
    this.value.text=this.value.text || 'title';    
    this.value.hideOnCorrect = this.value.hideOnCorrect? true :false;
    this.value.duration = this.value.duration || 30;    
    this.value.taskPassScore = this.value.taskPassScore || 0.7;
    
    if(this.value.duration>30 || this.value.duration<0) this.value.duration=30;
};

entutor.editors.recorder.prototype.draw = function () {
    // console.log('entutor.editors.card.prototype.draw ' + this.id);
    var self = this;
    this.container = $("<div class=\"editor-element-container " + this.type + "\"></div>");
    this.toolbar = $('<div class="editor-toolbar">' + this.type + ' #' + this.id + '</div>');
    this.container.append(this.toolbar);

    this.optionsLink = $('<a class="editor-options-link" href="javascript:void(\'options\')">&Congruent;</a>');
    this.toolbar.prepend(this.optionsLink);
    this.optionsLink.click(function () { self.optionBlock.toggle(); });

    this.optionBlock = $("<div class=\"editor-element-options\"></div>");
    this.optionBlock.hide();
    this.container.append(this.optionBlock);

    this.optionBlock.append(entutor.components.string(this.value, 'classes', entutor.i18n['CSS classes']));
    this.optionBlock.append(entutor.components.select(this.value, 'precondition', entutor.i18n['Precondition'], {'none': entutor.i18n['none'], 'beforeCorrect': entutor.i18n['beforeCorrect']} /*, callback */));
    this.optionBlock.append(entutor.components.checkbox(this.value, 'autostart', entutor.i18n['Autostart']));
    this.optionBlock.append(entutor.components.checkbox(this.value, 'autocheck', entutor.i18n['Autocheck']));
    this.optionBlock.append(entutor.components.checkbox(this.value, 'hideOnCorrect', entutor.i18n['Hide if Correct']));
    this.optionBlock.append(entutor.components.string(this.value, 'hint', entutor.i18n['Hint']));
    this.optionBlock.append(entutor.components.string(this.value, 'duration', entutor.i18n['Duration, seconds']));
    this.optionBlock.append(entutor.components.string(this.value, 'taskPassScore', entutor.i18n['Min score to pass (0 ... 1)']));


    // add text field
    this.container.append("<div>Text to check</div>");
    this.textInput = $("<input type=text class=\"editor-html-content\">");
    this.container.append(this.textInput);
    this.textInput.val(this.value.text);
    this.textInput.change(function () { self.value.text= self.textInput.val();   $(document).trigger("editor:updated");  });

    return this.container;
};

entutor.editors.recorder.prototype.getValue = function () {
    return this.value;
};










// =============================================================================
entutor.editors.sequence = function (parent, value) {
    this.type = 'sequence';
    this.parent = parent;
    this.value = value || {};

    this.id = this.parent.id + '_' + (this.value.id || (++entutor.guid));

    this.value.classes = this.value.classes || '';
    this.value.precondition = this.value.precondition || 'none';
    this.maxScore = 1;
    this.value.autocheck = this.value.autocheck? true :false;
    this.value.hideOnCorrect = this.value.hideOnCorrect? true :false;
    this.value.arrange = this.value.arrange || 'vertical';
    this.value.value = this.value.value || null;
    this.value.hint = this.value.hint || '';
    this.value.items =  this.value.items || [];
    
    // create child elements
    this.itemEditors = [];
    for (var key = 0; key < this.value.items.length; key++) {
        
        var child = this.value.items[key];
        if ( ! ( typeof(child)==='object' 
                 && typeof(child.type)==='string' 
                 && typeof(entutor.inputs[child.type]) === 'function' ) ){
            child = {
                        "type": "html",
                        "classes": "",
                        "precondition": "none",
                        "hideOnCorrect": false,
                        "duration": "none",
                        "innerHtml": child+''
                    };
        }
        if (typeof (entutor.editors[child.type]) === 'function') {
            var constructor = entutor.editors[child.type];
            var childObject = new constructor(this, child);
            this.itemEditors.push(childObject);
        }
    }

};

entutor.editors.sequence.prototype.draw = function () {
    // console.log('entutor.editors.card.prototype.draw ' + this.id);
    var self = this;
    this.container = $("<div class=\"editor-element-container " + this.type + "\"></div>");
    this.toolbar = $('<div class="editor-toolbar">' + this.type + ' #' + this.id + '</div>');
    this.container.append(this.toolbar);

    this.optionsLink = $('<a class="editor-options-link" href="javascript:void(\'options\')">&Congruent;</a>');
    this.toolbar.prepend(this.optionsLink);
    this.optionsLink.click(function () { self.optionBlock.toggle(); });

    this.optionBlock = $("<div class=\"editor-element-options\"></div>");
    this.optionBlock.hide();
    this.container.append(this.optionBlock);

    this.optionBlock.append(entutor.components.string(this.value, 'classes', entutor.i18n['CSS classes']));
    this.optionBlock.append(entutor.components.select(this.value, 'precondition', entutor.i18n['Precondition'], {'none': entutor.i18n['none'], 'beforeCorrect': entutor.i18n['beforeCorrect']} /*, callback */));
    this.optionBlock.append(entutor.components.checkbox(this.value, 'autocheck', entutor.i18n['Autocheck']));
    this.optionBlock.append(entutor.components.checkbox(this.value, 'hideOnCorrect', entutor.i18n['Hide if Correct']));
    this.optionBlock.append(entutor.components.select(this.value, 'arrange', entutor.i18n['Arrange subelements'], {'horizontal': entutor.i18n['horizontal'], 'vertical': entutor.i18n['vertical']} , function(value){self.childContainer.removeClass('vertical').removeClass('horizontal').addClass(value);}));
    this.optionBlock.append(entutor.components.string(this.value, 'value', entutor.i18n['Initial seqence']));
    this.optionBlock.append(entutor.components.string(this.value, 'hint', entutor.i18n['Hint']));

    this.addChildBlock = $("<div class=\"editor-element-options\"></div>");
    this.addChildBlock.hide();
    this.container.append(this.addChildBlock);
    for(var ctp in entutor.editors){
        var lnk=$('<a href="javascript:void(\'add_'+ctp+'\')" class="addChildLink" data-type="'+ctp+'">'+ctp+'</a>');
        this.addChildBlock.append(lnk);
        lnk.click(function(){
            var type=$(this).attr('data-type');
            var constructor = entutor.editors[type];
            var childObject = new constructor(self, {type:type});
            
            self.itemEditors.push(childObject);
            var itemDomElement = self.addItem(self.itemEditors.length-1, childObject);
            childObject.itemDomElement=itemDomElement;
            self.childContainer.append(itemDomElement);
        });
    }
    
    this.addLink = $('<a class="editor-options-link" href="javascript:void(\'+\')">+</a>');
    this.toolbar.prepend(this.addLink);
    this.addLink.click(function () {  self.addChildBlock.toggle(); });


    var deleteItem=function(event){
        var key=$(event.target).attr('data-key');
        self.itemEditors[key]=null;
        var parent=$(this).parents('.sequence-item').first();
        parent.remove();
    };
    
    var moveup=function(event){
        var key=parseInt($(event.target).attr('data-key'));
        // console.log('moveup', key);
        if(key>0){
            var prev=self.itemEditors[key].itemDomElement.prev();
            prev.before(self.itemEditors[key].itemDomElement);
            var tmp=self.itemEditors[key];
            self.itemEditors[key]=self.itemEditors[key-1];
            self.itemEditors[key-1]=tmp;
            self.itemEditors[key-1].itemDomElement.find('a[data-key]').attr('data-key',key-1);
            self.itemEditors[key].itemDomElement.find('a[data-key]').attr('data-key',key);
        }
    };
    
    var movedown=function(event){
        var key=parseInt($(event.target).attr('data-key'));
        // console.log('movedown', key);
        if(key<self.itemEditors.length-1){
            var next=self.itemEditors[key].itemDomElement.next();
            next.after(self.itemEditors[key].itemDomElement);
            var tmp=self.itemEditors[key];
            self.itemEditors[key]=self.itemEditors[key+1];
            self.itemEditors[key+1]=tmp;
            self.itemEditors[key].itemDomElement.find('a[data-key]').attr('data-key',key);
            self.itemEditors[key+1].itemDomElement.find('a[data-key]').attr('data-key',key+1);
        }
    };
    
    this.addItem=function(key, obj){
        var itemDomElement=$("<div class=\"editor-element-container sequence-item\"></div>");

        var itemToolbar=$('<div class="editor-toolbar">sequence item</div>');
        itemDomElement.append(itemToolbar);

        var deleteItemLink=$('<a href="javascript:void(\'del\')" data-key=\"'+key+'\" class=\"editor-options-link\">&times;</a>');
        deleteItemLink.click(deleteItem);
        itemToolbar.append(deleteItemLink);
        
        var moveupLink=$('<a href="javascript:void(\'moveup\')" data-key=\"'+key+'\" class=\"editor-options-link\">&Lambda;</a>');
        moveupLink.click(moveup);
        itemToolbar.append(moveupLink);
        
        var movedownLink=$('<a href="javascript:void(\'movedown\')" data-key=\"'+key+'\" class=\"editor-options-link\">V</a>');
        movedownLink.click(movedown);
        itemToolbar.append(movedownLink);
        
        itemDomElement.append(obj.draw());
        
        return itemDomElement;
    };
    
    this.childContainer=$("<div class=\"editor-card-children\"></div>");
    this.childContainer.addClass(this.value.arrange);
    this.container.append(this.childContainer);
    for(var key = 0; key < this.itemEditors.length; key++) {
        var itemDomElement = this.addItem(key, this.itemEditors[key]);
        this.itemEditors[key].itemDomElement=itemDomElement;
        this.childContainer.append(itemDomElement);
    }

    return this.container;
};

entutor.editors.sequence.prototype.getValue = function () {
    this.value.items=[];
    for(var i=0; i<this.itemEditors.length; i++){
        if(this.itemEditors[i]){
            this.value.items.push(this.itemEditors[i].getValue());
        }
    }
    return this.value;
};


