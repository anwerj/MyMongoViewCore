var views = require('../../services/views');

module.exports = {
    all : function(req, res){
        var v = new views(req.params._con);
        res.send(v.all());
    },

    one : function(req, res){
        var v = new views(req.params._con);
        res.send(v.one(req.query.name));
    },

    upsert : function(req, res){
        var v = new views(req.params._con);
        res.send(v.upsert(req.body));
    }
};
