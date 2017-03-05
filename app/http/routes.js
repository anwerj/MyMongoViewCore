var express = require('express'),
    ClientAuth = require('./middlewares/ClientAuthWare'),
    ViewController = require('./controllers/ViewController'),
    CollectionController = require('./controllers/CollectionController');
    
module.exports = function (app, passport) {

    app.use(ClientAuth);

    var connectionRouter = express.Router();
    app.use('/:_dump/c', connectionRouter);

    connectionRouter.get('/:_con/views', ViewController.all);
    connectionRouter.get('/:_con/view', ViewController.one);

    connectionRouter.get('/:_con/collections', CollectionController.all);
    connectionRouter.get('/:_con/collection', CollectionController.query);
    connectionRouter.get('/:_con/collections/feed', CollectionController.feed);
    connectionRouter.get('/:_con/collection/refresh', CollectionController.refresh);
    connectionRouter.get('/:_con/collection/delete', CollectionController.delete);

};
