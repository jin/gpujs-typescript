/// <reference path="references.ts" />

// At any point in time, the mode is either GPU or CPU.
enum Mode { GPU, CPU }

// Global states
var mode = Mode.GPU // Initial mode

// Mostly used when switching between modes, since
// the CPU and GPU kernel has canvases with different
// rendering contexts (WebGL v.s. 2D)
var canvasNeedsUpdate = true;

// Pause or resume the rendering
var isRunning = true;

let stringOfMode = (mode: Mode) : string => {
  switch(mode) {
    case Mode.CPU: return "cpu";
    case Mode.GPU: return "gpu";
  }
}

// HTML DOM JavaScript bindings
let togglePause = (el: HTMLInputElement) : void => {
  el.value = isRunning ? "Start" : "Pause";
  isRunning = !isRunning;
  if (isRunning) { renderLoop() };
}

let toggleMode = () : void => {
  canvasNeedsUpdate = true; // signal canvas replacement to renderer
  mode = (mode == Mode.GPU) ? Mode.CPU : Mode.GPU;
  document.getElementById('mode').innerHTML = stringOfMode(mode).toUpperCase();
}

let updateFPS = (fps: string) : void => {
  var f = document.querySelector("#fps");
  f.innerHTML = fps.toString();
}

// let updateSlider = (elem: HTMLInputElement) : void => {
//   isRunning = false;
//   document.getElementById('sphere-count').innerHTML = elem.value;
//   Scene.updateSphereCount(parseInt(elem.value));
//   setTimeout(() => {
//     renderLoop = renderer(gpuKernel, cpuKernel, canvas0, Scene.generateScene());
//     canvasNeedsUpdate = true; // signal canvas0 replacement to renderer
//     isRunning = true;
//     if (isRunning) { renderLoop() };
//   }, 1000)
// }

// Benchmarking binding.
//
// All benchmark logic is encapsulated
// in the Benchmark.Benchmark class.
//
// This method will trigger the renderer
// to render 30 frames regardless of the current
// mode, capture the data, and do the same for the
// other mode.
//
// Once both modes are completed, the speedup is
// computed from the results.
//
// The same scene is used for both benchmarks.
let bm = new Benchmark.Benchmark();

let benchmark = (elem: HTMLInputElement) : void => {

  elem.value = "Running..";
  elem.disabled = true;
  let resultsElem = document.getElementById("results");
  let speedupElem = document.getElementById("speedup");

  updateFPS("Benchmarking..")

  // Benchmark current mode
  bm.startBenchmark(stringOfMode(mode), () => {

    bm.displayResults(resultsElem);
    toggleMode()

    // Benchmark the other mode
    bm.startBenchmark(stringOfMode(mode), () => {

      bm.displayResults(resultsElem);
      bm.displaySpeedup(speedupElem);

      toggleMode() // Toggle back to original mode

      elem.value = "Benchmark";
      elem.disabled = false;

    })
  });
}

