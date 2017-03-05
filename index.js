module.exports = {

    run : function(config){

        //Bootstrap Configs And Databases
        require('./app/bootstrap/config')(config, function(err){
            if(err){ throw err; }

            // Bootstrap Connections
            require('./app/bootstrap/db')(function(){

                //Bootstrap App
                require('./app/bootstrap/app')();
            });
        });
    }

};