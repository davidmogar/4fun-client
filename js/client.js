var url = 'http://156.35.95.69:3000/user/';
var token;

$(function() {
  $('#down').click(function() { move('down'); });
  $('#left').click(function() { move('left'); });
  $('#right').click(function() { move('right'); });
  $('#up').click(function() { move('up'); });

  /* Every time an arrow is pressed, add active class to that button to show it pressed in the UI */
  $(document).keydown(function(e) {
    switch (e.keyCode) {
      case 37:
        $('#left').addClass('active');
        break;
      case 38:
        $('#up').addClass('active');
        break;
      case 39:
        $('#right').addClass('active');
        break;
      case 40:
        $('#down').addClass('active');
        break;
    }
  });

  /* Send a move request on arrow keyup */
  $(document).keyup(function(e) {
    switch (e.keyCode) {
      case 37:
        move('left');
        break;
      case 38:
        move('up');
        break;
      case 39:
        move('right');
        break;
      case 40:
        move('down');
        break;
    }
  });

  $('#name').on('keypress', function(event) {
    if (event.which == 13 && !event.shiftKey) {
      var name = $('#name').val();
      if (name != '') {
        $.get(url + name, function(data) {
          token = data.token;
          $('#login').slideUp();
          $('#controls').slideDown();
        });
      }
    }
  });

  /* Send message on enter */
  $('#say').on('keypress', function(event) {
    if (event.which == 13 && !event.shiftKey) {
      var sayInput = $('#say');
      $.post(url + token + '/say?message=' + sayInput.val());
      sayInput.val('');
    }
  });
});

function move(direction) {
  $.get(url + token + '/move/' + direction);

  /* Remove active class on button. It is not pressed anymore */
  $('#' + direction).removeClass('active');
}
