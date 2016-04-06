/// <reference path="references.ts" />

enum Mode { GPU, CPU }

let togglePause = function(el: HTMLInputElement) : void {
  el.value = isRunning ? "Start" : "Pause";
  isRunning = !isRunning;
  if (isRunning) { renderLoop() };
}

let renderer = function(gpuKernel: any, entities: number[][], 
                        camera: number[][], lights: number[][]) : () => void {

  let fps = {
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

  let updateFPS = function(fps: any) : void {
    var f = document.querySelector("#fps");
    f.innerHTML = fps.toString();
  }

  let nextTick = function() : void {
    if (!isRunning) { return; } // Pause render loop if not running

    updateFPS(fps.getFPS());

    gpuKernel(camera, lights, entities);
    let cv = document.getElementsByTagName("canvas")[0];
    let bdy = cv.parentNode;
    let newCanvas = gpuKernel.getCanvas();
    bdy.replaceChild(newCanvas, cv);

    entities[0][1] = (entities[0][1] + 2) % 900;
    entities[1][2] = (entities[1][2] + 2) % 700;
    setTimeout(renderLoop,1);            // Uncomment this line, and comment the next line
    // requestAnimationFrame(nextTick);     // to see how fast this could run...
  }

  return nextTick;
}

let createKernel = function(mode: Mode, entities: number[][]) : any {

  interface KernelOptions {
    dimensions?: number[],
    debug?: boolean,
    graphical?: boolean,
    safeTextureReadHack?: boolean,
    mode?: string,
    constants?: {}
  }

  let stringOfMode = function(mode: Mode) : string {
    switch(mode) {
      case Mode.CPU: return "cpu";
      case Mode.GPU: return "gpu";
    }
  }

  const opt: KernelOptions = {
    dimensions: [600, 600],
    debug: true,
    graphical: true,
    safeTextureReadHack: false,
    constants: {
      ENTITY_COUNT: entities.length,
      EMPTY: Entity.Type.EMPTY,
      SPHERE: Entity.Type.SPHERE,
      CUBOID: Entity.Type.CUBOID,
      CYLINDER: Entity.Type.CYLINDER,
      CONE: Entity.Type.CONE,
      TRIANGLE: Entity.Type.TRIANGLE
    }
  };

  let kernel = gpu.createKernel(function(camera: number[], lights: number[], entities: number[][]) {
    this.color(0.95, 0.95, 0.95);                      // By default canvas is light grey
    for (var i = 0; i < this.constants.ENTITY_COUNT; i++) {     // Look at all object records
      if (entities[i][0] == this.constants.SPHERE) { // i.e. if it is a SPHERE...
        if (dist(this.thread.x, this.thread.y, entities[i][1], entities[i][2]) < entities[i][7]) {
          this.color(entities[i][8],entities[i][9] + i, entities[i][10]);
        }
      } if (entities[i][0] == this.constants.CYLINDER) {
        if (dist(this.thread.x, 0, entities[i][1], 0) < entities[i][7] &&
           this.thread.y - entities[i][2] < entities[i][5] && 
           this.thread.y - entities[i][2] >= 0) {
          this.color(entities[i][8],entities[i][9] + i, entities[i][10]);
        }
      }
    }
  }, opt).mode(stringOfMode(mode));

  return kernel;
}

// entity declarations

// scene.js
let camera: number[][] = [
  [300, 300, 0],                     // x,y,z coordinates
  [0, 0, 1],                     // Direction normal vector
  [45]                         // field of view : example 45
];

let lights: number[][] = [
  [200, 200, 200, 0, 1, 0]        // light 1, x,y,z location, and rgb colour (green
];

let sphere_1_opts: Entity.Opts = {
  entityType: Entity.Type.SPHERE,
  red: 1.0,
  green: 0.7,
  blue: 0.7,
  x: 700,
  y: 500,
  z: 500,
  radius: 40,
  specularReflection: 0.2,
  lambertianReflection: 0.7,
  ambientColor: 0.1,
  opacity: 1.0,
}

let sphere_2_opts: Entity.Opts = {
  entityType: Entity.Type.SPHERE,
  red: 1.0,
  green: 0.7,
  blue: 0.2,
  x: 500,
  y: 100,
  z: 100,
  radius: 80,
  specularReflection: 0.2,
  lambertianReflection: 0.7,
  ambientColor: 0.1,
  opacity: 1.0,
}

let cylinder_opts: Entity.Opts = {
  entityType: Entity.Type.CYLINDER,
  red: 0.3,
  green: 1.0,
  blue: 0.6,
  x: 100,
  y: 100,
  z: 100,
  radius: 80,
  height: 200,
  specularReflection: 0.2,
  lambertianReflection: 0.7,
  ambientColor: 0.5,
  opacity: 1.0
}

let opts: Entity.Opts[] = [sphere_1_opts, sphere_2_opts, cylinder_opts];
let entities: number[][] = opts.map(function(opt) {
  let ent = new Entity.Entity(opt);
  return ent.toVector();
})

let addFunctions = function(gpu: any, functions: any[]) {
  functions.forEach(function(f) {
    gpu.addFunction(f);
  })
}

let gpu = new GPU();
addFunctions(gpu, vectorFunctions);
addFunctions(gpu, utilityFunctions);

// Global states
let isRunning = true;
let mode = Mode.GPU;

var canvas = document.getElementById('canvas');
let gpuKernel = createKernel(Mode.GPU, entities);

let renderLoop = renderer(gpuKernel, entities, camera, lights);
window.onload = renderLoop;
