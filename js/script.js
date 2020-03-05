
// get portraits from JSON
var portraits = (function() {
  var portaits = null;
  $.ajax({
    'async': false,
    'global': false,
    'url': "portraits.json",
    'dataType': "json",
    'success': function(data) {
      portraits = data;
    }
  });
  return portraits;
})();

var width = window.innerWidth;
var height = window.innerHeight;
var yDiff = height * .1;
var xDiff = width * .1;

// function to scale raster based on viewport size
function resizeImg(image) {
    var scale = (height * .75) / image.bounds.height;
    image.scale(scale);
}

function pickRandomPortrait(){
        var obj_keys = Object.keys(portraits.portraits);
        var ran_key = obj_keys[Math.floor(Math.random() *obj_keys.length)];
        portrait = portraits.portraits[ran_key];
}

pickRandomPortrait();

// Create a raster for the revealed image.
var rasterReveal = new Raster({
  source: portrait.revealUrl,
  position: view.center
});

rasterReveal.on('load', function() {
    resizeImg(rasterReveal);
    rasterReveal.style = {
      shadowColor: new Color(0, 0, 0, .5),
      shadowBlur: 80,
      shadowOffset: new Point(15, 20)
    };


});

// // Create a raster for the initial image.
var rasterInit = new Raster({
  source: portrait.initUrl,
  position: view.center
});

rasterInit.on('load', function() {
  resizeImg(rasterInit);

  //box for image mask
  var boundA = new Path.Rectangle({
    position: view.center,
    size: [rasterReveal.bounds.width, rasterReveal.bounds.height],

  });

  var path;
  var edge;
  var newPath;
  var line;

  tool.minDistance = 2;
  tool.maxDistance = 10;

  var maxStripWidth = rasterReveal.size.width - 100;
  var minStripWidth = (rasterReveal.size.width - 100)/4;

  function getStripWidth(min, max) {
    min = Math.ceil(min);
    max = Math.ceil(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  var stripWidth = getStripWidth(minStripWidth, maxStripWidth);
  var offset = stripWidth/2;

  tool.onMouseDown = function(event) {

      if (path !== undefined) {
        path.removeSegments();
      }
      if (line !== undefined) {
        line.removeSegments();
      }
      path = new Path();
      path.add(event.point);
      path.strokeColor = 'white';
      path.strokeWidth = 2;
      
      path.translate(offset, 0);

      edge = new Path();
      edge.add(event.point);
      // edge.strokeColor = 'hotpink';
      edge.fillColor = 'white';
      edge.translate(offset, 0);

      
  }



  tool.onMouseDrag = function(event) {
      // Add a point to the path every time the mouse is dragged
      console.log(event.point);

      var offsetPoint = new Point(offset, 0);

      var result = event.point + offsetPoint;

      path.add(result);

      var step = event.delta;
      step.angle += 90;

      var top = event.middlePoint + offsetPoint + step;
      var bottom = event.middlePoint + offsetPoint - step;

      line = new Path();
      line.add(top);
      line.add(bottom);

      edge.add(top);
      edge.insert(0, bottom);


      var childIndex = edge.parent.lastChild.index;




      // edge.deselectAll;
      // edge.parent.lastChild.strokeColor = 'hotpink';
      // edge.parent.lastChild.strokeColor.selected = true;
      // edge.parent.children[childIndex].fillColor = {
      //     gradient: {
      //         stops: [['rgba(255, 255, 255, 0)', 0.0], ['rgba(255, 255, 255, .5)', 0.5], ['rgba(255, 255, 255, 0)', 1]]
      //     },
      //     origin: top,
      //     destination: bottom
      // };


  }

  tool.onMouseUp = function(event) {

    var entryPoint = boundA.getNearestLocation(path.firstSegment.point);
    var exitPoint = boundA.getNearestLocation(event.point);

    var intersections = boundA.getCrossings(path);

    if (intersections === undefined || intersections.length == 0){

      path.insert(0, entryPoint);
      path.add(exitPoint);

 
      edge.closed = true;
      // edge.smooth();

      edgeB = edge.clone();
    }

    else{
      newPath = path.intersect(boundA, {trace: false});
      var newEntryPoint = boundA.getNearestLocation(newPath.firstSegment.point);
      var newExitPoint = boundA.getNearestLocation(newPath.lastSegment.point);     
      newPath.insert(0, newEntryPoint);
      newPath.add(newExitPoint);
      path.removeSegments();
      path.addSegments(newPath.segments);
      newPath.remove();

      edge.closed = true;
      // edge.smooth();

      edgeB = edge.clone();

    }


    if (path.isInside(boundA.bounds) === true) {

      // var textureEdge = path.clone();
      // textureEdge.strokeColor = 'hotpink';
      // textureEdge.flatten(150);
      // textureEdge.selected = true;

      var clonePath = path.clone();
      clonePath.strokeColor = 'hotpink';

      var textures = new Group();

      //path length doesn't seem to be accurate when line is completed on mouseUp
      var texturesNo = Math.round(path.length / 15);

      function drawSquares(path, texturesNo) {
        var i;

        for (i = 0; i < texturesNo; i++) {
          var location = path.getLocationAt(15*i);
          var tangent = path.getTangentAt(location);


          var marker = new Shape.Rectangle({
            point: [(location.segment.point.x) - 20, (location.segment.point.y) - 20],
            size: new Size(40, 40),
            // strokeColor: 'hotpink'
          })

          function getRandomTileNo(max) {
            min = Math.ceil(1);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
          }

          var tileUrl = '/img/textures/edge-tile-' + getRandomTileNo(3) + '.png';

          var tile = new Raster({
            source: tileUrl,
            position: [(location.segment.point.x), (location.segment.point.y)],
            size: new Size(40, 40),
          });          

          tile.scale(40/300);

          marker.rotate(tangent.angle);
          tile.rotate(180 + tangent.angle);

          textures.addChild(marker);
          textures.addChild(tile);
          
          i++;

        }



      }

      drawSquares(path, texturesNo);
      
      var boundingIntersections = boundA.getIntersections(path);

      var locationA = boundA.getNearestLocation(boundingIntersections[0].point);
      var locationB = boundA.getNearestLocation(boundingIntersections[1].point);

      var pathB = path.clone();

      boundA.splitAt(locationA);
      boundB = boundA.splitAt(locationB);

      boundA.join(path);
      boundB.join(pathB);

      var initClone = rasterInit.clone();

      var groupA = new Group({
          children: [boundA, rasterInit],
          clipped: true
      });

      var groupB = new Group({
          children: [boundB, initClone],
          clipped: true          
      });  

      textures.bringToFront();
      groupA.bringToFront();
      edge.bringToFront();
      
      groupB.bringToFront();
      edgeB.bringToFront();   


    }

    else {
      path.removeSegments();
    }



  }

});



