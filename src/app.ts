/// <reference path="../vendor/gpu.d.ts" />

// Debugging helpers
function p(x) {
  console.log(x)
}

var gpu = new GPU();

enum ObjType { EMPTY, SPHERE, CUBOID, CYLINDER, CONE, TRIANGLE }
enum Mode { GPU, CPU }

interface FPS {
  startTime: number,
  frameNumber: number,
  getFPS: () => number
}

var fps: FPS = {
  startTime : 0,
  frameNumber : 0,
  getFPS : function() {
    this.frameNumber++;
    var d = new Date().getTime()
    var currentTime = (d - this.startTime) / 1000
    var result = Math.floor(this.frameNumber / currentTime);
    if (currentTime > 1) {
      this.startTime = new Date().getTime();
      this.frameNumber = 0;
    }
    return result;
  }
};

// scene.js
var camera: number[] = [
  0,1,2,                     // x,y,z coordinates
  4,4,4,                     // Direction normal vector
  45                         // field of view : example 45
];

var lights: number[] = [
  2,                         // number of lights
  200,200,200, 0,1,0,        // light 1, x,y,z location, and rgb colour (green)
  100,100,100, 1,1,1,        // light 2, x,y,z location, and rgb colour (white)
];

var objects: any[] = [
  2, // number of objects
  ObjType.SPHERE, 13, 1.0, 0.0, 0.0, 0.2, 0.7, 0.1, 1.0, 100, 500, 500, 40, // typ,recsz,r,g,b,spec,lamb,amb,opac, x,y,z,rad,
  ObjType.SPHERE, 13, 0.0, 0.0, 1.0, 0.2, 0.7, 0.1, 1.0, 200, 600, 200, 20 // typ,recsz,r,g,b,spec,lamb,amb,opac, x,y,z,rad,

]

function change(el: HTMLInputElement): void {
  if (mode === Mode.CPU) {
    mode = Mode.GPU;
    el.value = "Using GPU";
  } else {
    mode = Mode.CPU;
    el.value = "Using CPU";
  }
}

interface KernelOptions {
  dimensions?: number[],
  debug?: boolean,
  graphical?: boolean,
  safeTextureReadHack?: boolean,
  mode?: string,
  constants?: {}
}

function doit(mode) {
  var opt: KernelOptions = {
    dimensions: [800,600],
    debug: true,
    graphical: true,
    safeTextureReadHack: false,
    constants: {
      OBJCOUNT: objects[0],
      EMPTY: ObjType.EMPTY,
      SPHERE: ObjType.SPHERE,
      CUBOID: ObjType.CUBOID,
      CYLINDER: ObjType.CYLINDER,
      CONE: ObjType.CONE,
      TRIANGLE: ObjType.TRIANGLE
    },
    mode: mode
  };

  var y = gpu.createKernel(function(Camera,Lights,Objects) {
    var idx = 1;                                     // index for looking through all the objects
    var nextidx = 1;
    this.color(0.95,0.95,0.95);                      // By default canvas is light grey
    for (var i = 0; i < this.constants.OBJCOUNT; i++ ) {     // Look at all object records
      idx = nextidx;                               // Skip to next record
      nextidx = Objects[idx+1]+idx;                // Pre-compute the beginning of the next record
      if (Objects[idx] == this.constants.SPHERE) { // i.e. if it is a SPHERE...
        if (dist(this.thread.x,this.thread.y,Objects[idx+9],Objects[idx+10]) < Objects[idx+12]) {
          this.color(Objects[idx+2],Objects[idx+3],Objects[idx+4]);
        }
      }
    }
  }, opt);
  return y;
}

function renderLoop(): void {
  f.innerHTML = "" + fps.getFPS();
  if (mode === Mode.CPU) {
    mycode(camera,lights,objects);
    var cv = document.getElementsByTagName("canvas")[0];
    var bdy = cv.parentNode;
    var newCanvas = mycode.getCanvas();
    bdy.replaceChild(newCanvas, cv);
  } else {
    mykernel(camera,lights,objects);
    var cv = document.getElementsByTagName("canvas")[0];
    var bdy = cv.parentNode;
    var newCanvas = mykernel.getCanvas();
    bdy.replaceChild(newCanvas, cv);
  }
  objects[10] = (objects[10]+2) % 900;
  objects[24] = (objects[24]+2) % 700;
  //      setTimeout(renderLoop,1);            // Uncomment this line, and comment the next line
  requestAnimationFrame(renderLoop);     // to see how fast this could run...
}

function square(x: number): number {
  return x * x;
}

function dist(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(square(x2 - x1) + square(y2 - y1));
}

gpu.addFunction(square);
gpu.addFunction(dist);

var mode: Mode = Mode.CPU; // CPU mode on load

var mykernel = doit("gpu");
var mycode = doit("cpu");
mykernel(camera, lights, objects);
var canvas = mykernel.getCanvas();
document.getElementsByTagName('body')[0].appendChild(canvas);
var f = document.querySelector("#fps");

window.onload = renderLoop;
