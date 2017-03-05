function Handler(message, type){
    console.log(message, type);
}
Handler.prompt = function(text){
    return confirm(text);
}