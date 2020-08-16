var $ = require('jquery');
require('webpack-jquery-ui/css');
require('webpack-jquery-ui/slider');
require('./style.css');

const imgObj = new Image();
const ctx = document.getElementById("imgCanvas").getContext("2d");

const maskColor = '#dddddd';

let mimeTypesMap = new Map()
mimeTypesMap.set("jpg", "image/jpeg");
mimeTypesMap.set("jpeg", "image/jpeg");
mimeTypesMap.set("png", "image/png");

let moveXAmount = 0;
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

function initialCanvasDraw() {
  document.getElementById("imgCanvas").width = imgObj.width;
  document.getElementById("imgCanvas").height = imgObj.height;
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
  ctx.fillStyle = maskColor;
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
  ctx.fillStyle = maskColor;
  ctx.fill();

  $("#maskSizeSlider").slider("enable");
  $("#maskSizeSlider").slider("value", 100);
}

function updateCanvas(resize = undefined) {
  if (resize === undefined) {
    resize = $("#maskSizeSlider").slider('value');
  }
  ctx.clearRect(0, 0, $("#imgCanvas").width(), $("#imgCanvas").height());
  ctx.drawImage(imgObj, 0, 0, imgObj.width, imgObj.height);

  const coef = resize / 100;

  ctx.beginPath();
  ctx.arc(circleX + moveXAmount, circleY + moveYAmount, Math.floor(circleRadius * coef), 0, 2 * Math.PI, false);
  ctx.fillStyle = maskColor;
  ctx.fill();

  ctx.beginPath();

  // deltas for top and bottom triangles vertices
  const deltaX = Math.floor((circleRadius * coef) - circleRadius);
  const deltaY = Math.floor(((bottomVertexY - topVertexY) * coef - (bottomVertexY - topVertexY)) / 2);

  ctx.moveTo(Math.floor(circleX - ((circleX - leftVertexX) * coef)) + moveXAmount, leftVertexY + moveYAmount);
  ctx.lineTo(topVertexX - deltaX + moveXAmount, topVertexY - deltaY + moveYAmount); 
  ctx.lineTo(bottomVertexX - deltaX + moveXAmount, bottomVertexY + deltaY + moveYAmount);
  ctx.fillStyle = maskColor;
  ctx.fill();
}

// control events

$("#imgCanvas").mousedown(function() {
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

$("#imgFileField").change(function (event) {
  const filename = event.target.files[0].name;
  if (!mimeTypesMap.has(filename.split(".")[filename.split(".").length - 1])) {
    alert("Unable to upload this file.");
    this.value = '';
    return;
  }

  document.getElementById("download").download = "battle_pic_" + filename;

  imgObj.src = URL.createObjectURL(event.target.files[0]);
  imgObj.onload = initialCanvasDraw;
});

$("#download").click(function(event) {
  const ext = this.download.split(".")[this.download.split(".").length - 1];
  this.href = document.getElementById("imgCanvas").toDataURL(mimeTypesMap.get(ext));
});

$("#maskSizeSlider").slider({
  value: 100,
  min: 50,
  max: 200,
  step: 1,
  disable: true,
  slide: function (event, ui) {
    updateCanvas(ui.value);
  }
});

$("#maskSizeSlider").slider("disable");
