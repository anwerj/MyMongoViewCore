function Storage(){}
Storage.set = function(key, value){
    if(typeof value == 'object'){
        value = JSON.stringify(value);
    }
    return localStorage.setItem(APP_CONNECTION+'.'+key, value);
};

Storage.get = function(key, json){
    var value = localStorage.getItem(APP_CONNECTION+'.'+key);
    if(json){
        value = JSON.parse(value);
    }
    return value;
};
