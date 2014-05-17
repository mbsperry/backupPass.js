/*global $:false, document:false */
// Client side jquery logic for BackupPass
// Copyright Matthew Sperry 2014, distributed under the MIT license
// Turn on jQuery options for JSHint
//

/* 
 * Legacy App for use in ancient versions of IE
 */


$(document).ready(function() {
  var csrfToken;
  var bad_loginHTML = "Invalid Credentials";
  $.get('/version', function(data) {
    $("#version").html(data);
  });

  var get_csrf_token = function() {
    $.get('/session', function(data) {
      csrfToken = data.Token;
    });
  };
  get_csrf_token();

  var send_ajax_post = function(url, data, success) {
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

  var key_submit = function() {
    var parameters = {key: $("#key").val()};
    var success = function(data, _, xhr) {
      if (data.response === true) {
        $("#verify").hide();
        var $parent = $("#content");
        var width = $(window).width();
        var height = $("#key_div").height();
        var position = $("#key_div").offset();
         
        // Cludge to keep parent from collapsing
        // when position is set to absolute...
        $parent.css({height: height});

        $("#key_div").css({left: position.left, position: 'absolute'});
        $("#pass_div").hide().css({left: width, position: 'absolute'});

        $("#key_div").animate({left: -width},500);

        $("#pass_div").show().animate({left: position.left}, 500, function() {
          $("#pass_div").css({left: null, position: null});
          $("#key_div").hide();
          $("#key_div").css({left: null, position: null});
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

  var pass_submit = function () {
    $("#pass_form").hide("fast", function() {

      // Reset content div height back to auto... kludge
      $("#content").css({height: 'auto'});

      $("#input").css("padding-top", "10px");
      $("#input").css("padding-bottom", "10px");
      $("#input").css("text-align", "left");
      $("#acct_div").show("fast");
      var parameters = { pass: $("#pass").val() };

      var success = function(data, _, xhr) {
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
    var html = "";
    var index = $(".acct").index(this);
    var acct = $(".acct").eq(index).text();
    var parameters = { index: index };
    var success = function(data, _, xhr) {
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

