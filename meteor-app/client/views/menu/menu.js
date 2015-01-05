Template.menu.helpers({

  bitEditingId: function() {
    return Session.get('bitEditingId');
  },

  bitsCount: function() {
    return Bits.find().count();
  }

});



Template.menu.rendered = function() {
  console.log('menu rendered.');




  // *********************************************************************

  // adapated code from   : http://codepen.io/vdaguenet/pen/Ebycz

  var screenWidth;
  var screenHeight;

  function start () {
      resize();

      var tlLoader     = setTimelineLoader();
      var tlGlobal     = new TimelineMax();

      // tlGlobal.set($('.overlay'), {alpha: 0});
      tlGlobal.add(tlLoader);

      // tlGlobal.set($('.overlay'), {alpha: 1});
      tlGlobal.play();
  };

  function resize () {
      screenWidth  = document.documentElement.clientWidth;
      screenHeight = document.documentElement.clientHeight;
  };

  function setTimelineLoader () {
      var topToBottomLine  = $('.wipe.top-to-bottom .line');
      var maskTop          = $('.wipe.top-to-bottom .mask.top');
      var maskBottom       = $('.wipe.top-to-bottom .mask.bottom');

      var sideToSideLine   = $('.wipe.side-to-side .line');
      var maskLeft         = $('.wipe.load.side-to-side .mask.left');
      var maskRight        = $('.wipe.load.side-to-side .mask.right');

      TweenMax.set($('.wipe.load.side-to-side'), { alpha: 0 });

      var tl = new TimelineMax();

      tl.fromTo(topToBottomLine, 0.4, { x: screenWidth }, { x: 0, ease: Circ.easeIn }, 0);
      tl.fromTo(maskTop, 0.4, { y: 0 }, { y: -screenHeight / 2, ease: Expo.easeOut, delay: 0.1 }, 0.4);
      tl.fromTo(maskBottom, 0.4, { y: 0 }, { y: screenHeight / 2, ease: Expo.easeOut, delay: 0.1 }, 0.4);
      tl.set($('.wipe.load.top-to-bottom'), { alpha: 0, display: "none" });

      tl.set($('.wipe.load.side-to-side'), { alpha: 1, display: "block"});
      tl.fromTo(sideToSideLine, 0.4, { y: -screenHeight}, {y: 0, ease: Circ.easeIn});
      tl.fromTo(maskRight, 0.4, { x: 0 }, {x: screenWidth / 2, ease: Expo.easeOut, delay: 0.1 }, 1.2); // 2.5
      tl.fromTo(maskLeft, 0.4, { x: 0 }, {x: -screenWidth / 2, ease: Expo.easeOut, delay: 0.1 }, 1.2);
      tl.set($('.wipe.load.side-to-side'), { alpha: 0, display: "none" });

      // TODO: open up to canvas, instead of hard cutting

      var menuBar = document.getElementById("menu-bar");
      tl.to(menuBar, 1, { top:"0px", ease:Elastic.easeOut});

      return tl;
  }


  start();  // run wipe transition

  // *********************************************************************


  var events = [];
  window.PARALLELS.Events.subscribe('all', function (event) {
    var eventTrail = $('.event-trail');
    var colors = [
      '#f80c12',
      '#ee1100',
      '#ff3311',
      '#ff4422',
      '#ff6644',
      '#ff9933',
      '#feae2d',
      '#ccbb33',
      '#d0c310',
      '#aacc22',
      '#69d025',
      '#22ccaa',
      '#12bdb9',
      '#11aabb',
      '#4444dd',
      '#3311bb',
      '#3b0cbd',
      '#442299'
    ];
    events.push(event);
    if (events.length > 100) eventTrail.find('div').first().remove();
    eventTrail.append( "<div title='"+ event['type'] + "' style='background-color: " + colors[Math.floor(Math.random() * 17) + 1] + "; display: table-cell'></div>" );
  });

};

