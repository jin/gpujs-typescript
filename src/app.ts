/// <reference path="references.ts" />

enum Mode { GPU, CPU }

// Global states
var mode = Mode.CPU // initial mode
var isRunning = true;

let stringOfMode = (mode: Mode) : string => {
  switch(mode) {
    case Mode.CPU: return "cpu";
    case Mode.GPU: return "gpu";
  }
}

// DOM bindings

let togglePause = (el: HTMLInputElement) : void => {
  el.value = isRunning ? "Start" : "Pause";
  isRunning = !isRunning;
  if (isRunning) { renderLoop() };
}

let toggleMode = () : void => {
  mode = (mode == Mode.GPU) ? Mode.CPU : Mode.GPU;
  document.getElementById('mode').innerHTML = stringOfMode(mode).toUpperCase();
}

let updateFPS = (fps: string) : void => {
  var f = document.querySelector("#fps");
  f.innerHTML = fps.toString();
}

let bm = new Benchmark.Benchmark();
let benchmark = (elem: HTMLInputElement) : void => {
  elem.value = "Running..";
  let resultsElem = document.getElementById("results");
  let speedupElem = document.getElementById("speedup");
  updateFPS("Maximum rate!")
  bm.startBenchmark(stringOfMode(mode), () => {
    bm.displayResults(resultsElem);
    toggleMode() // toggle to other mode
    bm.startBenchmark(stringOfMode(mode), () => {
      bm.displayResults(resultsElem);
      toggleMode() // toggle back to original mode
      elem.value = "Benchmark";
      bm.displaySpeedup(speedupElem);
    })
  });
}

// Main renderer

var renderer = (gpuKernel: any, cpuKernel: any,
                gpuCanvas: any, scene: Scene.Scene) : () => void => {

  enum Movement {
    Forward, Backward, LeftStrafe, RightStrafe,
    LookUp, LookDown, LookLeft, LookRight
  }

  let camera = scene.camera,
    lights = scene.lights,
    entities = scene.entities,
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

  document.onkeydown = function (e) {
    let keyMap = {
      87: Movement.Forward,
      83: Movement.Backward,
      65: Movement.LeftStrafe,
      68: Movement.RightStrafe,
      38: Movement.LookUp,
      40: Movement.LookDown,
      37: Movement.LookLeft,
      39: Movement.LookRight
    }

    let forwardSpeed = 0.2;
    let backwardSpeed = 0.2;
    let strafeSpeed = 0.2;

    switch (keyMap[e.keyCode]) {
      case Movement.Forward:
        camera[2] -= forwardSpeed;
      break;
      case Movement.Backward:
        camera[2] += backwardSpeed;
      break;
      case Movement.LeftStrafe:
        camera[0] -= strafeSpeed;
      break;
      case Movement.RightStrafe:
        camera[0] += strafeSpeed;
      break;
      case Movement.LookLeft:
        break;
      default:
        break;
    }
  };

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

  let nextTick = () : void => {
    if (!isRunning) { return; } // Pause render loop if not running
    if (!bm.isBenchmarking) {
      // Don't update FPS while benchmarking
      updateFPS(fps.getFPS().toString());
    }

    var cv = document.getElementsByTagName("canvas")[0];
    var startTime, endTime, bdy, newCanvas;
    if (mode == Mode.CPU) {
      if (bm.isBenchmarking) { startTime = performance.now(); }
      cpuKernel(
        camera, lights, entities,
        eyeVector, vpRight, vpUp,
        canvasHeight, canvasWidth, fovRadians,
        heightWidthRatio, halfWidth, halfHeight,
        cameraWidth, cameraHeight, pixelWidth,
        pixelHeight
      );
      if (bm.isBenchmarking) { endTime = performance.now(); }
      bdy = cv.parentNode;
      newCanvas = cpuKernel.getCanvas();
      if (!bm.isBenchmarking) { bdy.replaceChild(newCanvas, cv); }
    } else {
      if (bm.isBenchmarking) { startTime = performance.now(); }
      gpuKernel(
        camera, lights, entities,
        eyeVector, vpRight, vpUp,
        canvasHeight, canvasWidth, fovRadians,
        heightWidthRatio, halfWidth, halfHeight,
        cameraWidth, cameraHeight,
        pixelWidth, pixelHeight
      );
      if (bm.isBenchmarking) { endTime = performance.now(); }
      bdy = cv.parentNode;
      newCanvas = gpuKernel.getCanvas();
      bdy.replaceChild(newCanvas, cv);
    }

    // if (totalFrameCount % 6 == 0) {
    //   lights.forEach(function(light, idx) {
    //     // lights[idx][1] = Math.sin(totalFrameCount) * idx;
    //     lights[idx][0] = Math.sin(totalFrameCount) * 30 * idx;
    //     lights[idx][2] = 3 + Math.cos(totalFrameCount) * 2 * idx;
    //   })
    // }

    entities.forEach(function(entity, idx) {
      entities[idx] = moveEntity(canvasWidth, canvasWidth, canvasWidth, entity);
    })

    if (bm.isBenchmarking) {
      let timeTaken = endTime - startTime;
      bm.addFrameGenDuration(timeTaken);
      bm.incrementTotalFrameCount();
      setTimeout(renderLoop, 5);
    } else {
      requestAnimationFrame(nextTick);
    }
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
    if (entity[1] < -7) {
      [entity[15], entity[16], entity[17]] = reflect(entity, [1, 0, 0]);
    }
    if (entity[1] > 7) {
      [entity[15], entity[16], entity[17]] = reflect(entity, [-1, 0, 0]);
    }
    if (entity[2] < -7) {
      [entity[15], entity[16], entity[17]] = reflect(entity, [0, 1, 0]);
    }
    if (entity[2] > 7) {
      [entity[15], entity[16], entity[17]] = reflect(entity, [0, -1, 0]);
    }
    if (entity[3] < -7) {
      [entity[15], entity[16], entity[17]] = reflect(entity, [0, 0, 1]);
    }
    if (entity[3] > 7) {
      [entity[15], entity[16], entity[17]] = reflect(entity, [0, 0, -1]);
    }
    return entity;
  }


  return nextTick;
}

