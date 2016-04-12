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
    totalFrameCount: 0,
    getFPS: function(){
      this.totalFrameCount++;
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

    var totalFrameCount = fps.totalFrameCount;

    if (totalFrameCount % 6 == 0) {
      lights.forEach(function(light, idx) {
        // lights[idx][1] = Math.sin(totalFrameCount) * idx;
        lights[idx][0] = Math.sin(totalFrameCount) * 30 * idx;
        lights[idx][2] = 3 + Math.cos(totalFrameCount) * 2 * idx;
      })
    }

    entities.forEach(function(entity, idx) {
      entities[idx] = moveEntity(canvasWidth, canvasWidth, canvasWidth, entity);
    })


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
      LIGHT_COUNT: scene.lights.length,
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

      // default background color
      var red = 0.35;
      var green = 0.35;
      var blue = 0.35;

      var nearestEntityIndex = -1;
      var maxEntityDistance = 2 ** 32; // All numbers in GPU.js are of Float32 type
      var nearestEntityDistance = 2 ** 32;

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
            nearestEntityIndex = i;
            nearestEntityDistance = distance;
            red = entities[i][8];
            green = entities[i][9];
            blue = entities[i][10];
          }
        }
      }

      var depth = 0;

      if (nearestEntityIndex >= 0) {
        var entityPtX = entities[nearestEntityIndex][1];
        var entityPtY = entities[nearestEntityIndex][2];
        var entityPtZ = entities[nearestEntityIndex][3];

        var entityRed = entities[nearestEntityIndex][8];
        var entityGreen = entities[nearestEntityIndex][9];
        var entityBlue = entities[nearestEntityIndex][10];

        var intersectPtX = rayPtX + normRayVecX * nearestEntityDistance;
        var intersectPtY = rayPtY + normRayVecY * nearestEntityDistance;
        var intersectPtZ = rayPtZ + normRayVecZ * nearestEntityDistance;

        var sphereNormPtX = sphereNormalX(entityPtX, entityPtY, entityPtZ, intersectPtX, intersectPtY, intersectPtZ);
        var sphereNormPtY = sphereNormalY(entityPtX, entityPtY, entityPtZ, intersectPtX, intersectPtY, intersectPtZ);
        var sphereNormPtZ = sphereNormalZ(entityPtX, entityPtY, entityPtZ, intersectPtX, intersectPtY, intersectPtZ);

        // Lambertian reflection

        for (var i = 0; i < this.constants.LIGHT_COUNT; i++) {
          var lightPtX = lights[i][0];
          var lightPtY = lights[i][1];
          var lightPtZ = lights[i][2];

          var vecToLightX = -sphereNormalX(intersectPtX, intersectPtY, intersectPtZ, lightPtX, lightPtY, lightPtZ);
          var vecToLightY = -sphereNormalY(intersectPtX, intersectPtY, intersectPtZ, lightPtX, lightPtY, lightPtZ);
          var vecToLightZ = -sphereNormalZ(intersectPtX, intersectPtY, intersectPtZ, lightPtX, lightPtY, lightPtZ);

          var shadowCast = -1;

          var lambertAmount = 0;

          var entityLambert = entities[nearestEntityIndex][11];

          for (var j = 0; j < this.constants.ENTITY_COUNT; j++) {
            if (entities[j][0] == this.constants.SPHERE) {
              var distance = sphereIntersection(
                entities[j][1], entities[j][2], entities[j][3],
                entities[j][7],
                intersectPtX, intersectPtY, intersectPtZ,
                vecToLightX, vecToLightY, vecToLightZ
              );

              if (distance > -0.005) { 
                shadowCast = 1; 
              }
            }
          }

          if (shadowCast > 0) {
            var contribution = dotProduct(
              -vecToLightX, -vecToLightY, -vecToLightZ,
              sphereNormPtX, sphereNormPtY, sphereNormPtZ
            );
            if (contribution > 0) {
              lambertAmount += contribution;
            }
          }

          lambertAmount = Math.min(1, lambertAmount);
          red = entityRed * lambertAmount * entityLambert;
          green = entityGreen * lambertAmount * entityLambert;
          blue = entityBlue * lambertAmount * entityLambert;
        }

      }

      this.color(red, green, blue); // default background color

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
