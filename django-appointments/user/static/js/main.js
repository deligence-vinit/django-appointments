function verify(){
    document.getElementById('link').value=window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
    if (document.getElementById('username').value){
    $.ajax({
        type: "POST",
        url: "/check_username/",
        data: {
          'username': $('#username').val(),
        },
        success: function (resp) {
        if (resp.status == 'available'){
        if(document.getElementById('pass1').value === document.getElementById('pass2').value){
          document.getElementById('submit').click();
          document.getElementById('message').innerHTML=''
        }
        else{
            document.getElementById('message').innerHTML='Password does not match'
        }
    }
        else{
            document.getElementById('message').innerHTML='Already Registred, Please login'
        }
    }
      });
    }
    else{
        document.getElementById('message').innerHTML='Email-Id cannot be blank'
    }
}

