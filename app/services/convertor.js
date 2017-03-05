var  _lodash = require('lodash'),
    ObjectId = require('mongoose').Types.ObjectId;

module.exports = {
    operatorsMap : {},

    getData : function(){
        return {
            operators : Object.keys(this.operators()),
            dataTypes : Object.keys(this.dataTypes())
        }
    },

    convert : function(operator, value, dataType){
        var operatorFn = this.operators(operator, value);
        var dataTypeFn = this.dataTypes(dataType);
        if(value === '' || !operatorFn){
            return null;
        }
        var obj = {
            operatorKey : this.operatorsMap[operator] || '$'+operator,
            operatorValue : operatorFn(dataTypeFn)
        };
        return obj;
    },

    operators : function(operator,value){

        var items = {
            eq : function(dataTypeFn){
                return dataTypeFn(value);
            },
            gt : function(dataTypeFn){
                return dataTypeFn(value);
            },
            lt : function(dataTypeFn){
                return dataTypeFn(value);
            },
            gte : function(dataTypeFn){
                return dataTypeFn(value);
            },
            lte : function(dataTypeFn){
                return dataTypeFn(value);
            },
            in : function(dataTypeFn){
                //return JSON.parse('['+value+']');
                var out = [];
                if(!_lodash.isArray(value)){
                    value = [value];
                }
                value.forEach(function(inValue){
                    out.push(dataTypeFn(inValue));
                });
                return out;
            }
        }
        if(operator){
            return items[operator];
        }

        return items;
    },

    dataTypes : function(dataType){

        var items = {
            string : function(value){
                if(value !== '')
                    return value;
            },

            number : function(value){
                if(value !== '')
                    return parseFloat(value);
            },

            date : function(value){
                if(value !== '')
                    return new Date(value);
            },

            id : function(value){
                if(value !== '')
                    return new ObjectId(value);
            },

            boolean : function(value){
                if(value === 'true' || value == '1'){
                    return true;
                }
                return false;
            }
        };
        if(dataType){
            if(_lodash.isArray(dataType)){
                dataType = _lodash.last(dataType);
            }
            return items[dataType] || items.string;
        }

        return items;
    },

    convertToValue : function(value, dataType){
        var dataTypeFn = this.dataTypes(dataType);
        if(dataTypeFn){
            return dataTypeFn(value);
        }
        return value;
    }

}

