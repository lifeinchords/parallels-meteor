
Template.bit.onRendered(function (){

  var template = this;
  var bit = template.data;
  var bitDatabaseId = bit._id;
  var $bitElement = $(template.firstNode);
  var $content = $bitElement.find('.bit__content');
  var $editbitElement = $content.find('.bit--editing');

  var $dragHandle = null;

  if (template.data.type === 'text'){
    $dragHandle = $(template.find('.bit__drag-handle'));

    $content.css("height", bit.height);
    $content.css("width", bit.width);

    $content.resizable({
      handles: { se: '.ui-resizable-se' },
      autoHide: true,

      stop: function (event, $resizable) {

        // TODO: refactor, should be identical code with BitEvents.hoverOutBit(), for text bits
        Session.set('textBitEditingId', null);
        Session.set('bitHoveringId', null);
        Session.set('mousedown', false);

        $bitElement.find('.bit__resize').hide();
        $bitElement.removeClass('hovering');
        $bitElement.find('.bit__controls-persistent').hide();

        $editbitElement.attr('contenteditable', 'false');
        $editbitElement.attr('data-clickable', 'false');

        Meteor.call('changeState', {
          command: 'updateBitContent',
          data: {
            canvasId: Session.get('canvasId'),
            _id: bit._id,
            content: $editbitElement.html(),
            height: $resizable.size.height,
            width: $resizable.size.width
          }
        });

        Parallels.Audio.player.play('fx-cha-ching');
      }

    });

    $editbitElement.bind('mousewheel DOMMouseScroll', function(e) {
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
  }

  // TODO: probably a more elegant way of doing this
  // maybe pass a param in the template, if that's possible with Meteor Spacebars
  if (Session.equals('viewingDrawer', true)) {
    makeDrawerBitDraggable($bitElement, $dragHandle);
  }

  else {
    makeSetBitDraggable($bitElement, $dragHandle);
  }

  // Run relevant animations when a bit is touched, when:
  // -- bits first render on the set/canvas
  // -- the drawer is opened, and a bit renders in the drawer
  // -- bit is rendered after undoing a bit:delete
  // -- bit:edit
  // -- bit:image:drag + dropped
  Tracker.autorun(function() {
    // console.log('bit:rendered - tracker, main');

    var timeline = new TimelineMax();

    // TODO: should probably make this more explicit that it's bits inside the map/canvas/set, not the drawer
    //       Right now, if drawer open, both drawer + canvas/set share the same html5 data attribute.
    //       This is a shortcut, so we can reuse the same bit template
    var bit = Bits.findOne(bitDatabaseId);
    if (!bit) { return; } // if it's just been deleted from the canvas, nothing left to do

    // if this bit is in the drawer (vs in a canvas set), nothing left to do
    var $drawerBit = Utilities.getDrawerBitElement(bit._id);
    if ($drawerBit.length){ return; }

    var $bit = Utilities.getSetBitElement(bit._id);

    // move the bit to it's new position on all other sessions/clients
    timeline.to($bitElement, 0, { x: bit.position.x, y: bit.position.y });

  });

  // Track upload status for new Bits
  Tracker.autorun(function (computation) {
    // console.log('bit:rendered - tracker, upload');
    var bitUpload = Parallels.FileUploads[$bitElement.data('upload-key')];
    if (!bitUpload) {
      computation.stop();
      return;
    }

    if (bitUpload.status() === 'failed') {
      /*
        AB: OQ: would show a friendly error message but the next line we remove the bit
        so it isn't worth it. Should we figure out how to keep the Bit even if upload fails?
        $bitElement.find('.bit__content')[0].classList.add('complete', 'error');
      */
      computation.stop();
      Meteor.call('changeState', {
        command: 'deleteBit',
        data: {
          canvasId: Session.get('canvasId'),
          _id: bitDatabaseId
        }
      });
      return;
    }

    if (bitUpload.status() === 'done') {
      $bitElement.find('.upload-status').addClass('complete success')
      Meteor.call('changeState', {
        command: 'uploadImage',
        data: {
          canvasId: Session.get('canvasId'),
          _id: bitDatabaseId,
          imageSource: bitUpload.instructions.download,
          uploadKey: null
        }
      });
      computation.stop();
    }
  });

  // Set a default image so we don't see a broken image in case the file can't be loaded
  $bitElement.find(".bit-image").error(function(){
    $(this).attr('src', 'http://placehold.it/850x650&text=' + bit.filename);
  });

  if (bit.filename && bit.filename.toUpperCase().split('.').pop() === "GIF"){
    Gifffer();
    $bitElement.addClass('bit--gif');

    // TODO:
    // detect if a GIF is animated https://www.npmjs.com/package/animated-gif-detector.
    // If not animated, convert + save as JPG. This is so it doesnt get a Play button incorrectly via Gifffer,
    // which isnt smart enough to know
  }

});


