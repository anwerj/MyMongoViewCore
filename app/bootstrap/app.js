var express = require('express'),
    app = express(),
    path = require('path'),
    bodyParser = require('body-parser'),
    service = require('../services/service'),
    ejs = require('ejs'),
    convertor = require('../services/convertor'),
    helper = require('../services/helper');

module.exports = function(){

    app.get('/health', function(req, res) {
        res.json({
            status : 'success'
        });
    });

    app.use(function(err, req, res, next) {
        res.status(500).send({
            message: 'Error!',
            error: err.stack
        });
    });

    app.use(bodyParser.json()); // to support JSON-encoded bodies
    app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
        extended: true
    }));

    app.get('/', function(req, res){
        res.redirect('/m/c/'+(_mmv.config.default || 0)+'/');
    });

    app.get('/:_dump/c/:_con', function (req, res) {

        var s = new service(req.params._con);
        _mmv.Promise.props({
            appPath : req.protocol + '://' + req.get('host') +'/'+ req.params._dump + '/',
            conPath : 'c/'+req.params._con+'/',
            params : req.params,
            config : _mmv.config,
            data : convertor.getData(),
            collections : s.collections(),
            docs : helper.docToJs(path.resolve(__dirname + '/../../README.md'))
        }).then(function(content){
            ejs.renderFile(path.resolve(__dirname + '/../public/home.ejs'),content,{delimiter: '?'},function(err, html){
                res.send(html);
            });
        });
    });

    /**
     * Set Static Pages Folder
     */
    app.use('/:_dump/public',express.static(__dirname + '/../public'));

    //Bootstrap routes
    require('../http/routes')(app);

    app.all('*', function(req, res) {
        res.redirect('/m/c/'+(_mmv.config.default || 0)+'/');
    });

    app.listen(_mmv.config.port, function() {
        console.log('Server listening at port %s', _mmv.config.port);
    });

};
