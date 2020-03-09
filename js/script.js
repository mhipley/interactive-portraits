
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
  var mask = new Path.Rectangle({
    position: view.center,
    size: [rasterReveal.bounds.width, rasterReveal.bounds.height],

  });

  var path;
  var edge;
  var secondaryPath;
  var secondaryEdge;
  // var line;

  tool.minDistance = 2;
  tool.maxDistance = 10;

  var maxStripWidth = rasterReveal.size.width - 100;
  var minStripWidth = (rasterReveal.size.width - 100)/2;

  function getStripWidth(min, max) {
    min = Math.ceil(min);
    max = Math.ceil(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  var stripWidth = getStripWidth(minStripWidth, maxStripWidth);
  var offset = stripWidth/2;
  var offsetPoint = new Point(offset, 0);

  tool.onMouseDown = function(event) {

      if (path !== undefined) {
        path.removeSegments();
      }
      // if (line !== undefined) {
      //   line.removeSegments();
      // }

      path = new Path();
      path.add(event.point);
      path.strokeColor = '#ff9900';

      secondaryPath = path.clone();
      secondaryPath.strokeColor = 'hotpink';
      
      secondaryPath.translate(offset, 0);

      edge = new Path();
      edge.add(event.point);
      // edge.fillColor = 'white';

      secondaryEdge = edge.clone();

      secondaryEdge.translate(offset, 0);



      
  }



  tool.onMouseDrag = function(event) {
      // Add a point to the path every time the mouse is dragged

      var result = event.point + offsetPoint;

      path.add(event.point);
      secondaryPath.add(result);

      var step = event.delta;
      step.angle += 90;

      var top = event.middlePoint + step;
      var bottom = event.middlePoint - step;

      var secondaryTop = event.middlePoint + offsetPoint + step;
      var secondaryBottom = event.middlePoint + offsetPoint - step;

      // line = new Path();
      // line.add(top);
      // line.add(bottom);

      edge.add(top);
      edge.insert(0, bottom);

      secondaryEdge.add(secondaryTop);
      secondaryEdge.insert(0, secondaryBottom);

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

    var entryPoint = mask.getNearestLocation(path.firstSegment.point);
    var exitPoint = mask.getNearestLocation(event.point);

    var secondaryIn = path.firstSegment.point + offsetPoint;
    var secondaryOut = event.point + offsetPoint;

    var secondaryEntryPoint = mask.getNearestLocation(secondaryIn);
    var secondaryExitPoint = mask.getNearestLocation(secondaryOut);    

    var intersections = mask.getCrossings(path);

    if (intersections === undefined || intersections.length == 0){

      path.insert(0, entryPoint);
      path.add(exitPoint);

      secondaryPath.insert(0, secondaryEntryPoint);
      secondaryPath.add(secondaryExitPoint);

      joinPath = secondaryPath.clone();
      joinPath.insert(0, entryPoint);
      joinPath.add(exitPoint);
 
      // still need to close these to the edge
      edge.closed = true;
      secondaryEdge.closed = true;
      // edge.smooth();

    }

    else{
      newPath = path.intersect(mask, {trace: false});
      secondaryNewPath = secondaryPath.intersect(mask, {trace: false});

      var newEntryPoint = mask.getNearestLocation(newPath.firstSegment.point);
      var newExitPoint = mask.getNearestLocation(newPath.lastSegment.point);     

      var newSecondaryEntryPoint = mask.getNearestLocation(secondaryNewPath.firstSegment.point);
      var newSecondayExitPoint = mask.getNearestLocation(secondaryNewPath.lastSegment.point);     

      newPath.insert(0, newEntryPoint);
      newPath.add(newExitPoint);

      secondaryNewPath.insert(0, newSecondaryEntryPoint);
      secondaryNewPath.add(newSecondayExitPoint);

      path.removeSegments();
      path.addSegments(newPath.segments);
      newPath.remove();

      secondaryPath.removeSegments();
      secondaryPath.addSegments(secondaryNewPath.segments);
      secondaryNewPath.remove();

      joinPath = secondaryPath.clone();
      joinPath.insert(0, newSecondaryEntryPoint);
      joinPath.add(newSecondayExitPoint);

      edge.closed = true;
      secondaryEdge.closed = true;
      // edge.smooth();


    }



    if (path.isInside(mask.bounds) === true) {

      // var textureEdge = path.clone();
      // textureEdge.strokeColor = 'hotpink';
      // textureEdge.flatten(150);
      // textureEdge.selected = true;

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

      var clipPath = path.clone();
      clipPath.join(joinPath);
      clipPath.selected = true;

      var clippedMask = new Group({
          children: [clipPath, mask],
          clipped: true
      });            

      var clippedGroup = new Group({
          children: [clippedMask, rasterInit],
          clipped: true
      });      

      // drawSquares(path, texturesNo);
      
      // var boundingIntersections = mask.getIntersections(path);
      // var secondaryBoundingIntersections = mask.getIntersections(secondaryPath);

      // var splitLocation = mask.getNearestLocation(boundingIntersections[0].point);
      // var locationB = mask.getNearestLocation(boundingIntersections[1].point);

      // var secondarySplitLocation = mask.getNearestLocation(secondaryBoundingIntersections[0].point);

      // console.log(boundingIntersections);
      // console.log(secondaryBoundingIntersections);
      // console.log(splitLocation);
      // console.log(secondarySplitLocation);
      // var secondaryLocationB = mask.getNearestLocation(secondaryBoundingIntersections[1].point);

      // var pathB = path.clone();

      // mask.splitAt(splitLocation);
      // boundB = mask.splitAt(locationB);

      // mask.join(path);
      // boundB.join(pathB);

      // var initClone = rasterInit.clone();

      // var groupA = new Group({
      //     children: [mask, rasterInit],
      //     clipped: true
      // });

      // var groupB = new Group({
      //     children: [boundB, initClone],
      //     clipped: true          
      // });  

      // textures.bringToFront();
      // groupA.bringToFront();
      // edge.bringToFront();
      
      // groupB.bringToFront();


    }

    else {
      path.removeSegments();
      secondaryPath.removeSegments();
    }



  }

});



