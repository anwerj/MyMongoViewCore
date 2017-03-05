$(document).ready(function(){
    
    $(document).keypress(function(event){

        if(event.ctrlKey){
            handleWithControl(event);
        }
    });

    var handleWithControl = function(e){
        if(e.keyCode == 10){
            $(".query.active .submit").click();
        }
    };
    
    toggleInput = function(selector){
        if($(selector).hasClass('disabled')){
            $(selector).removeClass('disabled').attr('disabled', null);
        } else {
            $(selector).addClass('disabled').attr('disabled', 'disabled');
        }
    }
});
