var url = 'http://156.35.95.69:3000/user/';
var token;

$(function() {

  /* Call move function if the user clicks over an arrow button */
  $('#down, #left, #right, #up').click(function() { move(this.id); });

  /* Call move function if an arrow key is pressed or remove active class if released */
  $(document).on('keydown keyup', function(e) {
    var direction = { 37: 'left', 38: 'up', 39: 'right', 40: 'down' }[event.keyCode];

    if (typeof direction !== 'undefined') {
      (event.type == 'keyup')? move(direction) : $('#' + direction).addClass('active');
    } 
  });

  /* Send the connection request on enter */
  $('#name').on('keyup', function(event) {
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
  $('#say').on('keyup', function(event) {
    if (event.which == 13 && !event.shiftKey) {
      var sayInput = $('#say');
      $.post(url + token + '/say?message=' + sayInput.val());
      sayInput.val('');
    }
  });
});

/* Sends an ajax request to move the player in the specified direction */
function move(direction) {
  $.get(url + token + '/move/' + direction);

  /* Remove active class on button. It is not pressed anymore */
  $('#' + direction).removeClass('active');
}
