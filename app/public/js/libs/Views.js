function View(view, parentRandom){

    this.random = Math.random().toString(16).slice(2);
    this.view = view;
    this.view.action = view.action || 'find';
    this.nav = this.getNav(parentRandom);
    this.query = this.getQuery(parentRandom);
    this.result = this.getResult(parentRandom);
    this.setPrompt();
    this.bindEvents();
    return this;
}

View.prototype.getNav = function(parentRandom){
    var count = parseInt($('.navlist').data('count'));
    var html = Html('#tViewNav', {
        id : 'nav'+this.random, index : count++, name : this.view.name, parent : parentRandom
    });
    $('.navlist').data('count', count);
    if(parentRandom){
        $('#nav'+parentRandom).after(html);
    } else {
        $('.navlist').append(html);
    }
    return $('#nav'+this.random);
}
View.prototype.getQuery = function(){
    $('.queries').append(Html('#tQuery', {
        id : 'query'+this.random, view : this.view, collections : Storage.get('collections', true)
    }));
    return $('#query'+this.random);
}
View.prototype.getResult = function(){
    $('.results').append(Html('#tResult', {
        id : 'result'+this.random, view : this.view
    }));
    return $("#result"+this.random);
}
View.prototype.setPrompt = function(){
    var _this = this, prompt, operators, defaultOperators = {};
    this.promptList = {};
    this.query.find('.qpromt').html('');
    if(typeof this.view.prompt === 'object'){
        for(var i in this.view.prompt){
            prompt = this.view.prompt[i];
            prompt.name = i;
            prompt.dataType = prompt.dataType || 'string';
            defaultOperators[prompt.operator || 'eq'] = prompt.value;
            operators = prompt.operators ? prompt.operators : defaultOperators;
            for(var operator in operators){
                prompt.operator = operator;
                prompt.value = operators[operator];
                _this.appendPrompt(prompt);
            }
            
        }
    }    
}
View.prototype.appendPrompt = function(prompt){
    var feed = prompt.feed ? Feed.load(this.query.find('.qcollection').val(), prompt.name) : null;

    var id = this.random+'-prompt-'+Html.clean(prompt.name+'-'+prompt.operator);
    var html = Html('#tPrompt', {
        id : id,
        prompt : prompt
    })
    if(this.promptList[id]){
        this.query.find('#'+id).replaceWith(html);
    } else {
        this.promptList[id] = prompt;
        this.query.find('.qpromt').append(html);
    }
    return id;
}
View.prototype.removePrompt = function(id){
    $('#'+id).remove();
    this.promptList[id] = null;
}
View.prototype.fillFilter = function(prompt){
    var fpromptModal = this.query.find('.fpromptModal');
    for(var i in prompt){
        if(prompt[i]){
            fpromptModal.find('[name="'+i+'"]').val(prompt[i]);
        }
    }
    
    fpromptModal.modal();
}
View.prototype.addFilter = function(submit){
    
    $('#query'+this.random+'fPrompt').modal('toggle');
    var prompt = this.query.find('.qpromtAdd').serializeObject();
    this.query.find('.qpromtAdd')[0].reset();
    if(prompt.name && prompt.name.trim()){
        var id = this.appendPrompt(prompt);
        $('#'+id).focus();
    }
    if(submit){
        this.submit();
    }
}

View.prototype.activate = function(){

    $(".viewnav.active").removeClass('active');
    this.nav.addClass('active');


    $(".query.active").removeClass('active');
    this.query.addClass('active');


    $(".result.active").removeClass('active');
    this.result.addClass('active');

};

View.prototype.submit = function(data){
    
    var _this = this;
    var dataObject = data || this.query.find('.viewForm').serialize();

    if(!(this.query.find('.qcollection').val())){
        $(".collections").addClass('active');
    } else {
        this.actionStart('submit');
        $.ajax({
            url : APP_PATH+'collection',
            data : dataObject
        }).done(function(data){
            $('.views').scrollTop(0);
            _this.actionStop('submit');
            _this.appendSuccess(data);
        }).error(function(xhr){
            _this.actionStop('submit');
            _this.appendError(xhr);
        });
    }
};

View.prototype.reset = function(){
    this.query.find('.viewform')[0].reset();
}

View.prototype.remove = function(){
    var toFocus = this.nav.prev().length ? this.nav.prev() : this.nav.next();
    this.nav.remove();
    this.query.remove();
    this.result.remove();
    toFocus.click();
};

View.prototype.actionStart = function(action){
    this.nav.find('.vn-name .glyphicon').addClass('glyphicon-repeat gly-spin');
    this.query.find('.queryActions .submit .glyphicon').addClass('gly-spin');
}
View.prototype.actionStop = function(action){
    this.query.find('.queryActions .submit .glyphicon').removeClass('gly-spin');
        this.nav.find('.vn-name .glyphicon').removeClass('glyphicon-repeat gly-spin');
}

View.prototype.appendSuccess = function(data){
    this.result.html(Html('#tResultTop', {meta : data.meta}));
    var resultSet = this.result.find('.result-set');
    if(data.result.length){
        var result = Result(this, data.meta.context.collection);
        if(data.meta.context.action === 'find'){
            data.result.forEach(function(item, index){
                resultSet.append(result.item(item, index, data.result.length));
            });
        } else {
            data.result.forEach(function(item, index){
                resultSet.append(result.string(item, index, data.result.length));
            });
        }
        result.end();
    } else {
        
    }
}

View.prototype.appendError = function(error){
    this.result.html(Html('#tResultError', error));
}

View.prototype.bindEvents = function(){
    var to = this;
    to.nav.click(function(event){
        to.activate(event);
    });
    to.nav.find('.remove').click(function(event){
        event.preventDefault();
        to.remove();
    });
    to.query.find('.qcollection').click(function(event){
        $(".collections").addClass('active');
    });
    to.query.find('.viewform').submit(function(event){
        event.preventDefault();
        to.submit();
    });
    to.query.find('.reset').click(function(event){
        to.reset();
    });
    to.query.find('.remove').click(function(event){
        to.remove();
    });
    to.query.find('.qpromtAdd').submit(function(event){
        event.preventDefault();
        to.addFilter(true);
    }); 
    to.query.find('.btnAddFilter').click(function(event){
        event.preventDefault();
        to.addFilter();
    });
    to.query.find('.removePrompt').click(function(event){
        to.removePrompt($(this).data('remove'));
    })
};

