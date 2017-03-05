var _lodash = require('lodash'), 
    marked = require('marked'),
    fs = require('fs'),
    Promise = require('bluebird').Promise;

module.exports = {
    
    docToJs : function(filename){
        var text = fs.readFileSync(filename, "utf8");
        return marked(text);
    }
    
}