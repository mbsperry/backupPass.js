/*global $:false, document:false */
// Client side jquery logic for BackupPass
// Copyright Matthew Sperry 2014, distributed under the MIT license
// Turn on jQuery options for JSHint
//

/* 
 * Legacy App for use in ancient versions of IE
 */


$(document).ready(function() {
  var csrfToken
    , bad_loginHTML = "Invalid Credentials"
    , get_csrf_token
    , send_ajax_post
    , key_submit
    , pass_submit

  $.get('/version', function(data) {
    $("#version").html(data);
  });

  get_csrf_token = function() {
    $.get('/session', function(data) {
      csrfToken = data.Token;
    });
  };
  get_csrf_token();

  send_ajax_post = function(url, data, success) {
    $.ajax({
      type: "POST",
      headers: {'X-CSRF-TOKEN': csrfToken},
      url: url,
      contentType: 'application/json',
      data: JSON.stringify(data),
      dataType: "json",
      success: success,
      error: function() {
        $("#verify").show("fast");
        $("#verify #e").text("Error");
        $("#verify #msg").html(bad_loginHTML);
      }
    });
  };



  $("#key").focus();

  key_submit = function() {
    var parameters = {key: $("#key").val()}
      , width
      , success = function(data, _, xhr) {
      if (data.response === true) {
        $("#verify").hide();
        width = $("#content").width();

        $(".input_div").css({position: 'relative'})
          .animate({left: "-50%"}, 500, function() {
            $(this).css({position: null});
            //Take pass_form out of #login_divs so it doesn't move when
            //we hide the #key_form
            $("#pass_form").appendTo($("#content"));
            $("#key_div").hide();
            $("#pass").focus();
        });

        csrfToken = xhr.getResponseHeader('X-CSRF-TOKEN');
      }
    };
    send_ajax_post('session/auth', parameters, success);
  };

  $('#key').keypress(function (e) {
    if (e.which == 13) {
      key_submit();
      return false;    //<---- Add this line
    }
  });

  $('#key_form .form_button').click(function() {
    key_submit();
  });

  pass_submit = function () {
    $("#pass_form").hide("fast", function() {
      var parameters
        , success

      // Reset content div height back to auto... kludge
      $("#content").css({height: 'auto'});

      $("#input").css("padding-top", "10px");
      $("#input").css("padding-bottom", "10px");
      $("#input").css("text-align", "left");
      $("#acct_div").show("fast");
      parameters = { pass: $("#pass").val() };

      success = function(data, _, xhr) {
        var listSize,
        html = "";
        data.forEach(function(entry) {
          html += "<p class='acct'>" + entry + "</p>";
        });
        listSize = data.length * 1.5;
        if (listSize > 12) {
          $("#accounts").css("height", '12em');
        }
        $("#accounts").html(html);
        $("#verify").hide("fast");
        $("#acct_div").show("fast");
        csrfToken = xhr.getResponseHeader('X-CSRF-TOKEN');
      };

      send_ajax_post('/session/secure/list', parameters, success);
    });
  };

  $("#pass").keypress(function (e) {
    if (e.which == 13) {
      pass_submit();
      return false;
    }
  });

  $("#pass_form .form_button").click(function() {
    pass_submit();
  });

  $("#accounts").on('click', '.acct', function() {
    var html = ""
      , index = $(".acct").index(this)
      , acct = $(".acct").eq(index).text()
      , parameters = { index: index }
      , success
    
    success = function(data, _, xhr) {
      $("#accounts").hide();
      html += "<tr><td>Username:</td><td class='td_body'>" + data.username + "</td></tr>";
      html += "<tr><td>Password:</td><td class='td_body'>" + data.password +"</td></tr>";
      html += "<tr><td>Notes:</td><td class='td_body'>" + data.notes + "</td></tr>";
      $("#acct_div acct_headline").text(acct);
      $("#acct_div #acct_table").html(html).show();
      csrfToken = xhr.getResponseHeader('X-CSRF-TOKEN');
    };

    send_ajax_post('/session/secure/show', parameters, success);
  });
});

