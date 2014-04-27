$(document).ready(function() {

  $("#key_button").click(function () {
    $(".key_form").hide("fast", function() {
      var parameters = { key: $("#key").val() };
      $.post('/auth', parameters, function(data) {
        if (data == "true") {
          $("#pass_form").show("fast");
        }
        else { 
          $(".accounts").show("fast");
          $(".accounts").html("Incorrect authorization");
        }
      });
    });
  });

  $("#pass_button").click(function () {
    $("#pass_form").hide("fast", function() {
      $("#input").css("padding-top", "10px");
      $("#input").css("padding-bottom", "10px");
      $("#input").css("text-align", "left");
      $(".accounts").show("fast");
      var parameters = { pass: $("#pass").val() };
      $.post('/list', parameters, function(data) {
        $(".accounts").html(data);
      });
    });
  });

  $(".accounts").on('click', '#acct', function() {
    var index = $("li").index(this);
    var parameters = { index: index };
    $.post('/show', parameters, function(data) {
      $(".accounts").hide("fast");
      $("#pass_text").show("fast");
      $("#pass_text").html(data);
    });
  });
});