interface KernelOptions {
  dimensions: number[],
  debug?: boolean,
  graphical?: boolean,
  safeTextureReadHack?: boolean,
  mode: string,
  constants?: {}
}

var createKernel = (mode: Mode, scene: Scene.Scene) : any => {

  const opt: KernelOptions = {
    mode: stringOfMode(mode),
    dimensions: [scene.canvasWidth, scene.canvasHeight],
    debug: false,
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
      var red = 0.05;
      var green = 0.05;
      var blue = 0.05;

      var nearestEntityIndex = -1;
      var maxEntityDistance = 2 ** 32; // All numbers in GPU.js are of Float32 type
      var nearestEntityDistance = 2 ** 32;

      // Get nearest object
      for (var i = 0; i < this.constants.ENTITY_COUNT; i++) {
        var distance = -1;

        // Iterate through entity types
        if (entities[i][0] == this.constants.SPHERE) {
          distance = sphereIntersection(
            entities[i][1], entities[i][2], entities[i][3],
            entities[i][7],
            rayPtX, rayPtY, rayPtZ,
            normRayVecX, normRayVecY, normRayVecZ
          );
        } else if (entities[i][0] == this.constants.CUBOID) {
        }

        if (distance >= 0 && distance < nearestEntityDistance) {
          nearestEntityIndex = i;
          nearestEntityDistance = distance;
          red = entities[i][8];
          green = entities[i][9];
          blue = entities[i][10];
        }
      }

      this.color(red, green, blue); // Set ray-entity intersection color or background color

      // Reflections (Lambertian, Specular)

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

        var lambertRed = 0, lambertGreen = 0, lambertBlue = 0;

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
          lambertRed += entityRed * lambertAmount * entityLambert;
          lambertGreen += entityGreen * lambertAmount * entityLambert;
          lambertBlue += entityBlue * lambertAmount * entityLambert;
        }

        // End Lambertian reflection

        // Specular reflection

        var specularRed = 0, specularBlue = 0, specularGreen = 0;

        var incidentRayVecX = rayVecX;
        var incidentRayVecY = rayVecY;
        var incidentRayVecZ = rayVecZ;

        var reflectedPtX = intersectPtX;
        var reflectedPtY = intersectPtY;
        var reflectedPtZ = intersectPtZ;

        var depthLimit = 3;
        var depth = 0;

        var entitySpecular = entities[nearestEntityIndex][13];

        while (depth < depthLimit) {

          var reflectedVecX = -reflectVecX(incidentRayVecX, incidentRayVecY, incidentRayVecZ, sphereNormPtX, sphereNormPtY, sphereNormPtZ);
          var reflectedVecY = -reflectVecY(incidentRayVecX, incidentRayVecY, incidentRayVecZ, sphereNormPtX, sphereNormPtY, sphereNormPtZ);
          var reflectedVecZ = -reflectVecZ(incidentRayVecX, incidentRayVecY, incidentRayVecZ, sphereNormPtX, sphereNormPtY, sphereNormPtZ);

          var nearestEntityIndexSpecular = -1;
          var maxEntityDistanceSpecular = 2 ** 32; // All numbers in GPU.js are of Float32 type
          var nearestEntityDistanceSpecular = 2 ** 32;

          // Get nearest object
          for (var i = 0; i < this.constants.ENTITY_COUNT; i++) {
            if (entities[i][0] == this.constants.SPHERE) {
              var distance = sphereIntersection(
                entities[i][1], entities[i][2], entities[i][3],
                entities[i][7],
                reflectedPtX, reflectedPtY, reflectedPtZ,
                reflectedVecX, reflectedVecY, reflectedVecZ
              );

              if (distance >= 0 && distance < nearestEntityDistance) {
                nearestEntityIndexSpecular = i;
                nearestEntityDistanceSpecular = distance;
              }
            }
          }

          if (nearestEntityIndexSpecular >= 0) {

            entityPtX = entities[nearestEntityIndexSpecular][1];
            entityPtY = entities[nearestEntityIndexSpecular][2];
            entityPtZ = entities[nearestEntityIndexSpecular][3];

            specularRed += entities[nearestEntityIndexSpecular][8] * entitySpecular;
            specularGreen += entities[nearestEntityIndexSpecular][9] * entitySpecular;
            specularBlue += entities[nearestEntityIndexSpecular][10] * entitySpecular;

            reflectedPtX = reflectedPtX + normalizeX(reflectedVecX, reflectedVecY, reflectedVecZ) * nearestEntityDistance;
            reflectedPtY = reflectedPtY + normalizeY(reflectedVecX, reflectedVecY, reflectedVecZ) * nearestEntityDistance;
            reflectedPtZ = reflectedPtZ + normalizeZ(reflectedVecX, reflectedVecY, reflectedVecZ) * nearestEntityDistance;

            sphereNormPtX = sphereNormalX(entityPtX, entityPtY, entityPtZ, reflectedPtX, reflectedPtY, reflectedPtZ);
            sphereNormPtY = sphereNormalZ(entityPtX, entityPtY, entityPtZ, reflectedPtX, reflectedPtY, reflectedPtZ);
            sphereNormPtY = sphereNormalZ(entityPtX, entityPtY, entityPtZ, reflectedPtX, reflectedPtY, reflectedPtZ);

            incidentRayVecX = reflectedVecX;
            incidentRayVecY = reflectedVecY;
            incidentRayVecZ = reflectedVecZ;

            depth += 1;

          } else {

            depth = depthLimit;

          }
        }

        this.color(
          lambertRed + specularRed,
          lambertGreen + specularGreen,
          lambertBlue + specularBlue
        );
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

var canvas = gpuKernel.getCanvas();

document.getElementById('canvas').appendChild(canvas);

var renderLoop = renderer(gpuKernel, cpuKernel, canvas, scene);
window.onload = renderLoop;
