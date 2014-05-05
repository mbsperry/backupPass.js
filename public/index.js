/*global $:false*/
// Client side jquery logic for BackupPass
// Copyright Matthew Sperry 2014, distributed under the MIT license
// Turn on jQuery options for JSHint
//


$(document).ready(function() {
  var bad_loginHTML = "Incorrect authorization<br>Wait 2 seconds before retrying"
  $.get('/version', function(data) {
    $("#version").html(data);
  });

  $("#key").focus();

  var key_submit = function() {
    $("#key_form").hide("fast", function() {
      var parameters = { key: $("#key").val() };
      var resp = $.post('/session/auth', parameters, function(data) {
        if (data.response === true) {
          $("#pass_form").show("fast");
          $("#pass").focus();
        }
      })
      .fail(function() {
        $("#verify").show("fast");
        $("#verify").html(bad_loginHTML);
      });
    });
  };

  $('#key').keypress(function (e) {
    if (e.which == 13) {
      key_submit();
      return false;    //<---- Add this line
    }
  });

  $("#pass").keypress(function (e) {
    if (e.which == 13) {

      $("#pass_form").hide("fast", function() {
        $("#input").css("padding-top", "10px");
        $("#input").css("padding-bottom", "10px");
        $("#input").css("text-align", "left");
        $("#verify").show("fast");
        var parameters = { pass: $("#pass").val() };
        var result = $.post('/session/secure/list', parameters, function(data) {
          var html = "";
          data.forEach(function(entry) {
            html += "<p class='acct'>" + entry + "</p>";
          });
          $("#accounts").html(html);
          $("#verify").hide("fast");
          $("#acct_div").show("fast");
        })
        .fail(function() {
          $("#accounts").html(bad_loginHTML);
          $("#verify").hide("fast");
          $("#acct_div").show("fast");
        });
      });
      return false;
    }
  });

  $("#accounts").on("mouseover", ".acct", function() {
    $(this).css("font-weight", "bold");
  });
  $("#accounts").on("mouseleave", ".acct", function() {
    $(this).css("font-weight", "normal");
  });

  $("#accounts").on('click', '.acct', function() {
    var html = "";
    var index = $(".acct").index(this);
    var acct = $(".acct")[index];
    var parameters = { index: index };
    $.post('/session/secure/show', parameters, function(data) {
      $("#accounts").hide("fast");
      html += "<tr><td>Username:</td><td>" + data.username + "</td></tr>";
      html += "<tr><td>Password:</td><td>" + data.password +"</td></tr>";
      html += "<tr><td>Notes:</td><td>" + data.notes + "</td></tr>";
      $("#acct_headline").html(acct);
      $("#pass_text").html(html);
      $("#pass_text").show();
    });
  });
});

