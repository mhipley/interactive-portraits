
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
  var newPath;

  // Only execute onMouseDrag when the mouse
  // has moved at least 50 points:
  tool.minDistance = 50;

  tool.onMouseDown = function(event) {
      // Create a new path every time the mouse is clicked

      if (path !== undefined) {
        path.removeSegments();
      }
   
      path = new Path();
      path.add(event.point);
      path.strokeColor = '#39FF14';
      path.strokeWidth = 5;
  }

  tool.onMouseDrag = function(event) {
      // Add a point to the path every time the mouse is dragged
      path.add(event.point);
  }

  tool.onMouseUp = function(event) {

    var entryPoint = boundA.getNearestLocation(path.firstSegment.point);
    var exitPoint = boundA.getNearestLocation(event.point);

    var intersections = boundA.getCrossings(path);

    if (intersections === undefined || intersections.length == 0){
      path.insert(0, entryPoint);
      path.add(exitPoint);
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
    }



    if (path.isInside(boundA.bounds) === true) {

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

      groupA.translate(100, 0);
      groupB.translate(-100, 0);    

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



