var promise = require('bluebird').Promise;

module.exports = function(overide, callback){

    var config = {
        port : overide.port || 12098,
        default : overide.default || 0,
        connections : overide.connections || 'connections',
        views : overide.views || 'views',
        timezone : overide.timezone || 'Etc/GMT'
    };

    process.env.TZ = config.timezone;

    global._mmv = { Promise : promise, config : config, Connections : []};

    callback();
};
