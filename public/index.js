// Client side jquery logic for BackupPass
// Copyright Matthew Sperry 2014, distributed under the MIT license

$(document).ready(function() {
  $("#key").focus();

  var key_submit = function() {
    $("#key_form").hide("fast", function() {
      var parameters = { key: $("#key").val() };
      $.post('/auth', parameters, function(data) {
        if (data == "true") {
          $("#pass_form").show("fast");
          $("#pass").focus();
        }
        else { 
          $("#verify").show("fast");
          $("#verify").html("Incorrect authorization" + 
            "<br>Wait 2 seconds before retrying");
        }
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
        $.post('/list', parameters, function(data) {
          $("#accounts").html(data);
          $("#verify").hide("fast");
          $("#acct_headline").show("fast");
          $("#accounts").show("fast");
        });
      });
      return false;
    }
  });

  $("ul").on("mouseover", ".acct", function() {
    $(this).css("font-weight", "bold");
  });
  $("ul").on("mouseleave", ".acct", function() {
    $(this).css("font-weight", "normal");
  });

  $("#accounts").on('click', '.acct', function() {
    var index = $("li").index(this);
    var parameters = { index: index };
    $.post('/show', parameters, function(data) {
      $("#accounts").hide("fast");
      $("#pass_text").show("fast");
      $("#pass_text").html(data);
    });
  });
});

