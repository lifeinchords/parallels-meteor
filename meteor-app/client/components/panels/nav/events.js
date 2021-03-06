/*

TODO: finish dedicated lightbox function 

function lightBox(options){

  /*
  var options = {
    template: template,
    containerElement: containerElement,
    animate.open = true,
    animate.close = true,
  }
  * /

  this.open(){

    // prep container for lightbox
    $("<div>")
      .addClass("parallels-lightbox")
      .addClass("parallels-lightbox__about")
      .appendTo($("body"));

    $("body").css( "overflow-x", "hidden");
    $("body").css( "position", "static");
    $(".map").addClass('map__lightbox');

    // inject the content into it 
    Blaze.render(options.template, _.first($(options.containerElement) );
  },

  this.close(){

  }

 
}


Template.navPanel.events({

  'click .nav-panel__primary': function (event, template) {
    Parallels.Panels.toggleShortcuts();
  },

  'click .nav-panel__link__about': function (event, template) {

    var options = {
      template: Template.aboutContent,
      containerElement: ".parallels-lightbox__about",
      animate.open = true,
      animate.close = true,
    }

    lightBox(options);

  }

});

*/

Template.navPanel.events({

  'click .nav-panel__primary': function (event, template) {
    Parallels.Panels.toggleShortcuts();
  },

  'click .nav-panel__link__about': function (event, template) {

    // prep container for lightbox
    $("<div>")
      .addClass("parallels-lightbox")
      .addClass("parallels-lightbox__about")
      .appendTo($("body"));

    $("body").css( "overflow", "hidden");
    // $("body").css( "position", "static");

    // inject the content into it 
    Blaze.render(Template.aboutContent, _.first($(".parallels-lightbox__about")) );

    $(".map").addClass('map__lightbox');

  }

});


