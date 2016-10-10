Template.map.onRendered(function () {

  wireMojsExplore1();

  var template = this;
  var mapElement = template.find('.map');
  mapElement.style.minHeight = Session.get("mapHeight") + "px";
  mapElement.style.minWidth = Session.get("mapWidth") + "px";

  Parallels.Audio.player.play("fx-welcome-v2");  

  mapElement._uihooks = {

    insertElement: function (mapElement, next) {
      var bit = Blaze.getData(mapElement);

      $(mapElement).insertBefore(next);

      function timelineInsertDone(mapElement) {
        // TODO: only if text bit
        $(mapElement).find('.editbit').focus();
      }

      var timelineInsert = new TimelineMax({
        onComplete: timelineInsertDone,
        onCompleteParams: [mapElement]
      });

      timelineInsert
        .to(mapElement, 0, {x: bit.position.x, y: bit.position.y})
        .to(mapElement, 0.125, {ease: Bounce.easeIn, display: 'block', opacity: 1, alpha: 1})
        .to(mapElement, 0.125, {scale: 0.95, ease: Quint.easeOut})
        .to(mapElement, 0.275, {scale: 1, ease: Elastic.easeOut});
    },

    removeElement: function (mapElement) {

      function timelineRemoveDone(mapElement) {
        $(mapElement).remove();
        Parallels.log.debug("bit:remove:uihook : timeline animate done. removed bit.");
      }

      var timelineRemove = new TimelineMax({
        onComplete: timelineRemoveDone,
        onCompleteParams: [mapElement]
      });

      timelineRemove
        // .call(
        //     Parallels.Animation.General.cornerSparks,
        //     [
        //       {
        //         $element: $(node),
        //         prependTo: ".map"
        //       }
        //     ]
        // )
        .to(mapElement, 0.10, {opacity: 0, ease: Expo.easeIn, display: 'none'});
    }
  };

});





