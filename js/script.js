var canvas = document.getElementById('canvas');
var width = window.innerWidth;
var height = window.innerHeight;
var yDiff = height * .1;
var xDiff = width * .1;
console.log(canvas.height);

// Create a raster for the revealed image.

var rasterReveal = new Raster({
    source: '/img/Zumak2.jpg',
    position: view.center,
    shadowColor: new Color(0, 0, 0, .5),
    shadowBlur: 80,
    shadowOffset: new Point(15, 20)
});

// Move the raster to the center of the view
rasterReveal.position = view.center;

// function to scale raster based on viewport size
function resizeImg(image) {
    var width = canvas.height; 
    var scale = (height / image.bounds.height) * 0.75;
    image.scale(scale);
}

// Create a raster for the initial image.
var rasterInit = new Raster('image1');

// Move the raster to the center of the view
rasterInit.position = view.center;


resizeImg(rasterReveal);
resizeImg(rasterInit);


// var square = new Path.Rectangle({
//     position: view.center,
//     size: 1000,
// });


// var circle = new Path.Circle(new Point(80, 50), 200);
// circle.position = view.center;

// var myPath;
// var result;

// function onMouseDown(event) {
//     myPath = new Path();
//     myPath.strokeColor = 'red';
// }

// function onMouseDrag(event) {
//     myPath.add(event.point);

// }



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



