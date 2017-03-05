function Result(view, collection){
    
    return {
        item : function(item, index, count){
            var result = $(Html('#tResultSet', {
                random : view.random,
                item : item,
                collection : collection,
                join : view.view.join
            }));
            this.bindEvents(result);
            if(count < 10){
                this.beautifyToggle(result);
            }
            return result;
        },
        string : function(item, index, count){
            return $(Html('#tResultList', { item : item }));
            
        },
        
        expandToggle : function(to, force){

            var resultItems = to.find('.result-items');

            if(!to.hasClass('expanded') || force){
                to.addClass('expanded');
                to.find('.ra-expand').html('Shrink');
            }else{
                to.removeClass('expanded');
                to.find('.ra-expand').html('Expand');
            }
        },
        beautifyToggle : function(to, force){

            if(!to.hasClass('beautified') || force){
                this.expandToggle(to, true)
                var beautified = to.find('.result-data-beautified');
                if(!beautified.hasClass('beautified')){
                    var html = $(Html.beautify(JSON.parse(to.find('.result-data-prettified').text())));
                    this.bindBeautifulEvents(html);
                    beautified.html(html).addClass('beautified');
                }
                // Add beautify
                to.addClass('beautified');
                to.find('.ra-beautify').html('Prettify');
            }
            else {
                to.removeClass('beautified');
                to.find('.ra-beautify').html('Beautify');
            }
        },
        
        fireJoin : function(to, join){
            
            var onField = join.data('on-field');
            var fromField = join.data('from-field');
            var onItem = to.find('.rbval[data-key="'+fromField+'"]');
            var inFilter = {
                dataType : onItem.data('value-type'),
                operators : {
                    eq : onItem.data('value')
                }
            }
            var obj = {
                action : 'find',
                name : join.data('to-collection')+'['+onField+'='+onItem.data('value').substr(0,20)+']',
                collection : join.data('to-collection'),
                prompt : {},
                select : join.data('collection-select')
            }
            obj.prompt[onField] = inFilter;
            var nView = new View(obj, view.random);
            nView.activate();
            nView.submit();
            
        },
        
        appendSuccess : function(to, data){
            to.find('.result-join-top').html(Html('#tResultTop', {context : data.context, query : data.query}));
            var resultSet = to.find('.result-join-items');
            var result = Result(this, '#tResultSetInternal');
            if(data.result.length){
                data.result.forEach(function(item, index){
                    resultSet.append(result.item(item, index));
                });
            } else {
                
            }
        },
         
        bindEvents : function(to){
            var _this = this;
            to.find('.ra-expand').click(function(){
                _this.expandToggle(to);
            });

            to.find('.ra-beautify').click(function(){
                _this.beautifyToggle(to);
            });
            to.find('.ra-join').click(function(){
                _this.beautifyToggle(to, true);
                _this.fireJoin(to, $(this));
            });
            to.find('.ra-refresh').click(function(){
                _this.refreshResult(to);
            });
            to.find('.ra-update').click(function(){
                _this.refreshResult(to, true);
            });
            to.find('.ra-delete').click(function(){
                _this.deleteResult(to);
            });
            to.rotator = function(stop){
                to.find('.ra-rotator .glyphicon').removeClass('hide').addClass('glyphicon-repeat gly-spin');
            }
        },
        
        resultKeyClick : function(to){

            var keyType = to.data('key-type');
            if(keyType === 'object'){
                return Handler('Objects can not be searched as whole') ;
            }
            var item = to.parent().find('.rbval');
            var prompt = {
                name : to.data('key'),
                operator : 'eq',
                value : item.text(),
                dataType : item.data('value-type')
            };
            view.fillFilter(prompt);
            
        },
        
        bindBeautifulEvents : function(to){
            var _this = this;
            to.find('.rbkey').click(function(){
                _this.resultKeyClick($(this));
            });
            to.find('.rbval').click(function(){
                $(this).find('.rbval').attr('spellcheck', 'false').focus();
            });
            to.find('.rbval').blur(function(){
                var oldVal = $(this).data('value');
                var newVal = $(this).text();
                if($(this).data('value-type') === 'boolean'){
                    newVal = (newVal == 'true');
                }
                if(oldVal == newVal){
                    $(this).parent().removeClass('rbval-updated');
                } else {
                    $(this).parent().addClass('rbval-updated');
                }
                _this.activateUpdateView(to);
            });
            to.find('.rbval-reset').click(function(){
                var rbval = $(this).parent().prev();
                rbval.text(rbval.data('value')).blur();
            });
        },
        
        end : function(){
            this.bindEndEvents();
        },
        
        bindEndEvents : function(){
            
            view.result.find('.rNextPage').unbind('click').click(function(event){
                event.preventDefault();
                var prompt = {
                    name : $(this).data('sort-on'),
                    operator : $(this).data('sort-order') == '1' ? 'gt' : 'lt',
                    value : $(this).data('last-entry'),
                    dataType : $(this).data('entry-type')
                };
                view.query.find('.qpage').val(1);
                view.fillFilter(prompt, true);
            });
        },
        
        activateUpdateView : function(to, set){
            var updated = $(to).find('.rbval-updated .rbval:not([data-key="_id"])').toArray();
            if(!set){
                return;
            }
            if(!updated.length){
                return Handler('No field select to Update.');
            }
            
            var set = {};
            updated.forEach(function(item, index){
                set[$(item).data('key')] = {
                    value : $(item).text(),
                    dataType : $(item).data('value-type')
                }
            });
            return set;
        },
        
        refreshResult : function(to, updated){
            var filter = {_id : { operators : {eq : to.data('value')}, dataType : to.data('value-type')} };
            var set = this.activateUpdateView(to, updated);
            if(updated && !set){
                return;
            }
            to.rotator();
            $.ajax({
                url : APP_PATH+'collection/refresh',
                data : {action : 'refresh', collection : to.data('collection'),filter : filter, toUpdate : {$set : set}}
            }).done(function(data){
                to.rotator(true);
                var result = new Result(view, collection);
                to.replaceWith(result.item(data.result[0], 0, 1));
            }).error(function(xhr){
                to.rotator(true);
                view.appendError(xhr);
            });
        },
        
        deleteResult : function(to, force){
            var filter = {_id : { operators : {eq : to.data('value')}, dataType : to.data('value-type')} };
            if(!(force || Handler.prompt('Are you sure about deleting : '+ to.data('value')))){
                return;
            }
            to.rotator();
            $.ajax({
                url : APP_PATH+'collection/delete',
                data : {action : 'delete', collection : to.data('collection'),filter : filter}
            }).done(function(data){
                to.remove();
            }).error(function(xhr){
                to.rotator(true);
                view.appendError(xhr);
            });
        }
    }
}