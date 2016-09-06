import _ from 'lodash';

Template.drawer.onRendered(function () {
  var $drawer = $(this.firstNode);
  var timeline = new TimelineMax();

  console.log('drawer: rendered.');

  var template = this;
  var drawerElement = template.find('.drawer');

  Parallels.Audio.player.play("fx-drdrrt");

  timeline
    .set('.drawer', { height: $(document).height() } )
    .fromTo(
      $drawer, 
      0.4, 
      {
        x: -500 +  verge.scrollX(),
        y: verge.scrollY(),
        opacity: 0.25
      },
      { 
        x: 0 +  verge.scrollX(),
        y:  verge.scrollY(),
        opacity: 1,
        autoAlpha: 1,
        ease: Expo.easeOut
      }
    );

    //////////////////////////////////////


    // var timelineStart = function () {
     
    //   console.log('drawer: starting showing bits')
    // };

    // var tl = new TimelineMax({
    //   onStart: timelineStart,
    //   onComplete: timelineDone,
    //   // onCompleteParams:[ originBitId ],
    // });

    // var spacer = 20;
    // var notchesArray = _.range(0, 100, spacer);
    var $drawerBits = ($(".drawer-bits .bit"));

    // for non-destructively reversing
    // var $tempBits = $drawerBits.get().map(Array.apply.bind(Array, null));

    var tl = new TimelineMax();
    tl
      .set($drawerBits, { position: "relative", transform: "initial" })
      .staggerTo(
        $drawerBits,
        0.5,
        {
          x: 300,
          opacity: 1,
          autoAlpha: 1,
          display: "flex",
        },
        0.05
    )


});
