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
        encode: true
    }).done(function (json) {
        entutor.currentEditor = new entutor.editor(json);
        $(containerSelector).empty().append(entutor.currentEditor.draw());
        window.location.hash = json.id;
    });
};

entutor.editor = function (value) {

    var self = this;

    this.value = value || {};

    this.id = value.id || (++entutor.guid);

    // create presentation
    this.presentation = new entutor.presentationeditor(this, this.value.presentation);


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

    this.optionBlock.append(entutor.components.checkbox(this.value, 'autocheck', 'Autocheck'));
    
    this.container.append(this.presentation.draw());
    this.container.append(this.inputs.draw());
    return this.container;
};

entutor.editor.prototype.getValue = function () {
    this.value.presentation = this.presentation.getValue();
    this.value.inputs = this.inputs.getValue();
    return this.value;
};




// =============================================================================
entutor.presentationeditor = function (parent, value) {
    this.parent = parent;
    this.value = value;
};

entutor.presentationeditor.prototype.draw = function () {
    var self = this;
    this.container = $("<div class=\"editor-element-container presentation\"></div>");
    this.container.append('<div class="editor-toolbar">Presentation</div>');
    this.textarea = $("<textarea class=\"editor-presentation-textarea\"></textarea>");
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

    var label = $("<span class=\"editor-component-label string\">" + labelText + "</span>");
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

    var label = $("<span class=\"editor-component-label number\">" + labelText + "</span>");
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

    var label = $("<span class=\"editor-component-label number\">" + labelText + "</span>");
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

    var label = $("<span class=\"editor-component-label string\">" + labelText + "</span>");
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

    var label = $("<span class=\"editor-component-label string\">" + labelText + "</span>");
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
    container.append(input);
    
    var label = $("<span class=\"editor-component-label checkbox\">" + labelText + "</span>");
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
    this.value.arrange = this.value.arrange || 'horizontal';
    this.value.taskPassScore = this.value.taskPassScore || 1;
    this.value.precondition = this.value.precondition || 'none';
    this.value.customtest = this.value.customtest || '';
    this.value.maxScore = (typeof (this.value.maxScore) !== 'undefined') ? this.value.maxScore : 1;

    this.value.hideOnCorrect = this.value.hideOnCorrect? true :false;



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

    this.optionBlock.append(entutor.components.string(this.value, 'classes', 'CSS classes'));

    this.optionBlock.append(entutor.components.select(this.value, 'arrange', 'Arrange subelements', {'horizontal': 'horizontal', 'vertical': 'vertical','flow':'flow'} , function(value){self.childContainer.removeClass('flow').removeClass('vertical').removeClass('horizontal').addClass(value);}));
    this.optionBlock.append(entutor.components.string(this.value, 'taskPassScore', 'Task Pass Score'));
    this.optionBlock.append(entutor.components.select(this.value, 'precondition', 'Precondition', {'none': 'none', 'beforeCorrect': 'beforeCorrect'} /*, callback */));
    this.optionBlock.append(entutor.components.text(this.value, 'customtest', 'Custom test function' /*, callback */));
    this.optionBlock.append(entutor.components.string(this.value, 'maxScore', 'Max Score'));
    this.optionBlock.append(entutor.components.checkbox(this.value, 'autocheck', 'Autocheck'));
    this.optionBlock.append(entutor.components.checkbox(this.value, 'hideOnCorrect', 'Hide if Correct'));




    this.addLink = $('<a class="editor-options-link" href="javascript:void(\'add\')">+child</a>');
    this.toolbar.prepend(this.addLink);
    this.addLink.click(function () {
        self.addChildBlock.toggle();
    });
    this.addChildBlock = $("<div class=\"editor-element-options\"></div>");
    this.addChildBlock.hide();
    this.container.append(this.addChildBlock);
    for(var ctp in entutor.editors){
        var lnk=$('<a href="javascript:void(\'add_'+ctp+'\')" class="addChildLink" data-type="'+ctp+'">'+ctp+'</a>');
        this.addChildBlock.append(lnk);
        lnk.click(function(){
            var ctp=$(this).attr('data-type');
            self.addChild(ctp);
        });
    }



    var delChild=function(ev){
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
    
    var getUpMover=function(ev){
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
    var getDownMover=function(ev){
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
        this.children[i].delLink.click(delChild);
        this.children[i].toolbar.prepend(this.children[i].delLink);

        this.children[i].upLink=$('<a class="editor-options-link" href="javascript:void(\'up\')" data-i=\"'+i+'\">&Wedge;</a>');
        this.children[i].upLink.click(getUpMover);
        this.children[i].toolbar.prepend(this.children[i].upLink);

        this.children[i].downLink=$('<a class="editor-options-link" href="javascript:void(\'down\')" data-i=\"'+i+'\">&Vee;</a>');
        this.children[i].downLink.click(getDownMover);
        this.children[i].toolbar.prepend(this.children[i].downLink);
    }
    this.container.append(this.childContainer);

    return this.container;
};

entutor.editors.card.prototype.addChild=function(type){
    
    var self=this;
    if (typeof (entutor.editors[type]) === 'function') {
        var constructor = entutor.editors[type];
        var childObject = new constructor(this, {type:type});
        this.children.push(childObject);
        
        var i=this.children.length-1;
        var childDomElement = this.children[i].draw();
        this.childContainer.append(childDomElement);

        this.children[i].delLink=$('<a class="editor-options-link" href="javascript:void(\'del\')" data-i=\"'+i+'\">&times;</a>');
        this.children[i].delLink.click(function(ev){
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
        this.children[i].toolbar.prepend(this.children[i].delLink);

        this.children[i].upLink=$('<a class="editor-options-link" href="javascript:void(\'up\')" data-i=\"'+i+'\">&Wedge;</a>');
        this.children[i].upLink.click(this.getUpMover);
        this.children[i].toolbar.prepend(this.children[i].upLink);

        this.children[i].downLink=$('<a class="editor-options-link" href="javascript:void(\'down\')" data-i=\"'+i+'\">&Vee;</a>');
        this.children[i].downLink.click(this.getDownMover);
        this.children[i].toolbar.prepend(this.children[i].downLink);
        
        $(document).trigger("editor:updated");
    }
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

    this.optionBlock.append(entutor.components.string(this.value, 'classes', 'CSS classes'));
    this.optionBlock.append(entutor.components.select(this.value, 'precondition', 'Precondition', {'none': 'none', 'beforeCorrect': 'beforeCorrect'} /*, callback */));
    this.optionBlock.append(entutor.components.string(this.value, 'duration', 'Duration, milleseconds'));
    this.optionBlock.append(entutor.components.checkbox(this.value, 'hideOnCorrect', 'Hide if Correct'));


    
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

    this.value.pattern = this.value.pattern || 'type correct answer here';
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

    this.optionBlock.append(entutor.components.string(this.value, 'pattern', 'Correct value*',function(value){self.input.val(value);}));
    this.optionBlock.append(entutor.components.string(this.value, 'value', 'Initial value'));
    this.optionBlock.append(entutor.components.integer(this.value, 'maxlength', 'Maximal length'));
    this.optionBlock.append(entutor.components.checkbox(this.value, 'autocheck', 'Autocheck'));

    
    this.optionBlock.append(entutor.components.integer(this.value, 'size', 'Width',function(value){self.input.attr('size',value);}));
    this.optionBlock.append(entutor.components.string(this.value, 'classes', 'CSS classes'));
    this.optionBlock.append(entutor.components.select(this.value, 'precondition', 'Precondition', {'none': 'none', 'beforeCorrect': 'beforeCorrect'} /*, callback */));

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

    this.value.size = this.value.size || '5';
    this.value.arrange = this.value.arrange || 'vertical';

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

    this.optionBlock.append(entutor.components.select(this.value, 'arrange', 'Arrange subelements', {'horizontal': 'horizontal', 'vertical': 'vertical','flow':'flow'} , function(value){self.variantContainer.removeClass('flow').removeClass('vertical').removeClass('horizontal').addClass(value);}));
    this.optionBlock.append(entutor.components.string(this.value, 'classes', 'CSS classes'));
    this.optionBlock.append(entutor.components.select(this.value, 'precondition', 'Precondition', {'none': 'none', 'beforeCorrect': 'beforeCorrect'} /*, callback */));
    this.optionBlock.append(entutor.components.checkbox(this.value, 'autocheck', 'Autocheck'));


    this.addLink = $('<a class="editor-options-link" href="javascript:void(\'+variant\')">+variant</a>');
    this.toolbar.prepend(this.addLink);
    this.addLink.click(function () {
        self.addVariant('','');
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
        var label=$('<span class="label" data-id="' + k + '"></class>');
        this.variantContainer.append(label);
        
        var radio=$('<input type="radio" name="task' + this.id + 'radio" value="' + k + '" data-id="' + k + '">');
        radio.click(function(){
            this.value.correctVariant=$(this).attr('value');
            $(document).trigger('editor:updated')
        });
        label.append(radio);
        if(this.value.correctVariant==radio.attr('value')){
            radio.prop('checked',true);
        }
        
        this.variant.push({key:key, value:value});
        
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

        var valueinput=$('<input type="text" size="17" value="' + value + '">');
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
        
        var delRowLink=$('<a class="delete-link" href="javascript:void(\'del'+key+'\')">&times;</a>');
        delRowLink.click(function(){
            self.delVariant(key);
        });
        label.append(delRowLink);
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

    this.value.label = this.value.label || 'type checkbox label here';
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

    this.optionBlock.append(entutor.components.string(this.value, 'classes', 'CSS classes'));
    this.optionBlock.append(entutor.components.select(this.value, 'precondition', 'Precondition', {'none': 'none', 'beforeCorrect': 'beforeCorrect'} /*, callback */));
    this.optionBlock.append(entutor.components.checkbox(this.value, 'autocheck', 'Autocheck'));

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

    this.value.innerHtml = this.value.innerHtml || 'type visible text here';
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

    this.optionBlock.append(entutor.components.string(this.value, 'value', 'Value provided to dropzone'));

    this.optionBlock.append(entutor.components.string(this.value, 'classes', 'CSS classes'));
    this.optionBlock.append(entutor.components.select(this.value, 'precondition', 'Precondition', {'none': 'none', 'beforeCorrect': 'beforeCorrect'} /*, callback */));
    this.optionBlock.append(entutor.components.checkbox(this.value, 'autocheck', 'Autocheck'));

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

    this.value.pattern = this.value.pattern || 'type correct answer here';
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

    this.optionBlock.append(entutor.components.string(this.value, 'pattern', 'Correct value*',function(value){self.input.val(value);}));
    this.optionBlock.append(entutor.components.string(this.value, 'value', 'Initial value'));
    this.optionBlock.append(entutor.components.string(this.value, 'size', 'Width',function(value){self.input.attr('size',value);}));
    this.optionBlock.append(entutor.components.string(this.value, 'classes', 'CSS classes'));
    this.optionBlock.append(entutor.components.select(this.value, 'precondition', 'Precondition', {'none': 'none', 'beforeCorrect': 'beforeCorrect'} /*, callback */));
    this.optionBlock.append(entutor.components.checkbox(this.value, 'autocheck', 'Autocheck'));

    // add text field
    this.input = $("<input type=text class=\"editor-html-content\" size=\""+this.value.size+"\" disabled=\"true\">");
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
    this.value.supplied = this.value.supplied || "mp3,oga,wav";

    this.value.media = this.value.media || {};
    this.value.media.title=this.value.media.title || 'title';
    this.value.media.mp3=this.value.media.mp3 || 'mp3 file URL';
    this.value.media.oga=this.value.media.oga || 'oga file URL';
    this.value.media.wav=this.value.media.wav || 'mp3 file URL';
    
    
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

    this.optionBlock.append(entutor.components.string(this.value, 'classes', 'CSS classes'));
    this.optionBlock.append(entutor.components.select(this.value, 'precondition', 'Precondition', {'none': 'none', 'beforeCorrect': 'beforeCorrect'} /*, callback */));
    this.optionBlock.append(entutor.components.checkbox(this.value, 'autostart', 'Autostart'));


    // add text field
    this.container.append("<div>Sound title</div>");
    this.mediaTitleInput = $("<input type=text class=\"editor-html-content\">");
    this.container.append(this.mediaTitleInput);
    this.mediaTitleInput.val(this.value.media.title);
    this.mediaTitleInput.change(function () { self.value.media.title= self.mediaTitleInput.val();   $(document).trigger("editor:updated");  });

    this.container.append("<div>MP3 file URL</div>");
    this.mediaMP3Input = $("<input type=text class=\"editor-html-content\">");
    this.container.append(this.mediaMP3Input);
    this.mediaMP3Input.val(this.value.media.mp3);
    this.mediaMP3Input.change(function () { self.value.media.mp3= self.mediaMP3Input.val();   $(document).trigger("editor:updated");  });

    this.container.append("<div>OGA file URL</div>");
    this.mediaOGAInput = $("<input type=text class=\"editor-html-content\">");
    this.container.append(this.mediaOGAInput);
    this.mediaOGAInput.val(this.value.media.oga);
    this.mediaOGAInput.change(function () { self.value.media.oga= self.mediaOGAInput.val();   $(document).trigger("editor:updated");  });

    this.container.append("<div>WAV file URL</div>");
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
    this.value.supplied = this.value.supplied || "mp3,oga,wav";

    this.value.media = this.value.media || {};
    this.value.media.title=this.value.media.title || 'title';
    this.value.media.mp3=this.value.media.mp3 || 'mp3 file URL';
    this.value.media.oga=this.value.media.oga || 'oga file URL';
    this.value.media.wav=this.value.media.wav || 'mp3 file URL';
    
    
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

    this.optionBlock.append(entutor.components.string(this.value, 'classes', 'CSS classes'));
    this.optionBlock.append(entutor.components.select(this.value, 'precondition', 'Precondition', {'none': 'none', 'beforeCorrect': 'beforeCorrect'} /*, callback */));
    this.optionBlock.append(entutor.components.checkbox(this.value, 'autostart', 'Autostart'));


    // add text field
    this.container.append("<div>Video title</div>");
    this.mediaTitleInput = $("<input type=text class=\"editor-html-content\">");
    this.container.append(this.mediaTitleInput);
    this.mediaTitleInput.val(this.value.media.title);
    this.mediaTitleInput.change(function () { self.value.media.title= self.mediaTitleInput.val();   $(document).trigger("editor:updated");  });

    this.container.append("<div>WEBMV file URL</div>");
    this.mediaWEBMVInput = $("<input type=text class=\"editor-html-content\">");
    this.container.append(this.mediaWEBMVInput);
    this.mediaWEBMVInput.val(this.value.media.webmv);
    this.mediaWEBMVInput.change(function () { self.value.media.webmv= self.mediaWEBMVInput.val();   $(document).trigger("editor:updated");  });

    this.container.append("<div>OGV file URL</div>");
    this.mediaOGVInput = $("<input type=text class=\"editor-html-content\">");
    this.container.append(this.mediaOGVInput);
    this.mediaOGVInput.val(this.value.media.ogv);
    this.mediaOGVInput.change(function () { self.value.media.ogv= self.mediaOGVInput.val();   $(document).trigger("editor:updated");  });

    this.container.append("<div>M4V file URL</div>");
    this.mediaM4VInput = $("<input type=text class=\"editor-html-content\">");
    this.container.append(this.mediaM4VInput);
    this.mediaM4VInput.val(this.value.media.m4v);
    this.mediaM4VInput.change(function () { self.value.media.m4v= self.mediaM4VInput.val();   $(document).trigger("editor:updated");  });

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

    this.optionBlock.append(entutor.components.string(this.value, 'classes', 'CSS classes'));
    this.optionBlock.append(entutor.components.select(this.value, 'precondition', 'Precondition', {'none': 'none', 'beforeCorrect': 'beforeCorrect'} /*, callback */));
    // this.optionBlock.append(entutor.components.checkbox(this.value, 'autostart', 'Autostart'));


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
        
        
        playlistDomItem.listitemContainer.append("<div class=\"label\">Sound title</div>");
        playlistDomItem.titleInput = $("<input type=text class=\"editor-html-content\" data-uid=\"" + playlistDomItem.uid + "\">");
        playlistDomItem.listitemContainer.append(playlistDomItem.titleInput);
        playlistDomItem.titleInput.val(playlistItemData.title);
        playlistDomItem.titleInput.change(updatePlaylistItemTitle);

        playlistDomItem.listitemContainer.append("<div class=\"label\">MP3 file URL</div>");
        playlistDomItem.mp3Input = $("<input type=text class=\"editor-html-content\" data-uid=\"" + playlistDomItem.uid + "\">");
        playlistDomItem.listitemContainer.append(playlistDomItem.mp3Input);
        playlistDomItem.mp3Input.val(playlistItemData.mp3);
        playlistDomItem.mp3Input.change(updatePlaylistItemMp3);

        playlistDomItem.listitemContainer.append("<div class=\"label\">OGA file URL</div>");
        playlistDomItem.ogaInput = $("<input type=text class=\"editor-html-content\" data-uid=\"" + playlistDomItem.uid + "\">");
        playlistDomItem.listitemContainer.append(playlistDomItem.ogaInput);
        playlistDomItem.ogaInput.val(playlistItemData.oga);
        playlistDomItem.ogaInput.change(updatePlaylistItemOga);

        playlistDomItem.listitemContainer.append("<div class=\"label\">WAV file URL</div>");
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
        
        
        playlistDomItem.listitemContainer.append("<div class=\"label\">Sound title</div>");
        playlistDomItem.titleInput = $("<input type=text class=\"editor-html-content\" data-uid=\"" + playlistDomItem.uid + "\">");
        playlistDomItem.listitemContainer.append(playlistDomItem.titleInput);
        playlistDomItem.titleInput.val(playlistItemData.title);
        playlistDomItem.titleInput.change(updatePlaylistItemTitle);

        playlistDomItem.listitemContainer.append("<div class=\"label\">MP3 file URL</div>");
        playlistDomItem.mp3Input = $("<input type=text class=\"editor-html-content\" data-uid=\"" + playlistDomItem.uid + "\">");
        playlistDomItem.listitemContainer.append(playlistDomItem.mp3Input);
        playlistDomItem.mp3Input.val(playlistItemData.mp3);
        playlistDomItem.mp3Input.change(updatePlaylistItemMp3);

        playlistDomItem.listitemContainer.append("<div class=\"label\">OGA file URL</div>");
        playlistDomItem.ogaInput = $("<input type=text class=\"editor-html-content\" data-uid=\"" + playlistDomItem.uid + "\">");
        playlistDomItem.listitemContainer.append(playlistDomItem.ogaInput);
        playlistDomItem.ogaInput.val(playlistItemData.oga);
        playlistDomItem.ogaInput.change(updatePlaylistItemOga);

        playlistDomItem.listitemContainer.append("<div class=\"label\">WAV file URL</div>");
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






// TODO .slideshow

// =============================================================================
// 
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


    this.value.media = this.value.media || {};
    this.value.media.title=this.value.media.title || 'title';
    this.value.media.mp3=this.value.media.mp3 || 'mp3 file URL';
    this.value.media.oga=this.value.media.oga || 'oga file URL';
    this.value.media.wav=this.value.media.wav || 'mp3 file URL';
    

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

    this.optionBlock.append(entutor.components.string(this.value, 'classes', 'CSS classes'));
    this.optionBlock.append(entutor.components.select(this.value, 'precondition', 'Precondition', {'none': 'none', 'beforeCorrect': 'beforeCorrect'} /*, callback */));
    // this.optionBlock.append(entutor.components.checkbox(this.value, 'autostart', 'Autostart'));



    // add text field
    this.container.append("<div class=\"label\">Sound title</div>");
    this.mediaTitleInput = $("<input type=text class=\"editor-html-content\">");
    this.container.append(this.mediaTitleInput);
    this.mediaTitleInput.val(this.value.media.title);
    this.mediaTitleInput.change(function () { self.value.media.title= self.mediaTitleInput.val();   $(document).trigger("editor:updated");  });

    this.container.append("<div class=\"label\">MP3 file URL</div>");
    this.mediaMP3Input = $("<input type=text class=\"editor-html-content\">");
    this.container.append(this.mediaMP3Input);
    this.mediaMP3Input.val(this.value.media.mp3);
    this.mediaMP3Input.change(function () { self.value.media.mp3= self.mediaMP3Input.val();   $(document).trigger("editor:updated");  });

    this.container.append("<div class=\"label\">OGA file URL</div>");
    this.mediaOGAInput = $("<input type=text class=\"editor-html-content\">");
    this.container.append(this.mediaOGAInput);
    this.mediaOGAInput.val(this.value.media.oga);
    this.mediaOGAInput.change(function () { self.value.media.oga= self.mediaOGAInput.val();   $(document).trigger("editor:updated");  });

    this.container.append("<div class=\"label\">WAV file URL</div>");
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
    for(var i=0; i<this.value.slides.length; i++){
        
        var slideData = this.value.slides[i];
        
        var slideDom={};
        
        slideDom.uid="slide" + this.id + "_slide_" + Math.random();
        
        slideDom.container=$("<div class=\"slide-item\" id=\"" + slideDom.uid + "\"></div>");
        this.container.append(slideDom.container);
        
        slideDom.toolbar=$("<div class=\"toolbar\"></div>");
        slideDom.container.append(slideDom.toolbar);
        
        slideDom.deleteSlide=$("<a class='delete-link' data-uid=\"" + slideDom.uid + "\">&times;</a>");
        slideDom.toolbar.append(slideDom.deleteSlide);
        slideDom.deleteSlide.click(deleteSlide);
        
        
        slideDom.container.append("<div class=\"label\">Slide html</div>");
        slideDom.html = $("<textarea class=\"editor-html-content\" data-uid=\"" + slideDom.uid + "\"></textarea>");
        slideDom.container.append(slideDom.html);
        slideDom.html.val(slideData.html);
        slideDom.html.change(updateSlideHtml);

        slideDom.container.append("<div class=\"label\">From time</div>");
        slideDom.fromInput = $("<input type=text class=\"editor-html-content\" data-uid=\"" + slideDom.uid + "\">");
        slideDom.container.append(slideDom.fromInput);
        slideDom.fromInput.val(slideData.from);
        slideDom.fromInput.change(updateSlideFrom);

        slideDom.container.append("<div class=\"label\">OGA file URL</div>");
        slideDom.toInput = $("<input type=text class=\"editor-html-content\" data-uid=\"" + slideDom.uid + "\">");
        slideDom.container.append(slideDom.toInput);
        slideDom.toInput.val(slideData.to);
        slideDom.toInput.change(updateSlideTo);
        
        this.slidesDom[i]=slideDom;

    }



    this.addLink = $('<a class="editor-options-link" href="javascript:void(\'+variant\')">+</a>');
    this.toolbar.prepend(this.addLink);
    this.addLink.click(function () {
        var slideData={ html:'', from:'', to:''};
        var slideDom={};
        
        var slideDom={};
        
        slideDom.uid="slide" + this.id + "_slide_" + Math.random();
        
        slideDom.container=$("<div class=\"slide-item\" id=\"" + slideDom.uid + "\"></div>");
        self.container.append(slideDom.container);
        
        slideDom.toolbar=$("<div class=\"toolbar\"></div>");
        slideDom.container.append(slideDom.toolbar);
        
        slideDom.deleteSlide=$("<a class='delete-link' data-uid=\"" + slideDom.uid + "\">&times;</a>");
        slideDom.toolbar.append(slideDom.deleteSlide);
        slideDom.deleteSlide.click(deleteSlide);
        
        
        slideDom.container.append("<div class=\"label\">Slide html</div>");
        slideDom.html = $("<textarea class=\"editor-html-content\" data-uid=\"" + slideDom.uid + "\"></textarea>");
        slideDom.container.append(slideDom.html);
        slideDom.html.val(slideData.html);
        slideDom.html.change(updateSlideHtml);

        slideDom.container.append("<div class=\"label\">From time</div>");
        slideDom.fromInput = $("<input type=text class=\"editor-html-content\" data-uid=\"" + slideDom.uid + "\">");
        slideDom.container.append(slideDom.fromInput);
        slideDom.fromInput.val(slideData.from);
        slideDom.fromInput.change(updateSlideFrom);

        slideDom.container.append("<div class=\"label\">To time</div>");
        slideDom.toInput = $("<input type=text class=\"editor-html-content\" data-uid=\"" + slideDom.uid + "\">");
        slideDom.container.append(slideDom.toInput);
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

    this.optionBlock.append(entutor.components.string(this.value, 'classes', 'CSS classes'));
    this.optionBlock.append(entutor.components.select(this.value, 'precondition', 'Precondition', {'none': 'none', 'beforeCorrect': 'beforeCorrect'} /*, callback */));
    this.optionBlock.append(entutor.components.checkbox(this.value, 'autostart', 'Autostart'));
    this.optionBlock.append(entutor.components.checkbox(this.value, 'autocheck', 'Autocheck'));


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





