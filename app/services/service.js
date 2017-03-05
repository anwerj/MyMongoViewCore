var  _lodash = require('lodash'),
    views = require('./views'),
    ObjectId = require('mongoose').Types.ObjectId;

function service(connect, collection){
    this.connect = connect;
    this.connection = _mmv.Connections[connect];
    this.config = 
    this.collectionName = collection;
    if(collection)
        this.collection = this.connection.db.collection(collection);
    return this;
}

service.prototype.collections = function(forceRefresh){
    var _this = this;
    var view = new views(this.connect);
    var cached = view.get('cache','_collections');
    var query = new _mmv.Promise(function(resolve, reject){
        try{
            if(!cached || forceRefresh){
                return _this.connection.db
                    .listCollections().toArray().then(function(data){
                        return _mmv.Promise.map(data, function(item){
                            return _this.connection.db.collection(item.name).count()
                                .then(function(count){
                                    item.count = count;
                                    return item;
                                }).catch(function(err){
                                    item.count = 0;
                                    return item;
                                })
                        }).then(function(result){
                            console.log('Refreshing Collections with', forceRefresh);
                            view.set('cache','_collections', result);
                            return resolve(result);
                        });
                    });
                } else {
                    console.log('Return Cached Collection count:' + cached.length);
                }
            return resolve(cached);
        } catch(err){
            return reject(err);
        }
    });
    
    return query;
};

service.prototype.distinct = function(context){
    var query = this.collection
                .distinct(context.key, context.filter);
    
    return query;
};

service.prototype.find = function(context){
    var query = this.collection
                .find(context.filter)
                .sort(context.sort)
                .skip(context.skip)
                .limit(context.limit)
                .toArray();

    return query;
};

service.prototype.count = function(context){
    var filter = (context && context.filter) || {};
    var query = this.collection
                .find(filter)
                .count();

    return query;
}

service.prototype.aggregate = function(context){

    var query = this.collection
                .aggregate(context.aggregate, context.aggregateOption).toArray();

    return query;
};

service.prototype.findOne = function(context){

    var query = this.collection
                .find(context.filter).limit(1).toArray()
                .then(function(response){
                    return response[0];
                });

    return query;
}

service.prototype.update = function(context){
    var query = this.collection
                .update(context.filter, context.updated);

    return query;
}

service.prototype.delete = function(context){
    var query = this.collection
                .remove(context.filter);

    return query;
}
service.prototype.getQuery = function(context){
    var queryString = 'db.'+this.collectionName+'.'+context.action+'(';
    switch(context.action){
        case 'distinct':
            queryString+= '"'+context.key+'", '+this.stringify(context.filter)+')';
            break;
        case 'find':
            queryString+= this.stringify(context.filter)+').sort('+JSON.stringify(context.sort)+')';
            if(context.skip){
                queryString+='.skip('+context.skip+')';
            }
            queryString+='.limit('+context.limit+')';
            break;
        case 'aggregate':
            queryString+=JSON.stringify(context.aggregate)+','+JSON.stringify(context.aggregateOption)+')';
            break;        
    }
    return queryString;
};

service.prototype.stringify = function(item){
    var str = '{', c;
    for(var i in item){
        c = item[i];
        if(Date.prototype.isPrototypeOf(c)){
            str+= '"'+i+'"'+': ISODate("'+c.toISOString()+'"),'
        } else if(c instanceof ObjectId){
            str+= '"'+i+'"'+': ObjectId("'+c+'"),'
        } else {
            str+= '"'+i+'"'+':' + 
            (_lodash.isArray(c) ? JSON.stringify(c) : 
                ('object' === typeof c ? this.stringify(c) : 
                    ('boolean' === typeof c ? c : 
                        ('number' === typeof c ? c : '"'+c+'"'))))
            +","
        }
    }
    if(str[str.length-1] === ','){
        str = str.slice(0, -1);
    }
    str+= '}';
    return str;
}

module.exports = service;
