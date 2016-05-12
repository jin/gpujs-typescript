/// <reference path="references.ts" />

// At any point in time, the mode is either GPU or CPU.
enum Mode { GPU, CPU }

let reducer = (action, state) => {
  return state;
}

var store = Redux.createStore(reducer);
var gpu = new GPU();

// Default to a single GPU kernel/canvas
var kernelDimension = kernelDimension || 2;
if (sessionStorage.getItem("kernelDimension")) {
  kernelDimension = parseInt(sessionStorage.getItem("kernelDimension"));
  let slider: any = document.getElementById("dimension-slider");
  slider.value = kernelDimension;
  let label: any = document.getElementById("grid-dimension");
  label.innerHTML = kernelDimension;
}

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

let updateDimension = (elem: HTMLInputElement) : void => {
  renderLoop = null;
  kernelDimension = parseInt(elem.value);
  sessionStorage.setItem("kernelDimension", JSON.stringify(kernelDimension));
  isRunning = false;
  document.getElementById('grid-dimension').innerHTML = elem.value;
  [gpuKernels, cpuKernels] = generateKernels(kernelDimension, scene);
  canvasNeedsUpdate = true
  renderLoop = renderer(gpuKernels, cpuKernels, scene);
  setTimeout(() => {
    isRunning = true;
    renderLoop();
  }, 1000);
}

function generateCanvasGrid(dim) {
  var canvasContainer = document.getElementById("canvas-container");
  var divs = [];
  for (let i = 0; i < dim; i++) {
    var divElem = document.createElement('div');
    for (let j = 0; j < dim; j++) {
      let spanElem = document.createElement('span');
      spanElem.id = "canvas" + (j + (i * dim));
      spanElem.className = "canvas"
      divElem.appendChild(spanElem)
    }
    divs.push(divElem);
  }
  for (let i = divs.length - 1; i >= 0; i--) {
    canvasContainer.appendChild(divs[i]);
  }
}

function removeCanvasGrid() {
  var canvasContainer = document.getElementById("canvas-container");
  while (canvasContainer.lastChild) {
    for (let i = 0; i < canvasContainer.lastChild.childNodes.length; i++) {
      canvasContainer.lastChild.childNodes[i] = null;
    }
    canvasContainer.removeChild(canvasContainer.lastChild);
  }
}

let updateSphereSlider = (elem: HTMLInputElement) : void => {
  isRunning = false;
  document.getElementById('sphere-count').innerHTML = elem.value;
  updateSphereCount(parseInt(elem.value));
}

let updateSphereCount = (count) : void => {
  let newEntities = Scene.updateSphereCount(count);
  scene.entities = newEntities;
  [gpuKernels, cpuKernels] = generateKernels(kernelDimension, scene);
  renderLoop = renderer(gpuKernels, cpuKernels, scene);
  canvasNeedsUpdate = true; // signal canvas0 replacement to renderer
  setTimeout(() => {
    isRunning = true;
    if (isRunning) { renderLoop() };
  }, 1000)
}

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
      // bm.displaySpeedup(speedupElem);

      toggleMode() // Toggle back to original mode

      elem.value = "Benchmark";
      elem.disabled = false;

    })
  });
}

