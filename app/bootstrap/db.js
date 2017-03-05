var mongoose = require('mongoose');

module.exports = function db(callback){

    mongoose.Promise = _mmv.Promise;

    var connections = _mmv.config.connections;

    return _mmv.Promise.map(connections, function(connection, index){
        var connection = mongoose.createConnection(connection.string, connection.option, connection.config);
        connection.on('error', function(err){
            console.log(err);
        })
        return connection;
    }).then(function(connecteds){
        _mmv.Connections = connecteds;
        callback();
    }).catch(function(err){
        callback(err);
    })
}
