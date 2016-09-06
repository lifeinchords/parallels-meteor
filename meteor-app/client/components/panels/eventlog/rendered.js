import _ from 'lodash';

Template.eventlog.onRendered(function () {
  var $eventLog = $(this.firstNode);
  var timeline = new TimelineMax();

  timeline
    .fromTo(
      $eventLog, 
      0.75, 
      {
        opacity: 0.25
      },
      { 
        opacity: 1,
        autoAlpha: 1,
        boxShadow: "rgba(0, 0, 0, 0.2) 0 16px 32px 0", 
        ease: Expo.easeOut
      }
    )

  $eventLog.bind('mousewheel DOMMouseScroll', function(e) {
    var scrollTo = null;

    if (e.type == 'mousewheel') {
      scrollTo = (e.originalEvent.wheelDelta * -1);
    }
    else if (e.type == 'DOMMouseScroll') {
      scrollTo = 40 * e.originalEvent.detail;
    }

    if (scrollTo) {
      e.preventDefault();
      $(this).scrollTop(scrollTo + $(this).scrollTop());
    }
  });
});
