// To allow for drag + dropping of bits from Drawer onto a Canvas (while they are both in view), 
// we'll need different subsets of the Bits collection. 

// To do this, we'll need to do our filtering on the client.
// Good writeup: https://stackoverflow.com/questions/19826804/understanding-meteor-publish-subscribe/21853298
// This sounds like a terrible idea for performance reasons, ie, publishing all bits
// to the client, but not sure how else to do it now

// This might be a solution: http://meteorpatterns.com/Sewdn/query-collections

Meteor.publish('Drawer.bits', function() {
  return Bits.find( {}, { sort: { timestamp: -1 }, limit: 20 });
});

Meteor.publish('Canvas.bits', function(canvasId) {
  return Bits.find( { canvasId: canvasId } , { limit: 100 }); 
});

Meteor.publish('errors', function() {
  return Errors.find();
});

Meteor.publish('Canvas.events', function() {
  return CanvasEvents.find( {}, { sort: { timestamp: -1 }, limit: 50 });
});

