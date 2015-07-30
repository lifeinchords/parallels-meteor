BitEvents = {

  //todo: clean this shit up


  hoverInBit: function (event, template) {
    if (!Session.get('mousedown')) {
      Session.set('bitHoveringId', template.data._id);
      Session.set('bitEditingId', template.data._id);
      Parallels.Audio.player.play('fx-ting3');

      // SD: OQ/TODO: this fails on bit:delete, how can we reuse this function?
      var $bit = $(template.firstNode);
      $bit.find('.editbit').focus();
      $bit.addClass('hovering');
    }
  },

  hoverOutBit: function (event, template){
    if (!Session.get('mousedown')) {
      Session.set('bitHoveringId', null);
      var $bit = $(template.firstNode);
      $bit.removeClass('hovering');

      var $editbitElement = $(template.find('.editbit'));
      if (this.content != $editbitElement.html()) {
        Meteor.call('changeState', {
          command: 'updateBitContent',
          data: {
            canvasId: Session.get('canvasId'),
            _id: this._id,
            content: $editbitElement.html(),
            height: $editbitElement.height(),
            width: $editbitElement.width()
          }
        });

        Parallels.Audio.player.play('fx-cha-ching');
      }
    }
  }
};



// for more bit events see /client/lib/key-bindings.js
Template.bit.events({

  'mouseenter .bit': BitEvents.hoverInBit,

  'mouseleave .bit': BitEvents.hoverOutBit,

  'mousedown .bit': function () {
    Session.set('mousedown', true);
  },

  'mouseup .bit': function () {
    Session.set('mousedown', false);
  }
});
