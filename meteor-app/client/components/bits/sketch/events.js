BitEvents = {
  hoverInBit: function (event, template) {
    if (!Session.get('mousedown')) {
      Session.set('bitHoveringId', template.data._id);
      Parallels.Audio.player.play('fx-ting3');

      // SD: OQ/TODO: this fails on bit:delete, how can we reuse this function?
      var $bit = $(template.firstNode);
      $bit.addClass('hovering');
      $bit.focusWithoutScrolling();
    }
  },

  hoverOutBit: function (event, template){
    if (!Session.get('mousedown')) {
      Session.set('bitHoveringId', null);
      var $bit = $(template.firstNode);
      $bit.removeClass('hovering');
      $bit.blur();
    }
  }
};


Template.sketchBit.events({
  'mouseenter .bit': BitEvents.hoverInBit,
  'mouseleave .bit': BitEvents.hoverOutBit,
  'mousedown .bit': function () {
    Session.set('mousedown', true);

    // avoid interference with making marquee/select bits
    event.stopPropagation(); 
  },

  'mouseup .bit': function () {
    Session.set('mousedown', false);
  },

  'dblclick .bit': function(e){
    e.stopPropagation();
  },

});
