$(window).load(function() {
  $('body').addClass('loaded');
});

$(document).foundation();


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

$('.step').css('margin-left', function(){
  var width = $('.step').width();
  var windowWidth = $('#sections').width();
  var margin = (windowWidth - width)/2;
  return margin;
});
$('#step10').css('margin-left', function(){
  var width = $('#step10').width();
  var windowWidth = $('#sections').width();
  var margin = (windowWidth - width)/2;
  return margin;
});
// $('.vis-large-container').css('left', 0);

// $('#sections').fullpage({
//    anchors: false,
//    scrollingSpeed: 700,
//    navigation: true,
//    autoScrolling: false,
//    normalScrollElementTouchThreshold: 6,
//    fadingEffect: true,
//    fadingEffectKey: 'a2llcnN0ZW5zY2htaWR0LmNvbV9NSUVabUZrYVc1blJXWm1aV04wdmZ'
//  })
