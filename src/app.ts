/// <reference path="../vendor/gpu.d.ts" />

// Debugging helpers
function p(x) {
  console.log(x)
}

// Global states

var fps = {
  startTime: 0,
  frameNumber: 0,
  getFPS: function() {
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
let camera: number[] = [
  0,1,2,                     // x,y,z coordinates
  4,4,4,                     // Direction normal vector
  45                         // field of view : example 45
];

let lights: number[] = [
  2,                         // number of lights
  200,200,200, 0,1,0,        // light 1, x,y,z location, and rgb colour (green)
  100,100,100, 1,1,1,        // light 2, x,y,z location, and rgb colour (white)
];

enum EntityType { EMPTY, SPHERE, CUBOID, CYLINDER, CONE, TRIANGLE }
enum Mode { GPU, CPU }

let stringOfMode = function(mode: Mode) : string {
  switch(mode) {
    case Mode.CPU: return "cpu";
    case Mode.GPU: return "gpu";
  }
}

interface RGB {
  red: number,
  green: number,
  blue: number
}

interface XYZ {
  x?: number,
  y?: number,
  z?: number
}

interface Dimensions {
  width?: number,
  height?: number,
  depth?: number,
  radius?: number
}

interface EntityOpts {
  entityType: EntityType,
  dimensions: Dimensions,
  coordinates: XYZ,
  color: RGB,
  lambertianReflection: number, // Lambertian model reflection 0 to 1
  opacity: number, // 0 to 1
  specularReflection: number,  // 0 to 1
  ambientColor: number // 0 to 1
}

class Entity {

  entityType: EntityType
  dimensions: Dimensions
  coordinates: XYZ
  color: RGB
  lambertianReflection: number // Lambertian model reflection 0 to 1
  opacity: number // 0 to 1
  specularReflection: number  // 0 to 1
  ambientColor: number // 0 to 1

  constructor(opts: EntityOpts) {
    this.entityType = opts.entityType;
    this.color = opts.color;
    this.specularReflection = opts.specularReflection;
    this.lambertianReflection = opts.lambertianReflection;
    this.ambientColor = opts.ambientColor;
    this.opacity = opts.opacity;
    this.coordinates = opts.coordinates;
    this.dimensions = opts.dimensions;
  }

}

let sphere_1_opts: EntityOpts = {
  entityType: EntityType.SPHERE,
  color: { red: 1.0, green: 1.0, blue: 0.7 },
  specularReflection: 0.2,
  lambertianReflection: 0.7,
  ambientColor: 0.1,
  opacity: 1.0,
  coordinates: { x: 100, y: 500, z: 500 },
  dimensions: { radius: 40 }
}

let sphere_2_opts: EntityOpts = {
  entityType: EntityType.SPHERE,
  color: { red: 0.0, green: 0.0, blue: 0.7 },
  specularReflection: 0.2,
  lambertianReflection: 0.7,
  ambientColor: 0.1,
  opacity: 1.0,
  coordinates: { x: 200, y: 600, z: 200 },
  dimensions: { radius: 20 }
}

let entities: Entity[] = [
  new Entity(sphere_1_opts),
  new Entity(sphere_2_opts)
]

let objects: any[] = [
  2, // number of objects
  EntityType.SPHERE, 13, 1.0, 1.0, 0.7, 0.2, 0.7, 0.1, 1.0, 100, 500, 500, 40, // typ,recsz,r,g,b,spec,lamb,amb,opac, x,y,z,rad,
  EntityType.SPHERE, 13, 0.0, 0.0, 1.0, 0.2, 0.7, 0.1, 1.0, 200, 600, 200, 20 // typ,recsz,r,g,b,spec,lamb,amb,opac, x,y,z,rad,
]

let toggleMode = function(el: HTMLInputElement) : void {
  switch (mode) {
    case Mode.CPU:
      mode = Mode.GPU;
      el.value = "Using GPU";
      break;
    case Mode.GPU:
      mode = Mode.CPU;
      el.value = "Using CPU";
      break;
  }
}

let togglePause = function(el: HTMLInputElement) : void {
  el.value = isRunning ? "Start" : "Pause";
  isRunning = !isRunning;
  if (isRunning) { renderLoop() };
}

interface KernelOptions {
  dimensions?: number[],
  debug?: boolean,
  graphical?: boolean,
  safeTextureReadHack?: boolean,
  mode?: string,
  constants?: {}
}

let createKernel = function(mode: Mode) : any {

  var opt: KernelOptions = {
    dimensions: [800, 600],
    debug: true,
    graphical: true,
    safeTextureReadHack: false,
    constants: {
      OBJCOUNT: objects[0],
      EMPTY: EntityType.EMPTY,
      SPHERE: EntityType.SPHERE,
      CUBOID: EntityType.CUBOID,
      CYLINDER: EntityType.CYLINDER,
      CONE: EntityType.CONE,
      TRIANGLE: EntityType.TRIANGLE
    },
    mode: stringOfMode(mode) // can be either cpu or gpu
  };

  var kernel = gpu.createKernel(function(Camera, Lights, Objects) {
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

  return kernel;
}

let updateFPS = function(fps) : void {
  var f = document.querySelector("#fps");
  f.innerHTML = fps.toString();
}

let renderLoop = function() : void {
  // Pause render loop if not running
  if (!isRunning) { return; }

  updateFPS(fps.getFPS());

  if (mode === Mode.CPU) {
    cpuKernel(camera,lights,objects);
    var cv = document.getElementsByTagName("canvas")[0];
    var bdy = cv.parentNode;
    var newCanvas = cpuKernel.getCanvas();
    bdy.replaceChild(newCanvas, cv);
  } else {
    gpuKernel(camera,lights,objects);
    var cv = document.getElementsByTagName("canvas")[0];
    var bdy = cv.parentNode;
    var newCanvas = gpuKernel.getCanvas();
    bdy.replaceChild(newCanvas, cv);
  }
  objects[10] = (objects[10] + 2) % 900;
  objects[24] = (objects[24] + 2) % 700;
  setTimeout(renderLoop,1);            // Uncomment this line, and comment the next line
  // requestAnimationFrame(renderLoop);     // to see how fast this could run...
}

function square(x: number) : number {
  return x * x;
}

function dist(x1: number, y1: number, x2: number, y2: number) : number {
  return Math.sqrt(square(x2 - x1) + square(y2 - y1));
}

let gpu = new GPU();
gpu.addFunction(square);
gpu.addFunction(dist);

let isRunning = true;
let mode: Mode = Mode.GPU; // GPU mode on load
let gpuKernel = createKernel(Mode.GPU);
let cpuKernel = createKernel(Mode.CPU);

gpuKernel(camera, lights, objects);
var canvas = gpuKernel.getCanvas();
document.getElementsByTagName('body')[0].appendChild(canvas);

window.onload = renderLoop;
