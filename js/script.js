
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

  tool.minDistance = 4;
  tool.maxDistance = 15;

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

      edge = new Path();
      edge.add(event.point);
      // edge.strokeColor = 'white';
      edge.fillColor = 'white';
      
  }

  tool.onMouseDrag = function(event) {
      // Add a point to the path every time the mouse is dragged
      path.add(event.point);

      var step = event.delta;
      step.angle += 90;

      var top = event.middlePoint + step;
      var bottom = event.middlePoint - step;

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

      // path.strokeColor = 'hotpink';

      var textures = new Group();

      var texturesNo = Math.round(path.length / 40);

      console.log(texturesNo);     

      // function drawSquares(path, texturesNo) {

      //   var i;

      //   for (i = 0; i < texturesNo; i++) {

      //     var location = path.getLocationAt(40*i);

      //     var rectangle = new Shape.Rectangle({
      //       point: [(location.segment.point.x - 50), (location.segment.point.y - 50)],
      //       size: [100, 100],
      //     });
      //     rectangle.strokeColor = 'hotpink';
      //     // var rotation = - location.segment.point.angle / 2;

      //     // console.log(rotation);

      //     // rectangle.rotate(rotation);
      //     textures.addChild(rectangle);

      //     i++;

      //     // var texture = new Raster({
      //     //   source: 'img/textures/edge-tile-1.png',
      //     //   size: [100, 100],
      //     //   position: [(location.segment.point.x - 50), (location.segment.point.y - 50)],
      //     //   rotation: 180 - rotation
      //     // });

      //     // textures.addChild(texture);

      //   }


      // }

      //   drawSquares(path, texturesNo);


        // var rectangle = new Shape.Rectangle({
        //   point: [(segment.point.x - 50), (segment.point.y - 50)],
        //   size: [100, 100],
        // });
        // rectangle.strokeColor = 'hotpink';

        // var rotation = segment.point.angle += 90;

        // rectangle.rotate(rotation);

        // textures.addChild(rectangle);

      

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

      // textures.translate(100, -100).bringToFront();

      groupA.translate(100, -100).bringToFront();
      edge.translate(100, -100).bringToFront();
      groupB.translate(-100, 100); 
      edgeB.translate(-100, 100).bringToFront();   


    }

    else {
      path.removeSegments();
    }



  }

});

var actionPath;
// var result;

// function bisectBounding(boundingBox) {
//   var boundB = boundingBox.clone();
//   boundB.style = {
//     strokeColor: "blue",
//   }
// }



// var circle = new Path.Circle(new Point(80, 50), 200);
// circle.position = view.center;



// var startArr = [];
// function startPush(endpoint) {
//     console.log("running...");
//     console.log(startArr);  
//     var newPoint = endpoint;
//     do{
//         console.log(startArr);
//         console.log(newPoint);
//         var newPoint = [Math.round(newPoint[0] - xDiff), Math.round(newPoint[1] - yDiff)];  
//         console.log(newPoint);
//         startArr.splice(0, 0, newPoint);
//         console.log(startArr); } while (newPoint[0] > 0 && newPoint[1] > 0) 

//     startArr.splice(0, 0, [0, 0]);
//     console.log(startArr);
// }


// function onMouseUp(event) {

//     var startX = myPath.firstSegment.point.x;
//     var startY = myPath.firstSegment.point.y;
//     var endX = myPath.lastSegment.point.x;
//     var endY = myPath.lastSegment.point.y;
//     var xDirection = endX - startX;
//     var yDirection = endY - startY;
//     console.log(xDirection);
//     console.log(yDirection);
//     console.log(endY);
//     console.log(startY);
//     var firstX = 100;
//     var firstY = 100;
//     var lastX = 0;
//     var lastY = height;

//     startPush([startX, startY]);

//     var startPoints = [];

//     for (var i = 0; i < startArr.length; i++) {
//         startPoints[i] = new Point(startArr[i])
//     }

//     console.log(startPoints);
//     console.log(myPath.segments);


//     myPath.insertSegments(0, startPoints);
//     myPath.add(new Point(lastX, lastY));
    


//     result = square.subtract(myPath);
//     result.position = view.center;
    

//     // Mask the image:
//     var group = new Group({
//         children: [result, raster2],
//         clipped: true
//     });


// }



