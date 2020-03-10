
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

  //box for shadow
  var shadowClone = mask.clone();
  shadowClone.style = {  
    fillColor: 'white',
    shadowColor: new Color(0, 0, 0, .5),
    shadowBlur: 20,
    shadowOffset: new Point(2, 6)
  };
  shadowClone.sendToBack();


  var path;
  var edge;
  var edgeRip;
  var secondaryPath;
  var secondaryEdge;
  var texturesAlt = new Group();
  var ripTextures = new Group();

  // tool.minDistance = 5;
  // tool.maxDistance = 20;
  tool.fixedDistance = 30;

  var maxStripWidth = mask.bounds.width - 200;
  var minStripWidth = (mask.bounds.width - 200)/2;

  function getRandomInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.ceil(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  var stripWidth = getRandomInclusive(minStripWidth, maxStripWidth);
  var offset = stripWidth;
  var offsetPoint = new Point(offset, 0);

  tool.onMouseDown = function(event) {

      if (path !== undefined) {
        path.removeSegments();
      }

      path = new Path();
      path.add(event.point);
      // path.strokeColor = '#ff9900';

      var entryPoint = mask.getNearestLocation(event.point);
      var secondaryIn = path.firstSegment.point + offsetPoint;
      var secondaryEntryPoint = mask.getNearestLocation(secondaryIn);

      var intersections = mask.getCrossings(path);

      secondaryPath = path.clone();
      // secondaryPath.strokeColor = 'hotpink';
      
      secondaryPath.translate(offset, 0);

      joinPath = secondaryPath.clone();
      // joinPath.strokeColor = 'green';

      edge = new Path();
      edge.add(event.point);
      edge.fillColor = '#fdfdfd';
      // edge.strokeColor = '#ff9900';

      edgeRip = new Path();
      edgeRip.add(event.point);
      // edgeRip.strokeColor = 'hotpink';

      secondaryEdge = edge.clone();

      secondaryEdge.translate(offset, 0);

      if (intersections === undefined || intersections.length == 0){

        path.insert(0, entryPoint);
        secondaryPath.insert(0, secondaryEntryPoint);
        secondaryPath.insert(0, entryPoint);
      }


      var clipPath = path.clone();
      var joinPath = secondaryPath.clone();
      clipPath.join(joinPath);

      var clippedMask = new Group({
          children: [clipPath, mask],
          clipped: true
      });            

      var clippedGroup = new Group({
          children: [clippedMask, rasterInit],
          clipped: true
      }); 
      
  }



  tool.onMouseDrag = function(event) {
      // Add a point to the path every time the mouse is dragged
      var randomAddA = getRandomInclusive(5, 15);
      var randomAddB = getRandomInclusive(5, 15);
      var randomPointA = new Point(randomAddA, 0);
      var randomPointB = new Point(randomAddB, 0);
      var result = event.point + offsetPoint;

      path.add(event.point);
      secondaryPath.add(result);

      var step = event.delta;
      step.angle += 90;

      var top = event.middlePoint - randomPointA - 30;
      var bottom = event.middlePoint + 5;

      var secondaryTop = event.middlePoint + offsetPoint - 5;
      var secondaryBottom = event.middlePoint + offsetPoint + randomPointB + 30;

      edge.add(top);
      edge.insert(0, bottom);

      edgeRip.add(top);

      secondaryEdge.add(secondaryTop);
      secondaryEdge.insert(0, secondaryBottom);
      function drawTextures(event, primary) {

        function getRandomTileNo(max) {
          min = Math.ceil(1);
          max = Math.floor(max);
          return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        var tileUrl = '/img/textures/edge-tile-' + getRandomTileNo(4) + '.png';
        var ripTileUrl = '/img/textures/rip-tile-' + getRandomTileNo(4) + '.png';

        if (primary === true) {
          var ripPoint = event.middlePoint - randomPointA - 30;

          var marker = new Shape.Rectangle({
            point: [(event.point.x) - 20, (event.point.y) - 20],
            size: new Size(40, 40),
            // strokeColor: 'hotpink'
          });

          var tile = new Raster({
            source: tileUrl,
            position: event.point,
            size: new Size(40, 40)
          });   

          marker.rotate(event.delta.angle);
          tile.rotate(event.delta.angle);


          var ripMarker = new Shape.Rectangle({
            point: [(ripPoint.x) - 20, (ripPoint.y) - 20],
            size: new Size(40, 40),
            // strokeColor: 'hotpink'
          });

          var ripTile = new Raster({
            source: ripTileUrl,
            position: ripPoint,
            size: new Size(40, 40)
          }); 

          ripTile.rotation = 180;
          ripMarker.rotate(event.delta.angle);
          ripTile.rotate(event.delta.angle);

        }

        else {
          var ripPoint = event.middlePoint + offsetPoint + randomPointB + 30;

          var marker = new Shape.Rectangle({
            point: [(event.point.x) - 20 + offsetPoint.x, (event.point.y) - 20],
            size: new Size(40, 40),
            // strokeColor: 'hotpink'
          });

          var tile = new Raster({
            source: tileUrl,
            position: event.point + offsetPoint,
            size: new Size(40, 40)
          });   

          tile.rotation = 180;
          marker.rotate(event.delta.angle);
          tile.rotate(event.delta.angle);

          var ripMarker = new Shape.Rectangle({
            point: [(ripPoint.x) - 20, (ripPoint.y) - 20],
            size: new Size(40, 40),
            // strokeColor: 'hotpink'
          });

          var ripTile = new Raster({
            source: ripTileUrl,
            position: ripPoint,
            size: new Size(40, 40)
          }); 

          ripMarker.rotate(event.delta.angle);
          ripTile.rotate(event.delta.angle);          

        }  

        texturesAlt.addChild(marker);
        texturesAlt.addChild(tile);
        ripTextures.addChild(ripMarker);
        ripTextures.addChild(ripTile);
        
      }


      drawTextures(event, true);
      drawTextures(event, false);



      var clipPath = path.clone();
      var joinPath = secondaryPath.clone();
      clipPath.join(joinPath);

      var clippedMask = new Group({
          children: [clipPath, mask],
          clipped: true
      });            

      var clippedGroup = new Group({
          children: [clippedMask, rasterInit],
          clipped: true
      });

      clippedGroup.bringToFront(); 
      edge.bringToFront();   
      secondaryEdge.bringToFront(); 
      ripTextures.bringToFront();
      edgeRip.bringToFront();
      
  }

  tool.onMouseUp = function(event) {


    var exitPoint = mask.getNearestLocation(event.point);

    var secondaryOut = event.point + offsetPoint;

    var secondaryExitPoint = mask.getNearestLocation(secondaryOut);    
    var intersections = mask.getCrossings(path);

    // path is entirely contained within mask bounds:
    if (intersections === undefined || intersections.length == 0){

      path.add(exitPoint);

      secondaryPath.add(secondaryExitPoint);

      var clipPath = path.clone();
      var joinPath = secondaryPath.clone();
      clipPath.join(joinPath);

      var clippedMask = new Group({
          children: [clipPath, mask],
          clipped: true
      });            

      var clippedGroup = new Group({
          children: [clippedMask, rasterInit],
          clipped: true
      });      

      clippedGroup.bringToFront(); 
      edge.bringToFront();   
      secondaryEdge.bringToFront(); 
      ripTextures.bringToFront();
      edgeRip.bringToFront();
      
 
      // still need to close these to the edge
      // edge.insert(0, entryPoint);
      edge.add(exitPoint);
      edge.closed = true;

      // secondaryEdge.insert(0, secondaryEntryPoint);
      secondaryEdge.add(secondaryExitPoint);
      secondaryEdge.closed = true;
      // edge.smooth();

    }

    // if path begins or ends outside of the mask bounds
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

      // joinPath = secondaryPath.clone();
      // joinPath.insert(0, newEntryPoint);
      // joinPath.add(newExitPoint);

      edge.closed = true;
      secondaryEdge.closed = true;
      // edge.smooth();


    }



    if (path.isInside(mask.bounds) === true) {

      // var clipPath = path.clone();
      // clipPath.join(joinPath);

      // var clippedMask = new Group({
      //     children: [clipPath, mask],
      //     clipped: true
      // });            

      // var clippedGroup = new Group({
      //     children: [clippedMask, rasterInit],
      //     clipped: true
      // }); 

      // clippedGroup.bringToFront(); 
      // edge.bringToFront();   
      // secondaryEdge.bringToFront(); 


      
      
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



