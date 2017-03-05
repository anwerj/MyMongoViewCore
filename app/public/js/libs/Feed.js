function Feed(data){
    this.list = loadFeeds(data);
}

Feed.prototype.activate = function(callback){

    var def = $.map(this.list, function(item){
        var options = {
            url : APP_PATH+'collections/'+item.type,
            data : item,
            dataType : 'JSON'
        };
        return $.ajax(options).done(function(data){
            Storage.set(item.collection + "-" + item.key, data);
        });
    });
    $.when.apply($, def).then(function() {
        callback();
    });
};
var loadFeeds = function(data){
    var out = [];
    var collection = data.collection;
    if(data.prompt){
        for(var i in data.prompt){
            cpromt = data.prompt[i];
            if(cpromt.type == 'dropdown'){
                out.push({type : 'feed', collection : collection, key : cpromt.name});
            }
        }
    }
    return out;
};
Feed.load = function(collection, key){
    return Storage.get(collection + '-' + key, true);
}
