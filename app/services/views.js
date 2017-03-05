var path = require('path'),
    fs = require('fs');

function views(connect){
    this.connect = connect;
    this.container = __dirname+'/../../../../'+ _mmv.config.views+'/' + _mmv.config.connections[connect].container + '/';
}

views.prototype.one = function(key){
    var file = this.container+'view/'+key;
    if(fs.existsSync(file)){
        return require(file);
    }
}

views.prototype.all = function(){
    var files = fs.readdirSync(this.container+'view');
    return files;
}

views.prototype.upsert = function(data){
    var name = data.name, content;

    if(!data.content || !data.content.name){
        throw new Error('Invalid Content');
    }

    if(name && name.endsWith('.js')){
        content = 'module.exports='+JSON.stringify(data.content, null, 4);
    } else if(name && name.endsWith('.json')){
        content = JSON.stringify(data.content, null, 4);
    } else {
        throw new Error('Invalid Name');
    }
    var file = this.container+'view/'+name;
    var updated = fs.writeFileSync(file, content);
    console.log(updated);
    if(fs.existsSync(file)){
        delete require.cache[require.resolve(file)];
        return require(file);
    }
}

/* Cache Only */
views.prototype.get = function(type, key){
    var file = this.container+type+'/'+key+'.'+this.connect+'.json';
    if(fs.existsSync(file)){
        delete require.cache[require.resolve(file)];
        return require(file);
    }
}
views.prototype.set = function(type, key, data){
    var file = this.container+type+'/'+key+'.'+this.connect+'.json';
    return fs.writeFileSync(file, JSON.stringify(data, null, 4));
}

module.exports = views;
