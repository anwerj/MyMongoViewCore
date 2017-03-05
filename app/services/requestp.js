var _lodash = require('lodash'),
    convertor = require('./convertor');

module.exports = {

    toContext : function(context){
        console.log(context);
        context.order = this.toOrder(context.orderOn);
        context.sort = this.toSort(context.sortOn, context.order);
        context.skip = this.toSkip(context.page, context.limit);
        context.limit = this.toLimit(context.limit);
        context.filter = this.toData(context.filter);
        if(context.action === 'aggregate'){
            context.group = this.toGroup(context.group);
            context.sum = this.toSum(context.sum);
            context.aggregate = this.toAggregate(context);
            context.aggregateOption = this.toAggregateOption(context);
        } else if(context.action === 'findOne'){
            context.action = 'find';
            context.limit = 1;
        } else if(context.action === 'distinct'){
            context.key = this.toKey(context.key);
        }
        if(context.toUpdate){
            if(context.toUpdate.$set){
                context.updated = this.toSet(context.toUpdate.$set);
            }
        }
        return context;
    },

    toOrder : function(order){
        return order == 'ASC' ? 1 : -1;
    },

    toSort : function(sort, order){
        var toReturn = {};
        toReturn[sort || '_id'] = order;
        return toReturn;

    },

    toSkip : function(page, limit){
        page = page || 1;
        return parseInt((page-1) * limit) || 0;
    },

    toGroup : function(group){
        return '$'+(group || '_null');
    },

    toSum : function(total){
        return total == 1 ? 1 : '$'+total;
    },

    toLimit : function(limit){
        return parseInt(limit) || 10;
    },
    
    toKey : function(key){
        return new String(key).toString();
    },
    
    toData : function(input){

        var out = {};

        _lodash.each(input,function(obj, keyName){
            if(obj){
                _lodash.each(obj.operators, function(value, operator){
                    var inset = convertor.convert(operator, value, obj.dataType);
                    if(inset){
                        if('undefined' === typeof out[keyName]){
                            out[keyName] = {};
                        }                        
                        out[keyName][inset.operatorKey] = inset.operatorValue;
                    }
                });
            }
        });

        return out;
    },
    
    toSet : function(input){
        
        if(input){
            var set= {};
            _lodash.each(input, function(obj, keyName){
                set[keyName] = convertor.convertToValue(obj.value, obj.dataType);
            })
        } 
        return {$set : set};
    },
    
    toAggregate : function(context){
        var acc = {};
        var accumulator_field = context.accumulator_field 
            && (context.accumulator_field.indexOf('$') === 0) 
            && context.accumulator_field;
        acc['$'+context.accumulator] = accumulator_field || 1;
        return [
            { $match : context.filter },
            { $group : { _id : context.group, acc : acc}},
            { $sort : { _id : context.order}},            
            { $skip : context.skip },
            { $limit : context.limit },
        ];
    },
    
    toAggregateOption : function(context){
        return {};
    },
    
    getResponse : function(context, service){
        return {
            meta : {
                query : service.getQuery(context),
                startAt : Date.now(),
                endAt : null,
                count : null,
                hasMore : false,
                context : context
            },            
            result : []
        };
    },
    
    finalizeResponse : function(response, result){

        response.meta.endAt = Date.now();
        response.meta.count = result.count;
        response.result = result.result;

        if(response.meta.count > (response.meta.context.skip + response.meta.context.limit)){
            response.meta.hasMore = true;
            if(response.meta.context.sortOn === '_id'){
                response.meta.lastEntry = _lodash.last(response.result)['_id'];
            }
        }

        return response;
    }
    

};
