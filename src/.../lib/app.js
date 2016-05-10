var Mode;
(function (Mode) {
    Mode[Mode["GPU"] = 0] = "GPU";
    Mode[Mode["CPU"] = 1] = "CPU";
})(Mode || (Mode = {}));
var gpu = new GPU();
var kernelDimension = kernelDimension || 2;
if (sessionStorage.getItem("kernelDimension")) {
    kernelDimension = parseInt(sessionStorage.getItem("kernelDimension"));
    var slider = document.getElementById("dimension-slider");
    slider.value = kernelDimension;
    var label = document.getElementById("grid-dimension");
    label.innerHTML = kernelDimension;
}
var mode = Mode.GPU;
var canvasNeedsUpdate = true;
var isRunning = true;
var stringOfMode = function (mode) {
    switch (mode) {
        case Mode.CPU: return "cpu";
        case Mode.GPU: return "gpu";
    }
};
var togglePause = function (el) {
    el.value = isRunning ? "Start" : "Pause";
    isRunning = !isRunning;
    if (isRunning) {
        renderLoop();
    }
    ;
};
var toggleMode = function () {
    canvasNeedsUpdate = true;
    mode = (mode == Mode.GPU) ? Mode.CPU : Mode.GPU;
    document.getElementById('mode').innerHTML = stringOfMode(mode).toUpperCase();
};
var updateFPS = function (fps) {
    var f = document.querySelector("#fps");
    f.innerHTML = fps.toString();
};
var updateDimension = function (elem) {
    renderLoop = null;
    kernelDimension = parseInt(elem.value);
    sessionStorage.setItem("kernelDimension", JSON.stringify(kernelDimension));
    isRunning = false;
    document.getElementById('grid-dimension').innerHTML = elem.value;
    _a = generateKernels(kernelDimension, scene), gpuKernels = _a[0], cpuKernels = _a[1];
    canvasNeedsUpdate = true;
    renderLoop = renderer(gpuKernels, cpuKernels, scene);
    setTimeout(function () {
        isRunning = true;
        renderLoop();
    }, 1000);
    var _a;
};
function generateCanvasGrid(dim) {
    var canvasContainer = document.getElementById("canvas-container");
    var divs = [];
    for (var i = 0; i < dim; i++) {
        var divElem = document.createElement('div');
        for (var j = 0; j < dim; j++) {
            var spanElem = document.createElement('span');
            spanElem.id = "canvas" + (j + (i * dim));
            spanElem.className = "canvas";
            divElem.appendChild(spanElem);
        }
        divs.push(divElem);
    }
    for (var i = divs.length - 1; i >= 0; i--) {
        canvasContainer.appendChild(divs[i]);
    }
}
function removeCanvasGrid() {
    var canvasContainer = document.getElementById("canvas-container");
    while (canvasContainer.lastChild) {
        for (var i = 0; i < canvasContainer.lastChild.childNodes.length; i++) {
            canvasContainer.lastChild.childNodes[i] = null;
        }
        canvasContainer.removeChild(canvasContainer.lastChild);
    }
}
var updateSphereSlider = function (elem) {
    isRunning = false;
    document.getElementById('sphere-count').innerHTML = elem.value;
    updateSphereCount(parseInt(elem.value));
};
var updateSphereCount = function (count) {
    var newEntities = Scene.updateSphereCount(count);
    scene.entities = newEntities;
    _a = generateKernels(kernelDimension, scene), gpuKernels = _a[0], cpuKernels = _a[1];
    renderLoop = renderer(gpuKernels, cpuKernels, scene);
    canvasNeedsUpdate = true;
    setTimeout(function () {
        isRunning = true;
        if (isRunning) {
            renderLoop();
        }
        ;
    }, 1000);
    var _a;
};
var bm = new Benchmark.Benchmark();
var benchmark = function (elem) {
    elem.value = "Running..";
    elem.disabled = true;
    var resultsElem = document.getElementById("results");
    var speedupElem = document.getElementById("speedup");
    updateFPS("Benchmarking..");
    bm.startBenchmark(stringOfMode(mode), function () {
        bm.displayResults(resultsElem);
        toggleMode();
        bm.startBenchmark(stringOfMode(mode), function () {
            bm.displayResults(resultsElem);
            bm.displaySpeedup(speedupElem);
            toggleMode();
            elem.value = "Benchmark";
            elem.disabled = false;
        });
    });
};
var renderer = function (gpuKernels, cpuKernel, scene) {
    var camera = scene.camera, lights = scene.lights, entities = scene.entities, eyeVector = scene.eyeVector, vpRight = scene.vpRight, vpUp = scene.vpUp, canvasHeight = scene.canvasHeight, canvasWidth = scene.canvasWidth, fovRadians = scene.fovRadians, heightWidthRatio = scene.heightWidthRatio, halfWidth = scene.halfWidth, halfHeight = scene.halfHeight, cameraWidth = scene.cameraWidth, cameraHeight = scene.cameraHeight, pixelWidth = scene.pixelWidth, pixelHeight = scene.pixelHeight;
    var Movement;
    (function (Movement) {
        Movement[Movement["Forward"] = 0] = "Forward";
        Movement[Movement["Backward"] = 1] = "Backward";
        Movement[Movement["LeftStrafe"] = 2] = "LeftStrafe";
        Movement[Movement["RightStrafe"] = 3] = "RightStrafe";
    })(Movement || (Movement = {}));
    document.onkeydown = function (e) {
        var keyMap = {
            87: Movement.Forward,
            83: Movement.Backward,
            65: Movement.LeftStrafe,
            68: Movement.RightStrafe,
        };
        var forwardSpeed = 0.2;
        var backwardSpeed = 0.2;
        var strafeSpeed = 0.2;
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
        getFPS: function () {
            this.totalFrameCount++;
            this.frameNumber++;
            var d = new Date().getTime();
            var currentTime = (d - this.startTime) / 1000;
            var result = Math.floor(this.frameNumber / currentTime);
            if (currentTime > 1) {
                this.startTime = new Date().getTime();
                this.frameNumber = 0;
            }
            return result;
        }
    };
    var nextTick = function () {
        if (!isRunning) {
            return;
        }
        if (!bm.isBenchmarking) {
            updateFPS(fps.getFPS().toString());
        }
        if (bm.isBenchmarking) {
            startTime = performance.now();
        }
        var startTime, endTime;
        if (mode == Mode.CPU) {
            for (var i = 0; i < cpuKernels.length; i++) {
                var cpuKernel_1 = cpuKernels[i];
                cpuKernel_1(camera, lights, entities, eyeVector, vpRight, vpUp, canvasHeight, canvasWidth, fovRadians, heightWidthRatio, halfWidth, halfHeight, cameraWidth, cameraHeight, pixelWidth, pixelHeight, i % kernelDimension, Math.floor(i / kernelDimension));
                if (canvasNeedsUpdate) {
                    var cv = document.getElementById("canvas" + i).childNodes[0];
                    var bdy = cv.parentNode;
                    var newCanvas = cpuKernel_1.getCanvas();
                    bdy.replaceChild(newCanvas, cv);
                }
            }
            if (canvasNeedsUpdate) {
                canvasNeedsUpdate = false;
            }
        }
        else {
            for (var i = 0; i < gpuKernels.length; i++) {
                var gpuKernel = gpuKernels[i];
                gpuKernel(camera, lights, entities, eyeVector, vpRight, vpUp, canvasHeight, canvasWidth, fovRadians, heightWidthRatio, halfWidth, halfHeight, cameraWidth, cameraHeight, pixelWidth, pixelHeight, i % kernelDimension, Math.floor(i / kernelDimension));
                if (canvasNeedsUpdate) {
                    var cv = document.getElementById("canvas" + i).childNodes[0];
                    var bdy = cv.parentNode;
                    var newCanvas = gpuKernel.getCanvas();
                    bdy.replaceChild(newCanvas, cv);
                }
            }
            if (canvasNeedsUpdate) {
                canvasNeedsUpdate = false;
            }
        }
        for (var idx = 0; idx < entities.length; idx++) {
            entities[idx] = moveEntity(canvasWidth, canvasWidth, canvasWidth, entities[idx]);
        }
        entities = checkSphereSphereCollision(entities);
        if (bm.isBenchmarking) {
            var timeTaken = performance.now() - startTime;
            bm.addFrameGenDuration(timeTaken);
            bm.incrementTotalFrameCount();
            setTimeout(nextTick, 1);
        }
        else {
            requestAnimationFrame(nextTick);
        }
    };
    var checkSphereSphereCollision = function (allEntities) {
        for (var first = 0; first < allEntities.length - 1; first++) {
            if (allEntities[first][0] !== Entity.Type.SPHERE) {
                continue;
            }
            var sphere = allEntities[first];
            for (var second = first + 1; second < allEntities.length; second++) {
                if (allEntities[second][0] !== Entity.Type.SPHERE) {
                    continue;
                }
                var other = allEntities[second];
                var distance = vecMagnitude(vecSubtract([sphere[1], sphere[2], sphere[3]], [other[1], other[2], other[3]]));
                var radiusSum = sphere[7] + other[7];
                if (distance < radiusSum + (0.05 * radiusSum)) {
                    var basisVector = vecNormalize(vecSubtract([sphere[1], sphere[2], sphere[3]], [other[1], other[2], other[3]]));
                    var v1 = [sphere[15], sphere[16], sphere[17]];
                    var x1 = vecDotProduct(basisVector, v1);
                    var v1x = vecScale(basisVector, x1);
                    var v1y = vecSubtract(v1, v1x);
                    var m1 = 1;
                    basisVector = vecScale(basisVector, -1);
                    var v2 = [other[15], other[16], other[17]];
                    var x2 = vecDotProduct(basisVector, v2);
                    var v2x = vecScale(basisVector, x2);
                    var v2y = vecSubtract(v2, v2x);
                    var m2 = 1;
                    var newSphereVelocity = vecAdd3(vecScale(v1x, (m1 - m2) / (m1 + m2)), vecScale(v2x, (2 * m2) / (m1 + m2)), v1y);
                    allEntities[first][15] = newSphereVelocity[0];
                    allEntities[first][16] = newSphereVelocity[1];
                    allEntities[first][17] = newSphereVelocity[2];
                    var otherSphereVelocity = vecAdd3(vecScale(v1x, (2 * m2) / (m1 + m2)), vecScale(v2x, (m2 - m1) / (m1 + m2)), v2y);
                    allEntities[second][15] = otherSphereVelocity[0];
                    allEntities[second][16] = otherSphereVelocity[1];
                    allEntities[second][17] = otherSphereVelocity[2];
                    for (var colIdx = 8; colIdx < 11; colIdx++) {
                        allEntities[first][colIdx] = rand(0, 1);
                        allEntities[second][colIdx] = rand(0, 1);
                    }
                }
            }
        }
        return allEntities;
    };
    var moveEntity = function (width, height, depth, entity) {
        var reflect = function (entity, normal) {
            var incidentVec = [entity[15], entity[16], entity[17]];
            var dp = vecDotProduct(incidentVec, normal);
            var tmp = vecSubtract(incidentVec, vecScale(normal, 2 * dp));
            return tmp;
        };
        entity[1] += entity[15];
        entity[2] += entity[16];
        entity[3] += entity[17];
        if (entity[1] < -7) {
            _a = reflect(entity, [1, 0, 0]), entity[15] = _a[0], entity[16] = _a[1], entity[17] = _a[2];
        }
        if (entity[1] > 7) {
            _b = reflect(entity, [-1, 0, 0]), entity[15] = _b[0], entity[16] = _b[1], entity[17] = _b[2];
        }
        if (entity[2] < -7) {
            _c = reflect(entity, [0, 1, 0]), entity[15] = _c[0], entity[16] = _c[1], entity[17] = _c[2];
        }
        if (entity[2] > 7) {
            _d = reflect(entity, [0, -1, 0]), entity[15] = _d[0], entity[16] = _d[1], entity[17] = _d[2];
        }
        if (entity[3] < -15) {
            _e = reflect(entity, [0, 0, 1]), entity[15] = _e[0], entity[16] = _e[1], entity[17] = _e[2];
        }
        if (entity[3] > 7) {
            _f = reflect(entity, [0, 0, -1]), entity[15] = _f[0], entity[16] = _f[1], entity[17] = _f[2];
        }
        return entity;
        var _a, _b, _c, _d, _e, _f;
    };
    return nextTick;
};
var createKernel = function (mode, scene) {
    var opt = {
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
    return gpu.createKernel(function (camera, lights, entities, eyeVector, vpRight, vpUp, canvasHeight, canvasWidth, fovRadians, heightWidthRatio, halfWidth, halfHeight, cameraWidth, cameraHeight, pixelWidth, pixelHeight, xOffset, yOffset) {
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
        var red = 0.30;
        var green = 0.35;
        var blue = 0.31;
        var nearestEntityIndex = -1;
        var maxEntityDistance = Math.pow(2, 32);
        var nearestEntityDistance = Math.pow(2, 32);
        for (var i = 0; i < this.constants.ENTITY_COUNT; i++) {
            var distance = -1;
            var entityType = entities[i][0];
            if (entityType == this.constants.SPHERE ||
                entityType == this.constants.LIGHTSPHERE) {
                distance = sphereIntersection(entities[i][1], entities[i][2], entities[i][3], entities[i][7], rayPtX, rayPtY, rayPtZ, normRayVecX, normRayVecY, normRayVecZ);
            }
            else if (entityType == this.constants.PLANE) {
                distance = planeIntersection(entities[i][1], entities[i][2], entities[i][3], entities[i][18], rayPtX, rayPtY, rayPtZ, normRayVecX, normRayVecY, normRayVecZ);
            }
            if (distance >= 0 && distance < nearestEntityDistance) {
                nearestEntityIndex = i;
                nearestEntityDistance = distance;
                red = entities[i][8];
                green = entities[i][9];
                blue = entities[i][10];
            }
        }
        this.color(red, green, blue);
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
                        var distance = sphereIntersection(entities[j][1], entities[j][2], entities[j][3], entities[j][7], intersectPtX, intersectPtY, intersectPtZ, vecToLightX, vecToLightY, vecToLightZ);
                        if (distance > -0.005) {
                            shadowCast = 1;
                        }
                    }
                }
                if (shadowCast < 0) {
                    var contribution = dotProduct(vecToLightX, vecToLightY, vecToLightZ, sphereNormPtX, sphereNormPtY, sphereNormPtZ);
                    if (contribution > 0) {
                        lambertAmount += contribution;
                    }
                }
                lambertAmount = Math.min(1, lambertAmount);
                lambertRed += entityRed * lambertAmount * entityLambert;
                lambertGreen += entityGreen * lambertAmount * entityLambert;
                lambertBlue += entityBlue * lambertAmount * entityLambert;
            }
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
                var maxEntityDistanceSpecular = Math.pow(2, 32);
                var nearestEntityDistanceSpecular = Math.pow(2, 32);
                for (var i = 0; i < this.constants.ENTITY_COUNT; i++) {
                    if (entities[i][0] == this.constants.SPHERE) {
                        var distance = sphereIntersection(entities[i][1], entities[i][2], entities[i][3], entities[i][7], reflectedPtX, reflectedPtY, reflectedPtZ, reflectedVecX, reflectedVecY, reflectedVecZ);
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
                }
                else {
                    depth = depthLimit;
                }
            }
            var ambient = entities[nearestEntityIndex][14];
            this.color(lambertRed + (lambertRed * specularRed) + entityRed * ambient, lambertGreen + (lambertGreen * specularGreen) + entityGreen * ambient, lambertBlue + (lambertBlue * specularBlue) + entityBlue * ambient);
        }
    }, opt);
};
var generateKernels = function (dim, scene) {
    removeCanvasGrid();
    generateCanvasGrid(dim);
    var kernelCount = dim * dim;
    var gpuKernels = [];
    var cpuKernels = [];
    for (var i = 0; i < kernelCount; i++) {
        var kernel = createKernel(Mode.GPU, scene);
        gpuKernels.push(kernel);
        document.getElementById('canvas' + i).appendChild(kernel.getCanvas());
        cpuKernels.push(createKernel(Mode.CPU, scene));
    }
    return [gpuKernels, cpuKernels];
};
var addFunctions = function (gpu, functions) { return functions.forEach(function (f) { return gpu.addFunction(f); }); };
addFunctions(gpu, vectorFunctions);
addFunctions(gpu, utilityFunctions);
var scene = Scene.generateScene();
var _a = generateKernels(kernelDimension, scene), gpuKernels = _a[0], cpuKernels = _a[1];
var renderLoop = renderer(gpuKernels, cpuKernels, scene);
window.onload = renderLoop;
//# sourceMappingURL=app.js.map