
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

var rasterClip = rasterInit.clone();

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


var actionPath;
var actionRect;

var dataLeft = 'M40.186,0 45.767,18.419 47.442,29.023 51.907,52.465 53.023,67.535 53.581,84.837 52.465,93.767 46.884,123.349 44.651,168 31.814,267.906 16.744,347.72 10.605,396.836 14.512,448.743 27.349,475.534 27.349,510.697 37.953,563.72 37.395,584.371 35.721,641.301 27.907,723.347 32.93,766.324 46.325,812.649 40.186,848.929 30.139,886.324 6.14,930.417 0,962.789 2.233,1021.951 8.93,1071.626 16.744,1119.626 34.605,1168.184 39.07,1199.439';
var dataRight = 'M129.776,-380.313 138.776,-268.313 138.776,-248.313 121.776,-195.313 103.776,-98.313 108.776,-26.313 113.776,34.687 128.776,86.687 148.776,216.687 159.776,340.687 173.776,371.687 173.776,392.687 143.776,493.687 124.776,576.687 118.776,662.687 131.776,710.687 155.776,772.687 162.776,819.687';
  

//helper function for random selection
function getRandomInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.ceil(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


function drawPath(dataLeft, dataRight) {

  var clipPathLeft = new Path(dataLeft);
  clipPathLeft.strokeColor = 'hotpink';
  clipPathLeft.bringToFront();
  resizeImg(clipPathLeft);
  clipPathLeft.position = view.center;

  var clipPathRight = new Path(dataRight);
  clipPathRight.strokeColor = 'hotpink';
  clipPathRight.bringToFront();
  resizeImg(clipPathRight);
  clipPathRight.position = view.center;

  var move = - (mask.bounds.width / 10) * 4;

  var offsetLeft = new Point(move, 0);

  var offsetRight = new Point(-move, 0);

  
  clipPathLeft.translate(offsetLeft);
  clipPathRight.translate(offsetRight);

  clipPathRight.insert(0, clipPathLeft.firstSegment);

  clipPathLeft.join(clipPathRight);
  clipPathLeft.closed = true;

  var edgeLeft = new Raster({
    source: '/img/textures/edge-left-1.png',
    position: view.center
  });

  resizeImg(edgeLeft);

  var edgeRight = new Raster({
    source: '/img/textures/edge-right-1.png',
    position: view.center
  });

  resizeImg(edgeRight);
  edgeLeft.translate(offsetLeft);
  edgeRight.translate(offsetRight);

  var clippedMask = new Group({
      children: [clipPathLeft, mask],
      clipped: true
  });            

  var clippedGroup = new Group({
      children: [clippedMask, rasterInit],
      clipped: true
  }); 

  edgeLeft.bringToFront();
  edgeRight.bringToFront();



}

drawPath(dataLeft, dataRight);

rasterClip.bringToFront();


//beginning of mouse interactions
tool.fixedDistance = 5;

var rangeMin = mask.bounds.y;
var rangeMax = mask.bounds.y + mask.bounds.height;
var midpoint = mask.bounds.x + (mask.bounds.width / 2);
var rectHeight;

tool.onMouseDown = function(event) {

    if (actionPath !== undefined) {
      actionPath.removeSegments();
    }

    if (event.point.y < rangeMin) {
      console.log("event.point is above the mask");

    }

    if (event.point.y > rangeMax) {
      console.log("event.point is above the mask");

    }




    actionPath = new Path();
    actionPath.add(event.point);
    // actionPath.strokeColor = '#ff9900';

    rectHeight = event.point.y - mask.bounds.y;

    actionRect = new Path.Rectangle({
        point: [mask.bounds.x, mask.bounds.y],
        size: [mask.bounds.width, rectHeight],
        pivot: [mask.bounds.x, mask.bounds.y]
    });

    actionRect.bringToFront(); 

    if (event.point.y >= rangeMin && event.point.y <= rangeMax) {
      console.log("event.point is inside the mask");
      var zeroedPoint = new Point(midpoint, event.point.y);
      var entryPoint = mask.getNearestLocation(zeroedPoint);
      actionPath.insert(0, entryPoint);


    }

}



  tool.onMouseDrag = function(event) {
      // Add a point to the path every time the mouse is dragged
      if (event.point.y < rangeMin) {
        console.log("event.point is above the mask");

      }

      if (event.point.y > rangeMax) {
        console.log("event.point is above the mask");


      }



        // event.preventDefault();
        actionPath.add(event.point);

        actionPath.add(event.point);

        rectHeight = event.point.y - mask.bounds.y;

        var scale = rectHeight / actionRect.bounds.height;

        actionRect.scale(1, scale, actionRect.pivot);

        var clippingMask = mask.subtract(actionRect);


        var clippedRaster = new Group({
          children: [clippingMask, rasterClip],
          clipped: true
        });   

      

      
  }

  tool.onMouseUp = function(event) {

    if (event.point.y >= rangeMin && event.point.y <= rangeMax) {
      var zeroedPoint = new Point(midpoint, event.point.y);
      var exitPoint = mask.getNearestLocation(zeroedPoint);
    
      actionPath.add(event.point);
      actionPath.add(exitPoint);

    }

    else if (event.point.y > rangeMax) {
      actionPath.add(event.point);
    }

    var endPoint = actionPath.lastSegment.point;
  
    rectHeight = endPoint.y - mask.bounds.y;

    var scale = rectHeight / actionRect.bounds.height;

    actionRect.scale(1, scale, actionRect.pivot);

    var clippingMask = mask.subtract(actionRect);


    var clippedRaster = new Group({
      children: [clippingMask, rasterClip],
      clipped: true
    });    


   }

});