// Main renderer
var renderer = (gpuKernels: any[], cpuKernel: any[], scene: Scene.Scene) : () => void => {

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

    if (bm.isBenchmarking) { startTime = performance.now(); }

    var startTime, endTime;
    if (mode == Mode.CPU) {
      for (let i = 0; i < cpuKernels.length; i++) {
        let cpuKernel = cpuKernels[i];
        cpuKernel(
          camera, lights, entities,
          eyeVector, vpRight, vpUp,
          canvasHeight, canvasWidth, fovRadians,
          heightWidthRatio, halfWidth, halfHeight,
          cameraWidth, cameraHeight, 
          pixelWidth, pixelHeight,
          i % kernelDimension, Math.floor(i / kernelDimension)
        );
        if (canvasNeedsUpdate) {
          // Do not waste cycles replacing the canvas0
          // if the mode did not change.
          let cv = document.getElementById("canvas" + i).childNodes[0];
          let bdy = cv.parentNode;
          let newCanvas = cpuKernel.getCanvas();
          bdy.replaceChild(newCanvas, cv);
        }
      }
      if (canvasNeedsUpdate) { canvasNeedsUpdate = false; }
    } else {
      for (let i = 0; i < gpuKernels.length; i++) {
        let gpuKernel = gpuKernels[i];
        gpuKernel(
          camera, lights, entities,
          eyeVector, vpRight, vpUp,
          canvasHeight, canvasWidth, fovRadians,
          heightWidthRatio, halfWidth, halfHeight,
          cameraWidth, cameraHeight,
          pixelWidth, pixelHeight,
          i % kernelDimension, Math.floor(i / kernelDimension)
        );
        if (canvasNeedsUpdate) {
          let cv = document.getElementById("canvas" + i).childNodes[0];
          let bdy = cv.parentNode;
          let newCanvas = gpuKernel.getCanvas();
          bdy.replaceChild(newCanvas, cv);
        }
      }
      if (canvasNeedsUpdate) { canvasNeedsUpdate = false; }
    }

    for (let idx = 0; idx < entities.length; idx++){
      entities[idx] = moveEntity(canvasWidth, canvasWidth, canvasWidth, entities[idx]);
    }

    entities = checkSphereSphereCollision(entities);

    if (bm.isBenchmarking) {
      let timeTaken = performance.now() - startTime;
      bm.addFrameGenDuration(timeTaken);
      bm.incrementTotalFrameCount();
      setTimeout(nextTick, 1);
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
    dimensions: [Math.floor(scene.canvasWidth / kernelDimension), Math.floor(scene.canvasHeight / kernelDimension)],
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
      // var x6 = subtractZ(1,  3, 4, 5, 6);
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

      var x = this.thread.x + (this.dimensions.x * xOffset);
      var y = this.thread.y + (this.dimensions.y * yOffset);

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
      var red = 0.30;
      var green = 0.35;
      var blue = 0.31;

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

          // defaults to false
          var shadowCast = -1;

          var lambertAmount = 0;

          var entityLambert = entities[nearestEntityIndex][11];

          // Iterate through all entities and see 
          // if any of them are blocking the light ray vector
          for (var j = 0; j < this.constants.ENTITY_COUNT; j++) {
            if (entities[j][0] == this.constants.SPHERE) {
              var distance = sphereIntersection(
                entities[j][1], entities[j][2], entities[j][3],
                entities[j][7],
                intersectPtX, intersectPtY, intersectPtZ,
                vecToLightX, vecToLightY, vecToLightZ
              );

              // This should be more than or equals to zero,
              // but due to JavaScript's float inaccuracy, we need to
              // tune it down a little to a small negative value.
              if (distance > -0.005) {
                shadowCast = 1;
              }

            }
          }

          // If no shadow is cast, we can increase the
          // lambertian multiplier so that the area 
          // seem "lit up"
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

let generateKernels = (dim, scene) => {
  removeCanvasGrid();
  generateCanvasGrid(dim);
  let kernelCount = dim * dim;
  let gpuKernels = [];
  let cpuKernels = [];
  for (let i = 0; i < kernelCount; i++) {
    let kernel = createKernel(Mode.GPU, scene);
    gpuKernels.push(kernel);
    document.getElementById('canvas' + i).appendChild(kernel.getCanvas());

    cpuKernels.push(createKernel(Mode.CPU, scene));
  }
  return [gpuKernels, cpuKernels];
}

let addFunctions = (gpu: any, functions: any[]) => functions.forEach(f => gpu.addFunction(f));

addFunctions(gpu, vectorFunctions);
addFunctions(gpu, utilityFunctions);

let scene = Scene.generateScene();
let [gpuKernels, cpuKernels] = generateKernels(kernelDimension, scene);
var renderLoop = renderer(gpuKernels, cpuKernels, scene);
window.onload = renderLoop;

// var testKernel = gpu.createKernel(function(x) {
//   return this.thread.x;
// }).dimensions([20, 20, 20]).mode("cpu");

// console.log(testKernel());
