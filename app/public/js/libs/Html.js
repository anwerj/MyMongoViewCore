function Html(selector, render){
    return new EJS({text : $(selector).html()}).render(render);
}
Html.beautify = function(item, key){
    
    return Html('#tResultBeauty', { item : item, key : key, lkey : null});
    
}
Html.valueType = function(item){
    var typeOf = typeof item;
    var valueType = 'string';

    if(typeOf === 'number'){
        valueType = 'number';
    } else if(typeOf === 'boolean'){
        valueType = 'boolean';
    } else if(Html.isDate(item)) {
        valueType = 'date';
    } else if(Html.isObjectId(item)) {
        valueType = 'id';
    }
    return {valueType : valueType, value : item};
}
Html.isDate = function(value){
    return isFinite(new Date(value)) && value.match(/^\d{4}-\d{2}-\d{2}/);
}
Html.isObjectId = function(value){
    return value.match(/^[0-9a-fA-F]{24}$/);
}
Html.clean = function(str){
    return str.replace(/\./g, '-');
}