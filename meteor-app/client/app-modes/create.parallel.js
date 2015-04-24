var timeline, $bitOrigin;

/*
 TODO:

 * syncronize multiple bits heartbeat animation
 * is timeline.kill() the best way to gracefully end heartbeat animation on escape

 */
Parallels.AppModes['create-parallel'] = {
  enter: function () {
    Session.set('currentMode', 'create-parallel');

    console.log("pressed Shift key.");

    var bitHoveringId = Session.get('bitHoveringId');
    var isCreatingParallel = Session.get('isCreatingParallel');

    if(bitHoveringId && (!isCreatingParallel))
    {
      isCreatingParallel = true;
      var bitParallelCreateOriginId = bitHoveringId;
      $bitOrigin = $(document.querySelector("[data-id='" + bitParallelCreateOriginId + "']"));

      Session.set('isCreatingParallel', isCreatingParallel);
      Session.set('bitParallelCreateOriginId', bitParallelCreateOriginId);

      console.log("ready for creating parallel. starting at bit: " + bitParallelCreateOriginId);

      // abstract out into reusable mode concept.
      // here, it might be : enterMode.createParallel()
      $(".map").addClass('mode--create-parallel'); // visually demonstrate we're in connecting mode

      // TODO: animate
      $bitOrigin.addClass('dashed-stroke');
      // TODO:
      // disable events
      // fix offset from adding stroke
      // try bg overlay over other bits too?
      // disable scrolling


      var timelineStart = function () {
        console.log('bit:parallel:create. Origin bit' + bitParallelCreateOriginId + ': selected-loop animation starting ...');
      };

      var timelineDone = function( bitOriginId ){
        console.log('bit:parallel:create. End mode, origin bit' + bitOriginId + ': selected-loop animation ending.');
        // Session.set('isDrawingParallel', null);
        // Session.set('bitParallelCreateOriginId', null);

        // $(this).unbind();

      };

      timeline = new TimelineMax({
        onStart: timelineStart,
        onComplete: timelineDone,
        onCompleteParams:[ bitParallelCreateOriginId ],
        repeat: -1
      });

      timeline
        // play heartbeat animation
        .to($bitOrigin, 0.50, { scale: 1.02, ease:Expo.easeOut } )
        .to($bitOrigin, 0.5, { scale: 1, ease:Expo.easeOut } );

      // draw line

      // TODO: only enable if none others are going

      // TODO: move to map? merge map.js + app.js?

      // $(this).mousemove( function(event) {
      //   console.log("mouse event.page_: ", event.pageX, event.pageY);
      // });
    }
  },
  exit: function () {
    Session.set('currentMode', null);

    console.log('escape key, inside create parallel, exiting mode');

    var isCreatingParallel = Session.get('isCreatingParallel');

    if (isCreatingParallel)
    {
      Session.set('isCreatingParallel', null);
      Session.set('bitParallelCreateOriginId', null);

      $(".map").removeClass('mode--create-parallel');
      $bitOrigin.removeClass('dashed-stroke');

      // stop heartbeat animation
      timeline.kill();

      console.log('exiting create parallel mode complete');
    }
  }
};