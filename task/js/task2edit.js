
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
    this.container = $("<div class=\"editor-container\"></div>");
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

    var label = $("<span class=\"editor-component-label checkbox\">" + labelText + "</span>");
    container.append(label);

    var input = $("<input class=\"editor-component-input checkbox\" type=\"checkbox\">");
    container.append(input);
    
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



    this.delChild=function(ev){
        var trg=$(ev.target);
        var i=trg.attr('data-i');
        self.children[i].container.remove();
        self.children.splice(i,1);
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

entutor.editors.card.prototype.addChild=function(type){
    if (typeof (entutor.editors[type]) === 'function') {
        var constructor = entutor.editors[type];
        var childObject = new constructor(this, {type:type});
        this.children.push(childObject);
        
        var i=this.children.length-1;
        var childDomElement = this.children[i].draw();
        this.childContainer.append(childDomElement);

        this.children[i].delLink=$('<a class="editor-options-link" href="javascript:void(\'del\')" data-i=\"'+i+'\">&times;</a>');
        this.children[i].delLink.click(this.delChild);
        this.children[i].toolbar.prepend(this.children[i].delLink);

        this.children[i].upLink=$('<a class="editor-options-link" href="javascript:void(\'up\')" data-i=\"'+i+'\">up</a>');
        this.children[i].upLink.click(this.getUpMover);
        this.children[i].toolbar.prepend(this.children[i].upLink);

        this.children[i].downLink=$('<a class="editor-options-link" href="javascript:void(\'down\')" data-i=\"'+i+'\">down</a>');
        this.children[i].downLink.click(this.getDownMover);
        this.children[i].toolbar.prepend(this.children[i].downLink);
        
        $(document).trigger("editor:updated");
    }
};


entutor.editors.card.prototype.getValue = function () {
    for (var i = 0; i < this.children.length; i++) {
        this.value.children[i] = this.children[i].getValue();
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
    
    
    
//        correctVariant:'1',
//        variant:{
//           '1':'1 Correct answer',
//           '2':'2 Wrong answer',
//           '3':'3 Wrong answer'
//        }
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