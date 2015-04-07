Template.map.helpers({
  bits: function() {
    // return Bits.find();
    var Bits = Meteor.neo4j.call('allBits',{});
    return Bits;
  }
});





Template.map.rendered = function(){
  
  sound.play('welcome-v1.mp3');

};

Template.map.events({
  'dblclick .map': function (event, template){
    event.preventDefault();
    event.stopPropagation();

    console.log("bit:text:create");

    if(event.target.classList.contains('map')){
      var id = Bits.insert( { 
                  content: '',
                  type: 'text', 
                  color: 'white',
                  position_x: event.pageX, 
                  position_y: event.pageY });

      Session.set('bitEditingId', id);

    }
  }
  

});
