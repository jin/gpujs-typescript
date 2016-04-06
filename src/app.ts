/// <reference path="references.ts" />

enum Mode { GPU, CPU }

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
    dimensions: [800, 600],
    debug: false,
    graphical: true,
    safeTextureReadHack: false,
    constants: {
      OBJCOUNT: entities.length,
      EMPTY: Entity.Type.EMPTY,
      SPHERE: Entity.Type.SPHERE,
      CUBOID: Entity.Type.CUBOID,
      CYLINDER: Entity.Type.CYLINDER,
      CONE: Entity.Type.CONE,
      TRIANGLE: Entity.Type.TRIANGLE
    },
    mode: stringOfMode(mode) // can be either cpu or gpu
  };

  let kernel = gpu.createKernel(function(Camera: number[], Lights: number[], Entities: number[][]) {
    this.color(0.95, 0.95, 0.95);                      // By default canvas is light grey
    for (var i = 0; i < this.constants.OBJCOUNT; i++) {     // Look at all object records
      if (Entities[i][0] == this.constants.SPHERE) { // i.e. if it is a SPHERE...
        if (dist(this.thread.x, this.thread.y, Entities[i][1], Entities[i][2]) < Entities[i][7]) {
          this.color(Entities[i][8], Entities[i][9], Entities[i][10]);
        }
      }
    }
  }, opt);

  return kernel;
}

let renderer = function(gpuKernel: any, cpuKernel: any, entities: number[][], 
                        camera: number[], lights: number[]) : () => void {

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

    if (mode === Mode.CPU) {
      cpuKernel(camera, lights, entities);
      var cv = document.getElementsByTagName("canvas")[0];
      var bdy = cv.parentNode;
      var newCanvas = cpuKernel.getCanvas();
    } else {
      gpuKernel(camera, lights, entities);
      var cv = document.getElementsByTagName("canvas")[0];
      var bdy = cv.parentNode;
      var newCanvas = gpuKernel.getCanvas();
    }

    bdy.replaceChild(newCanvas, cv);

    entities[0][1] = (entities[0][1] + 2) % 900;
    entities[1][2] = (entities[1][2] + 2) % 700;
    setTimeout(renderLoop,1);            // Uncomment this line, and comment the next line
    // requestAnimationFrame(nextTick);     // to see how fast this could run...
  }

  const canvas = gpuKernel.getCanvas();
  document.getElementsByTagName('body')[0].appendChild(canvas);

  return nextTick;
}

// entity declarations

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
  x: 700,
  y: 600,
  z: 200,
  radius: 80,
  specularReflection: 0.2,
  lambertianReflection: 0.7,
  ambientColor: 0.1,
  opacity: 1.0,
}

let opts: Entity.Opts[] = [sphere_1_opts, sphere_2_opts];
let entities: number[][] = opts.map(function(opt) {
  return (new Entity.Entity(opt)).toNumberArray();
})

let gpu = new GPU();
utilityFunctions.forEach(function(f) { gpu.addFunction(f); })

// Global states
let isRunning = true;
let mode: Mode = Mode.GPU;

let gpuKernel = createKernel(Mode.GPU, entities);
let cpuKernel = createKernel(Mode.CPU, entities);

let renderLoop = renderer(gpuKernel, cpuKernel, entities, camera, lights);
window.onload = renderLoop;
