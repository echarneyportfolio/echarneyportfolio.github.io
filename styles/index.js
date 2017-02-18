var hide_lists = function(cb) {
    $('#posts').fadeOut(300);
    $('#posts-btn').removeClass('disabled');
};
var scroll = function(id) {
  var position = $(window).scrollTop();
  var height = $(window).height();
  console.log(position, height);
  if(position < 60 && height < 650) {
    $('html, body').animate({
        scrollTop: $(id).offset().top
    }, 2000);
  }
}
var show_posts = function() {
    $('#projects-btn').removeClass('disabled');
    $('#projects').fadeOut(function() {
        $('#posts').fadeIn(300)
    });
    $('#posts-btn').addClass('disabled');
    scroll('#posts');
};
