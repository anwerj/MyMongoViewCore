$(document).ready(function(){

    var xhr = $.ajax({
        url : APP_PATH+'views',
        dataType : 'JSON'
    });
    xhr.done(function(data){
        $("#views-list").html(Html('#tViewSide',{views : data}));
        activateViewList();
        activateHash();
        $('#'+APP_HASH.i+'_item').click();
    }).error(function(xhr){
        $('.results').removeClass('rows').html(xhr.responseText);
    });

    var activateViewList = function(){

        $(".viewname").unbind('click').click(function(event){
            
            var viewname = $(this).data('name');
            var index = $(this).data('index');

            var xhr = $.ajax({
                url : APP_PATH+'view',
                data : {name:viewname},
                dataType : 'JSON'
            });
            xhr.done(function(data){
                var v = new View(data);
                v.activate();
                if(APP_HASH.s){
                    v.submit();
                }
            });
        });
    };
    
    var activateHash = function(){
        var hash = window.location.hash.slice(1).split('/');
        APP_HASH = {};
        hash.forEach(function(item){
            var inHash = item.split(':');
            APP_HASH[inHash[0]] = inHash[1];
        });
    }
    
    $(".viewlist .title").click(function(){
        $(this).parent().toggleClass('active');
    });
    
    $('.collectionbtn').click(function(){
        $(".query.active .qcollection").val($(this).data('collection'));
        $(".collections").removeClass('active');
    });
    
    $('.collist').click(function(){
        $(".collections").toggleClass('active');
    });
    
    $('.results').click(function(){
        $(".collections").removeClass('active');
    })
    
    $('#connect').change(function(){
        var newCon = $(this).val();
        var location = APP_HOST+'c/'+newCon+'/'+window.location.hash;
        window.location = location;
    });
    
    $('#searchCollection').keyup(function(){
        var val = $(this).val().toLowerCase().trim();
        $('.collectionbtn').each(function(index, item){
            var cname = $(item).data('collection');
            if(cname.toLowerCase().indexOf(val) === -1){
                $(item).addClass('hide');
            } else {
                $(item).removeClass('hide');
            }
        })
    });
    
    $('#refreshCollection').click(function(){
        $(this).find('span').addClass('gly-spin');
        var xhr = $.ajax({
            url : APP_PATH+'collections',
            data : {force : true},
            dataType : 'JSON'
        });
        xhr.done(function(data){
            window.location.reload();
        });
    })
    
});
