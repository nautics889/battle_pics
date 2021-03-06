try {
  var $ = require('jquery');
  require('webpack-jquery-ui/css');
  require('webpack-jquery-ui/slider');
  require('./style.css');
} catch (e) {
  console.warn("You are probably running a development version.");
  console.log(e);
}

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

  $("#tipWidthSlider").slider("enable");
}

function updateCanvas(correction) {
  const resize = (correction === undefined || correction.resize === undefined) ? $("#maskSizeSlider").slider('value') : correction.resize;
  const leftVertexXShift = (correction === undefined || correction.leftVertexXShift === undefined) ? $("#tipWidthSlider").slider('value') : correction.leftVertexXShift;
  
  console.log(leftVertexXShift);

  ctx.clearRect(0, 0, $("#imgCanvas").width(), $("#imgCanvas").height());
  ctx.drawImage(imgObj, 0, 0, imgObj.width, imgObj.height);

  const coef = resize / 100;
  const leftVertexXShiftAbsolute = Math.floor((imgObj.width / 4) / 100 * leftVertexXShift) * -1;

  ctx.beginPath();
  ctx.arc(circleX + moveXAmount, circleY + moveYAmount, Math.floor(circleRadius * coef), 0, 2 * Math.PI, false);
  ctx.fillStyle = maskColor;
  ctx.fill();

  ctx.beginPath();

  // deltas for top and bottom triangles vertices
  const deltaX = Math.floor((circleRadius * coef) - circleRadius);
  const deltaY = Math.floor(((bottomVertexY - topVertexY) * coef - (bottomVertexY - topVertexY)) / 2);

  ctx.moveTo(Math.floor(circleX - ((circleX - leftVertexX) * coef)) + moveXAmount + leftVertexXShiftAbsolute, leftVertexY + moveYAmount);
  ctx.lineTo(topVertexX - deltaX + moveXAmount, topVertexY - deltaY + moveYAmount); 
  ctx.lineTo(bottomVertexX - deltaX + moveXAmount, bottomVertexY + deltaY + moveYAmount);
  ctx.fillStyle = maskColor;
  ctx.fill();
}

const mobileDevice = ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) ? true : false;

// control events

const release = function(){
  isDragging = false;
  prevX=0;
  prevY=0;
}

const pinch = function() {
  isDragging = true;
  prevX=0;
  prevY=0;
}

const moving = function(event) {
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
};

if (mobileDevice) {
  $("#imgCanvas").on("touchstart", pinch);
  $(window).on("touchend", release);
  $(window).on("touchmove", moving);
} else {
  $("#imgCanvas").mousedown(pinch);
  $(window).mouseup(release);
  $(window).mousemove(moving);
}

// file form and slider

function handleFile (file) {
  try {
    const filename = file.name;
    if (!mimeTypesMap.has(filename.split(".")[filename.split(".").length - 1])) {
      alert("Unable to upload this file.");
      this.value = '';
      return;
    }

    document.getElementById("download").download = "battle_pic_" + filename;

    imgObj.src = URL.createObjectURL(file);
    imgObj.onload = initialCanvasDraw;

    $("#imgCanvas").css('cursor', 'pointer');
  } catch (e) {
    alert("Unable to upload this file.");
    console.log(e);
  }
};

$("#imgFileField").change(function(event) {
  handleFile(event.target.files[0]);
});

window.addEventListener('paste', function(event) {
  handleFile(event.clipboardData.files[0]);
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
    updateCanvas({ resize: ui.value });
  }
});

$("#maskSizeSlider").slider("disable");

$("#tipWidthSlider").slider({
  value: 0,
  min: -100,
  max: 100,
  step: 1,
  disable: true,
  slide: function (event, ui) {
    updateCanvas({ leftVertexXShift: ui.value });
  }
});

$("#tipWidthSlider").slider("disable");
