const imgObj = new Image();
const ctx = document.getElementById("myCanvas").getContext("2d");

let moveXAmount =0;
let moveYAmount = 0;
let isDragging = false;
let prevX = 0;
let prevY = 0;

let circleX;
let circleY;
let circleRadius;
let leftVertexX;
let leftVertexY;
let topVertexX;
let topVertexY;
let bottomVertexX;
let bottomVertexY;

const topVertexYShiftCoef = 0.4;
const bottomVertexYShiftCoef = 0.6;

function handlePicture(e) {
  imgObj.src = URL.createObjectURL(e.target.files[0]);
  imgObj.onload = initialCanvasDraw;
}

function initialCanvasDraw() {
  document.getElementById("myCanvas").width = imgObj.width;
  document.getElementById("myCanvas").height = imgObj.height;
  ctx.drawImage(imgObj, 0, 0);
  
  // drawing mask in shape of speech cloud
  // mask is drawn by circle and triangle at the left side of the circle

  // circle 

  circleX = imgObj.width + Math.floor(imgObj.height * 0.8);
  circleY = Math.floor(imgObj.height / 2);
  // radius should equal height of an image (as optimal for default)
  circleRadius = imgObj.height;

  ctx.beginPath();
  ctx.arc(circleX, circleY, circleRadius, 0, 2 * Math.PI, false);
  ctx.fillStyle = '#dddddd';
  ctx.fill();

  // triangle

  // middle of the image is an optimal point where to unfold a tip to
  leftVertexX = Math.floor(imgObj.width / 2);
  leftVertexY = Math.floor(circleRadius / 2);
  topVertexX = imgObj.width;
  topVertexY = Math.floor(imgObj.height * topVertexYShiftCoef);
  bottomVertexX = imgObj.width;
  bottomVertexY = Math.floor(imgObj.height * bottomVertexYShiftCoef);
  
  ctx.beginPath();
  ctx.moveTo(leftVertexX, leftVertexY);
  ctx.lineTo(topVertexX, topVertexY);
  ctx.lineTo(bottomVertexX, bottomVertexY);
  ctx.fillStyle = '#dddddd';
  ctx.fill();

  $("#slider").slider("enable");
  $("#slider").slider("value", 100);
}

function updateCanvas(resize = undefined) {
  if (resize === undefined) {
    resize = $("#slider").slider('value');
  }
  ctx.clearRect(0, 0, $("#myCanvas").width(), $("#myCanvas").height());
  ctx.drawImage(imgObj, 0, 0, imgObj.width, imgObj.height);

  const coef = resize / 100;

  ctx.beginPath();
  ctx.arc(circleX + moveXAmount, circleY + moveYAmount, Math.floor(circleRadius * coef), 0, 2 * Math.PI, false);
  ctx.fillStyle = '#dddddd';
  ctx.fill();

  ctx.beginPath();

  // deltas for top and bottom triangles vertices
  const deltaX = Math.floor((circleRadius * coef) - circleRadius);
  const deltaY = Math.floor(((bottomVertexY - topVertexY) * coef - (bottomVertexY - topVertexY)) / 2);

  ctx.moveTo(Math.floor(circleX - ((circleX - leftVertexX) * coef)) + moveXAmount, leftVertexY + moveYAmount);
  ctx.lineTo(topVertexX - deltaX + moveXAmount, topVertexY - deltaY + moveYAmount); 
  ctx.lineTo(bottomVertexX - deltaX + moveXAmount, bottomVertexY + deltaY + moveYAmount);
  ctx.fillStyle = '#dddddd';
  ctx.fill();
}

// control events

$("#myCanvas").mousedown(function() {
  isDragging = true;
  prevX=0;
  prevY=0;
});

$(window).mouseup(function(){
  isDragging = false;
  prevX=0;
  prevY=0;
});

$(window).mousemove(function(event) {
  if( isDragging === true )
  {
    if( prevX>0 || prevY>0)
    {
      moveXAmount += event.pageX - prevX;
      moveYAmount += event.pageY - prevY;
      updateCanvas();
    }
    prevX = event.pageX;
    prevY = event.pageY;
  }
});

// file form and slider

$("#picFile").change(handlePicture);

$("#slider").slider({
  value: 100,
  min: 50,
  max: 200,
  step: 1,
  disable: true,
  slide: function (event, ui) {
    updateCanvas(ui.value);
  }
});

$("#slider").slider("disable");