// Main renderer
var renderer = (gpuKernels: any[], cpuKernel: any, scene: Scene.Scene) : () => void => {

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


  // Basic first-person movement is supported with the W, A, S, D keys.
  enum Movement { Forward, Backward, LeftStrafe, RightStrafe }

  document.onkeydown = function(e) {
    let keyMap = {
      87: Movement.Forward,
      83: Movement.Backward,
      65: Movement.LeftStrafe,
      68: Movement.RightStrafe,
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

    var startTime, endTime;
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
      if (canvasNeedsUpdate) {
        // Do not waste cycles replacing the canvas0
        // if the mode did not change.
        canvasNeedsUpdate = false;
        let cv = document.getElementsByTagName("canvas")[0];
        let bdy = cv.parentNode;
        let newCanvas = cpuKernel.getCanvas();
        bdy.replaceChild(newCanvas, cv);
      }
    } else {
      for (let i = 0; i < gpuKernels.length; i++) {
        let gpuKernel = gpuKernels[i];
        if (bm.isBenchmarking) { startTime = performance.now(); }
        gpuKernel(
          camera, lights, entities,
          eyeVector, vpRight, vpUp,
          canvasHeight, canvasWidth, fovRadians,
          heightWidthRatio, halfWidth, halfHeight,
          cameraWidth, cameraHeight,
          pixelWidth, pixelHeight,
          i % 2, Math.floor(i / 2)
        );
        if (bm.isBenchmarking) { endTime = performance.now(); }
        if (canvasNeedsUpdate) {
          canvasNeedsUpdate = false;
          let cv = document.getElementById("canvas" + i).childNodes[0];
          let bdy = cv.parentNode;
          let newCanvas = gpuKernel.getCanvas();
          bdy.replaceChild(newCanvas, cv);
        }
      }
    }

    for (let idx = 0; idx < entities.length; idx++){
      entities[idx] = moveEntity(canvasWidth, canvasWidth, canvasWidth, entities[idx]);
    }

    entities = checkSphereSphereCollision(entities);

    // If in benchmarking mode, set a longer timeout delay to
    // provide a buffer for any overhead.
    //
    // Since we are measuring the raw time taken to render a
    // single frame, we should not render the next frame
    // as fast as possible as this might incur unneeded
    // processor cycles and starve the actual benchmark
    // requirements.
    if (bm.isBenchmarking) {
      let timeTaken = endTime - startTime;
      bm.addFrameGenDuration(timeTaken);
      bm.incrementTotalFrameCount();
      setTimeout(renderLoop, 300);
    } else {
      requestAnimationFrame(nextTick);
    }
  }

  // This method detects collisions between any two SPHERE objects
  // and causes a velocity change if so.
  //
  // It ignores non-sphere entities.
  let checkSphereSphereCollision = (allEntities) => {
    for (let first = 0; first < allEntities.length - 1; first++) {

      if (allEntities[first][0] !== Entity.Type.SPHERE) { continue; }

      // Get first sphere
      let sphere = allEntities[first];

      for (let second = first + 1; second < allEntities.length; second++){

        if (allEntities[second][0] !== Entity.Type.SPHERE) { continue; }
        
        // Get the other sphere
        let other = allEntities[second];

        // Check if the distance between the two spheres is 
        // roughly less than the sum of their radii. If it is,
        // they've collided.
        let distance = vecMagnitude(vecSubtract(
          [sphere[1], sphere[2], sphere[3]],
          [other[1], other[2], other[3]]
        ))

        let radiusSum = sphere[7] + other[7];

        if (distance < radiusSum + (0.05 * radiusSum)) {
          // Sphere velocity reflection
          
          let basisVector = vecNormalize(vecSubtract(
            [sphere[1], sphere[2], sphere[3]],
            [other[1], other[2], other[3]]
          ))

          let v1 = [sphere[15], sphere[16], sphere[17]];
          let x1 = vecDotProduct(basisVector, v1);
          let v1x = vecScale(basisVector, x1);
          let v1y = vecSubtract(v1, v1x);
          let m1 = 1; // Since our entities are massless, we set it to 1 for all.

          basisVector = vecScale(basisVector, -1);
          let v2 = [other[15], other[16], other[17]];
          let x2 = vecDotProduct(basisVector, v2);
          let v2x = vecScale(basisVector, x2);
          let v2y = vecSubtract(v2, v2x);
          let m2 = 1;

          let newSphereVelocity =
            vecAdd3(
              vecScale(v1x, (m1 - m2) / (m1 + m2)),
              vecScale(v2x, (2 * m2) / (m1 + m2)),
              v1y);

          // Update new velocity!
          allEntities[first][15] = newSphereVelocity[0];
          allEntities[first][16] = newSphereVelocity[1];
          allEntities[first][17] = newSphereVelocity[2];

          let otherSphereVelocity =
            vecAdd3(
              vecScale(v1x, (2 * m2) / (m1 + m2)),
              vecScale(v2x, (m2 - m1) / (m1 + m2)),
              v2y);

          allEntities[second][15] = otherSphereVelocity[0];
          allEntities[second][16] = otherSphereVelocity[1];
          allEntities[second][17] = otherSphereVelocity[2];

          // Just for fun. When the spheres collide,
          // we change their colors randomly.
          for (let colIdx = 8; colIdx < 11; colIdx++) {
            allEntities[first][colIdx] = rand(0, 1);
            allEntities[second][colIdx] = rand(0, 1);
          }
        }
      }
    }

    return allEntities;
  }

  // Function to move a single entity based on its direction
  // properties.
  //
  // Currently, we represent both velocity and direction
  // in a single property (directionX/Y/Z), but we should
  // really break them out into their own properties and
  // calculate at runtime. Acceleration is not supported.
  //
  // The entities will also bounce off an imaginary boundary
  // when intersected.
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
      // Left wall
      [entity[15], entity[16], entity[17]] = reflect(entity, [1, 0, 0]);
    }
    if (entity[1] > 7) {
      // Right wall
      [entity[15], entity[16], entity[17]] = reflect(entity, [-1, 0, 0]);
    }
    if (entity[2] < -7) {
      // Floor
      [entity[15], entity[16], entity[17]] = reflect(entity, [0, 1, 0]);
    }
    if (entity[2] > 7) {
      // Ceiling
      [entity[15], entity[16], entity[17]] = reflect(entity, [0, -1, 0]);
    }
    if (entity[3] < -15) {
      // Far wall
      [entity[15], entity[16], entity[17]] = reflect(entity, [0, 0, 1]);
    }
    if (entity[3] > 7) {
      // Near wall
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
    dimensions: [scene.canvasWidth / 2, scene.canvasHeight / 2],
    debug: false,
    graphical: true,
    safeTextureReadHack: false,
    constants: {
      ENTITY_COUNT: scene.entities.length,
      LIGHT_COUNT: scene.lights.length,
      SPHERE: Entity.Type.SPHERE,
      PLANE: Entity.Type.PLANE,
      LIGHTSPHERE: Entity.Type.LIGHTSPHERE
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
    pixelHeight: number,
    xOffset: number,
    yOffset: number) {

      // Kernel canary code
      //
      // This is to test the validity of the helper functions
      // as GPU.js does not support the full JavaScript syntax.
      // 
      // If any of these breaks, something is _really_ wrong.
      // var x1 = addX(1, 2, 3, 4, 5, 6);
      // var x2 = addY(1, 2, 3, 4, 5, 6);
      // var x3 = addZ(1, 2, 3, 4, 5, 6);
      // var x4 = subtractX(1, 2, 3, 4, 5, 6);
      // var x5 = subtractY(1, 2, 3, 4, 5, 6);
      // var x6 = subtractZ(1, 2, 3, 4, 5, 6);
      // var x7 = normalizeX(1, 2, 3);
      // var x8 = normalizeY(1, 2, 3);
      // var x9 = normalizeZ(1, 2, 3);
      // var x10 = dotProduct(1, 2, 3, 4, 5, 6);
      // var x11 = crossProductX(1, 2, 3, 4, 5, 6);
      // var x12 = crossProductY(1, 2, 3, 4, 5, 6);
      // var x13 = crossProductZ(1, 2, 3, 4, 5, 6);
      // var x14 = magnitude(1, 2, 3);
      // var x15 = scaleX(1, 2, 3, 4);
      // var x16 = scaleY(1, 2, 3, 4);
      // var x17 = scaleZ(1, 2, 3, 4);
      // var x18 = add3X(1, 2, 3, 4, 5, 6, 7, 8, 9);
      // var x19 = add3Y(1, 2, 3, 4, 5, 6, 7, 8, 9);
      // var x20 = add3Z(1, 2, 3, 4, 5, 6, 7, 8, 9);
      // var x21 = sphereIntersection(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

      // Raytracer start!

      var x = this.thread.x + (320 * xOffset);
      var y = this.thread.y + (320 * yOffset);

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
      var red = 0.20;
      var green = 0.20;
      var blue = 0.20;

      var nearestEntityIndex = -1;
      var maxEntityDistance = 2 ** 32; // All numbers in GPU.js are of Float32 type
      var nearestEntityDistance = 2 ** 32;

      // Get nearest object
      for (var i = 0; i < this.constants.ENTITY_COUNT; i++) {
        var distance = -1;
        var entityType = entities[i][0];

        // Iterate through entity types
        if (entityType == this.constants.SPHERE ||
           entityType == this.constants.LIGHTSPHERE) {
          distance = sphereIntersection(
            entities[i][1], entities[i][2], entities[i][3],
            entities[i][7],
            rayPtX, rayPtY, rayPtZ,
            normRayVecX, normRayVecY, normRayVecZ
          );
        } else if (entityType == this.constants.PLANE) {
          distance = planeIntersection(
            entities[i][1], entities[i][2], entities[i][3],
            entities[i][18],
            rayPtX, rayPtY, rayPtZ,
            normRayVecX, normRayVecY, normRayVecZ
          )
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

          var vecToLightX = sphereNormalX(intersectPtX, intersectPtY, intersectPtZ, lightPtX, lightPtY, lightPtZ);
          var vecToLightY = sphereNormalY(intersectPtX, intersectPtY, intersectPtZ, lightPtX, lightPtY, lightPtZ);
          var vecToLightZ = sphereNormalZ(intersectPtX, intersectPtY, intersectPtZ, lightPtX, lightPtY, lightPtZ);

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

          if (shadowCast < 0) {
            var contribution = dotProduct(
              vecToLightX, vecToLightY, vecToLightZ,
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

        var ambient = entities[nearestEntityIndex][14];
        this.color(
          lambertRed + (lambertRed * specularRed) + entityRed * ambient,
          lambertGreen + (lambertGreen * specularGreen) + entityGreen * ambient,
          lambertBlue + (lambertBlue * specularBlue) + entityBlue * ambient
        );
      }

    }, opt);
}

let addFunctions = (gpu: any, functions: any[]) => functions.forEach(f => gpu.addFunction(f));

var gpu = new GPU();
addFunctions(gpu, vectorFunctions);
addFunctions(gpu, utilityFunctions);

let scene = Scene.generateScene();
var gpuKernel = createKernel(Mode.GPU, scene);
var gpuKernel1 = createKernel(Mode.GPU, scene);
var gpuKernel2 = createKernel(Mode.GPU, scene);
var gpuKernel3 = createKernel(Mode.GPU, scene);
var cpuKernel = createKernel(Mode.CPU, scene);

document.getElementById('canvas0').appendChild(gpuKernel.getCanvas());
document.getElementById('canvas1').appendChild(gpuKernel1.getCanvas());
document.getElementById('canvas2').appendChild(gpuKernel2.getCanvas());
document.getElementById('canvas3').appendChild(gpuKernel3.getCanvas());

var renderLoop = function() { 
  return renderer([gpuKernel, gpuKernel1, gpuKernel2, gpuKernel3], cpuKernel, scene);
}();
window.onload = renderLoop;

// var testKernel = gpu.createKernel(function(x) {
//   return this.thread.x;
// }).dimensions([20, 20, 20]).mode("cpu");

// console.log(testKernel());
