
module.exports = function(request, response, next){
    setTimeout(function(){
        next();
    }, (request.query.action == 'find' ? 000 : 00));
};
