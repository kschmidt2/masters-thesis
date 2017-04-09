

// loads foundation
$(document).foundation();

// adds loaded class to body to remove loading screen
$(window).load(function() {
  $('body').addClass('loaded');
});

// gives each step a sequential ID
$.each($(".step"), function(index, value){
  var num = index + 1;
  $(value).attr("id","step"+ num);
});

// changes margins on wider slides
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
