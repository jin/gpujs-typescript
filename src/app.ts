/// <reference path="references.ts" />

enum Mode { GPU, CPU }

// Global states
var isRunning = true;
var mode = Mode.GPU;

let togglePause = (el: HTMLInputElement) : void => {
  el.value = isRunning ? "Start" : "Pause";
  isRunning = !isRunning;
  renderLoop = renderer(gpuKernel, cpuKernel, gpuCanvas, cpuCanvas, scene);
  if (isRunning) { renderLoop() };
}

let toggleMode = (el: HTMLInputElement) : void => {
  el.value = (mode == Mode.CPU) ? "CPU" : "GPU";
  mode = (mode == Mode.CPU) ? Mode.GPU : Mode.CPU;
  if (isRunning) { renderLoop() };
}

var renderer = (gpuKernel: any, cpuKernel: any, 
                gpuCanvas: any, cpuCanvas: any, scene: Scene.Scene) : () => void => {


  let camera = scene.camera,
    lights = scene.lights,
    entities = scene.entities.map(f => f.toVector()),
    eyeVector = scene.eyeVector,
    vpRight = scene.vpRight,
    vpUp = scene.vpUp,
    canvasHeight = scene.canvasHeight,
    canvasWidth = scene.canvasWidth,
    fovRadians = scene.fovRadians,
    heightWidthRatio = scene.heightWidthRatio,
    halfWidth = scene.halfWidth,
    halfHeight = scene.halfHeight,
    cameraWidth = scene.cameraWidth,
    cameraHeight = scene.cameraHeight,
    pixelWidth = scene.pixelWidth,
    pixelHeight = scene.pixelHeight;

  var fps = {
    startTime: 0,
    frameNumber: 0,
    getFPS: function(){
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

  let updateFPS = (fps: any) : void => {
    var f = document.querySelector("#fps");
    f.innerHTML = fps.toString();
  }

  let nextTick = () : void => {
    if (!isRunning) { return; } // Pause render loop if not running

    updateFPS(fps.getFPS());

    if (mode == Mode.CPU) {
      cpuKernel(
        camera,
        lights,
        entities,
        eyeVector,
        vpRight,
        vpUp,
        canvasHeight,
        canvasWidth,
        fovRadians,
        heightWidthRatio,
        halfWidth,
        halfHeight,
        cameraWidth,
        cameraHeight,
        pixelWidth,
        pixelHeight
      );
      var cv = document.getElementsByTagName("canvas")[0];
      let bdy = cv.parentNode;
      let newCanvas = gpuKernel.getCanvas();
      bdy.replaceChild(newCanvas, cv);
    } else {
      gpuKernel(
        camera,
        lights,
        entities,
        eyeVector,
        vpRight,
        vpUp,
        canvasHeight,
        canvasWidth,
        fovRadians,
        heightWidthRatio,
        halfWidth,
        halfHeight,
        cameraWidth,
        cameraHeight,
        pixelWidth,
        pixelHeight
      );
      var cv = document.getElementsByTagName("canvas")[0];
      let bdy = cv.parentNode;
      let newCanvas = gpuKernel.getCanvas();
      bdy.replaceChild(newCanvas, cv);
    }

    entities.forEach(function(entity, idx) {
      entities[idx] = moveEntity(canvasWidth, canvasWidth, canvasWidth, entity);
    })

    // entities[0][1] = (entities[0][1] + 1) % 900;
    // entities[0][1] = (entities[0][2] + 1) % 900;
    // entities[1][2] = (entities[1][2] + 2) % 700;
    // setTimeout(renderLoop, 1);            // Uncomment this line, and comment the next line
    requestAnimationFrame(nextTick);     // to see how fast this could run...
  }

  let moveEntity = (width, height, depth, entity) => {
    let reflect = (entity, normal) => {
      let incidentVec = [entity[15], entity[16], entity[17]];
      let dp = vecDotProduct(incidentVec, normal);
      let tmp = vecSubtract(incidentVec, vecScale(normal, 2 * dp));
      return tmp;
    }
    // console.log(width, height, depth)
    // console.log(entity[1], entity[2], entity[3])
    entity[1] += entity[15];
    entity[2] += entity[16];
    entity[3] += entity[17];
    let needsReflect = false;
    var normal;
    if (entity[1] < -4) {
      normal = [1, 0, 0], needsReflect = true;
    } 
    if (entity[1] > 4.2) {
      normal = [-1, 0, 0], needsReflect = true;
    }
    if (entity[2] < 0) {
      normal = [0, 1, 0], needsReflect = true;
    }
    if (entity[2] > 7) {
      normal = [0, -1, 0], needsReflect = true;
    }
    if (entity[3] < -7) {
      normal = [0, 0, 1], needsReflect = true;
    }
    if (entity[3] > 2) {
      normal = [0, 0, -1], needsReflect = true;
    }
    if (needsReflect) {
      [entity[15], entity[16], entity[17]] = reflect(entity, normal);
    }
    return entity;
  }

  return nextTick;
}

var createKernel = (mode: Mode, scene: Scene.Scene) : any => {

  interface KernelOptions {
    dimensions?: number[],
    debug?: boolean,
    graphical?: boolean,
    safeTextureReadHack?: boolean,
    mode?: string,
    constants?: {}
  }

  let stringOfMode = (mode: Mode) : string => {
    switch(mode) {
      case Mode.CPU: return "cpu";
      case Mode.GPU: return "gpu";
    }
  }

  const opt: KernelOptions = {
    mode: stringOfMode(mode),
    dimensions: [600, 600],
    debug: true,
    graphical: true,
    safeTextureReadHack: false,
    constants: {
      ENTITY_COUNT: scene.entities.length,
      EMPTY: Entity.Type.EMPTY,
      SPHERE: Entity.Type.SPHERE,
      CUBOID: Entity.Type.CUBOID,
      CYLINDER: Entity.Type.CYLINDER,
      CONE: Entity.Type.CONE,
      TRIANGLE: Entity.Type.TRIANGLE
    }
  };

  return gpu.createKernel(function(
    camera: number[], 
    lights: number[], 
    entities: number[][], 
    eyeVector: number[],
    vpRight: number[],
    vpUp: number[],
    canvasHeight: number,
    canvasWidth: number,
    fovRadians: number,
    heightWidthRatio: number,
    halfWidth: number,
    halfHeight: number,
    cameraWidth: number,
    cameraHeight: number,
    pixelWidth: number,
    pixelHeight: number) {

    // Kernel canary code
    var x1 = addX(1, 2, 3, 4, 5, 6);
    var x2 = addY(1, 2, 3, 4, 5, 6);
    var x3 = addZ(1, 2, 3, 4, 5, 6);
    var x4 = subtractX(1, 2, 3, 4, 5, 6);
    var x5 = subtractY(1, 2, 3, 4, 5, 6);
    var x6 = subtractZ(1, 2, 3, 4, 5, 6);
    var x7 = normalizeX(1, 2, 3);
    var x8 = normalizeY(1, 2, 3);
    var x9 = normalizeZ(1, 2, 3);
    var x10 = dotProduct(1, 2, 3, 4, 5, 6);
    var x11 = crossProductX(1, 2, 3, 4, 5, 6);
    var x12 = crossProductY(1, 2, 3, 4, 5, 6);
    var x13 = crossProductZ(1, 2, 3, 4, 5, 6);
    var x14 = magnitude(1, 2, 3);
    var x15 = scaleX(1, 2, 3, 4);
    var x16 = scaleY(1, 2, 3, 4);
    var x17 = scaleZ(1, 2, 3, 4);
    var x18 = add3X(1, 2, 3, 4, 5, 6, 7, 8, 9);
    var x19 = add3Y(1, 2, 3, 4, 5, 6, 7, 8, 9);
    var x20 = add3Z(1, 2, 3, 4, 5, 6, 7, 8, 9);
    var x21 = sphereIntersection(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

    // Start by creating a simple vector pointing in the direction the camera is
    
    // raytracer start
    
    var x = this.thread.x;
    var y = this.thread.y;

    var xCompX = vpRight[0] * (x * pixelWidth - halfWidth);
    var xCompY = vpRight[1] * (x * pixelWidth - halfWidth);
    var xCompZ = vpRight[2] * (x * pixelWidth - halfWidth);

    var yCompX = vpUp[0] * (y * pixelHeight - halfHeight);
    var yCompY = vpUp[1] * (y * pixelHeight - halfHeight);
    var yCompZ = vpUp[2] * (y * pixelHeight - halfHeight);

    var rayPtX = camera[0];
    var rayPtY = camera[1];
    var rayPtZ = camera[2];

    var rayVecX = eyeVector[0] + xCompX + yCompX;
    var rayVecY = eyeVector[1] + xCompY + yCompY;
    var rayVecZ = eyeVector[2] + xCompZ + yCompZ;

    var normRayVecX = normalizeX(rayVecX, rayVecY, rayVecZ);
    var normRayVecY = normalizeY(rayVecX, rayVecY, rayVecZ);
    var normRayVecZ = normalizeZ(rayVecX, rayVecY, rayVecZ);

    var colorX = 0.95;
    var colorY = 0.95;
    var colorZ = 0.95;

    // raytracer end

    var nearestEntityIndex = -1;
    var maxEntityDistance = 2 ** 64;
    var nearestEntityDistance = 2 ** 64;

    this.color(colorX, colorY, colorZ); // default background color

    // Get nearest object
    for (var i = 0; i < this.constants.ENTITY_COUNT; i++) {
      if (entities[i][0] == this.constants.SPHERE) {

        var distance = sphereIntersection(
          entities[i][1], entities[i][2], entities[i][3],
          entities[i][7],
          rayPtX, rayPtY, rayPtZ,
          normRayVecX, normRayVecY, normRayVecZ
        );

        if (distance >= 0 && distance < nearestEntityDistance) {
          nearestEntityDistance = distance;
          nearestEntityIndex = i;
        } 

        // moving sphere code
        // if (dist(this.thread.x, this.thread.y, entities[i][1], entities[i][2]) < entities[i][7]) {
        //   this.color((entities[i][8] + y) / 600, (entities[i][9] + x) / 600, entities[i][10]);
      }
    }

    if (nearestEntityIndex > -1) {
      this.color(entities[nearestEntityIndex][8], entities[nearestEntityIndex][9], entities[nearestEntityIndex][10]);
    }

  }, opt);
}

let addFunctions = (gpu: any, functions: any[]) => functions.forEach(f => gpu.addFunction(f));

var gpu = new GPU();
addFunctions(gpu, vectorFunctions);
addFunctions(gpu, utilityFunctions);

let scene = Scene.scene;
var gpuKernel = createKernel(Mode.GPU, scene);
var cpuKernel = createKernel(Mode.CPU, scene);

var cpuCanvas = cpuKernel.getCanvas();
var gpuCanvas = gpuKernel.getCanvas();

document.getElementsByTagName('body')[0].appendChild(gpuCanvas);
document.getElementsByTagName('body')[0].appendChild(cpuCanvas);

var renderLoop = renderer(gpuKernel, cpuKernel, gpuCanvas, cpuCanvas, scene);
window.onload = renderLoop;
