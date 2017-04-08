$(window).load(function() {
  $('body').addClass('loaded');
});

$(document).foundation();

// adds navigation dots
var sections = $('.step').length;

var addDots = "";
for (var i=0; i < sections; i++) {
  addDots += '<i class="fa fa-circle-o fa-sm" id="circle-' + (i+1) + '" aria-hidden="true"></i>'
};
$('#dots').html(addDots);


// gives each step a sequential ID
$.each($(".step"), function(index, value){
  var num = index + 1;
  $(value).attr("id","step"+ num);
});

$.each($(".fa-circle-o"), function(index, value){
  $(this).on('click', function(){
    $('.step').fadeTo(0).removeClass('fixed');
    var num = index + 1;
    var stepid = "#step" + num;
    var sectionTop = $(stepid).offset().top;
    console.log(stepid);
    console.log(sectionTop);
    $('body').animate({scrollTop: sectionTop});
  })
})

// scroll down on down arrow press
// function scrollDown(e){
//     var $next = $('.current').next('.step').next('.step');
//     var top = $next.offset().top;
//
//     $('body').animate({ scrollTop: top });
// }
// // scroll up on up arrow press
// function scrollUp(e){
//   var $prev = $('.current').prev('.step');
//   var top = $prev.offset().top;
//
//   $('body').animate({ scrollTop: top });
// }
//
// // call functions on arrow press
// $(function () {
//   $(document).keydown(function (evt) {
//     if (evt.keyCode == 40) { // down arrow
//       scrollDown();
//     } else if (evt.keyCode == 38) {
//       scrollUp();
//     }
//   });
// });

$('.vis-small-container').css('left', function(){
  var width = 780;
  var windowWidth = $(window).width();
  return (windowWidth - width)/2;
});
$('#step9').css('left', function(){
  var width = $('#step9').width();
  var windowWidth = $(window).width();
  return "-" + (windowWidth - width)/1.5;
});
$('.vis-large-container').css('left', 0);
