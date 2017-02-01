$(document).foundation();

// ScrollMagic
var controller = new ScrollMagic.Controller();

var scene = new ScrollMagic.Scene({
  triggerElement: '#pinned-trigger1', // starting scene, when reaching this element
  duration: 400 // pin the element for a total of 400px
})
.setPin('#header');

controller.addScene(scene);
