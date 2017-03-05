var service = require('../../services/service'),
    requestp = require('../../services/requestp');


module.exports = {
    all : function(req, res){

        var s = new service(req.params._con);
        s.collections(req.query.force).then(function(names){
            res.send(names);
        });

    },

    query : function(req, res){
        var context = requestp.toContext(req.query), r;
        var s = new service(req.params._con, context.collection);
        var response = requestp.getResponse(context,s);
        switch(context.action){

            case 'find':
                r = s.count(context)
                .then(function(count){
                    if(count){
                        return s.find(context)
                            .then(function(result){
                                return { result : result, count : count};
                            });
                    }
                    return { result : [], count : count};
                });
                break;

            case 'findOne':
                r = s.findOne(context)
                    .then(function(result){
                        return { result : result}
                    });
                break;

            case 'aggregate':
                r = s.aggregate(context)
                    .then(function(result){
                        return { result : result}
                    });
                break;

            case 'distinct':
                r = s.distinct(context)
                    .then(function(result){
                        return { result : result}
                    });
                break;

            default:
                return res.status(500).send('Invalid Action');
        }

        r.then(function(result){
            res.json(requestp.finalizeResponse(response, result));
        }).catch(function(err){
            console.log(err.stack);
            res.status(500).send(err.toString());
        });

    },

    feed : function(req, res){

        var context = requestp.toContext(req.query);
        
        new service(req.params._con, context.collection).distinct(context)
            .then(function(names){
                res.send(names);
            }).catch(function(err){
                res.status(500).send(err);
            });
    },
    
    refresh : function(req, res){
        var context = requestp.toContext(req.query), r;
        var s = new service(req.params._con, context.collection);
        var response = requestp.getResponse(context,s);
        var callback = function(err, result){
            if(err){
                return res.status(500).send(err);
            }
            res.json(requestp.finalizeResponse(response, { result : result}));
        }
        if(context.updated){
            r = s.update(context)
                .then(function(updated){
                    s.find(context)
                    .then(function(result){
                        callback(null, result);
                    })
                });
        } else {
            r = s.find(context)
            .then(function(result){
                callback(null, result);
            })
        }
        r.catch(function(err){
            callback(err);
        });
    },
    
    delete : function(req, res){
        var context = requestp.toContext(req.query), r;
        var s = new service(req.params._con, context.collection);
        var response = requestp.getResponse(context,s);
        s.delete(context)
        .then(function(result){
            res.json(requestp.finalizeResponse(response, { result : result}));
        })
        .catch(function(err){
            res.status(500).send(err);
        })
    }

};
