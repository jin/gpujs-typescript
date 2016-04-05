function p(x) {
    console.log(x);
}
var fps = {
    startTime: 0,
    frameNumber: 0,
    getFPS: function () {
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
var camera = [
    0, 1, 2,
    4, 4, 4,
    45
];
var lights = [
    2,
    200, 200, 200, 0, 1, 0,
    100, 100, 100, 1, 1, 1,
];
var EntityType;
(function (EntityType) {
    EntityType[EntityType["EMPTY"] = 0] = "EMPTY";
    EntityType[EntityType["SPHERE"] = 1] = "SPHERE";
    EntityType[EntityType["CUBOID"] = 2] = "CUBOID";
    EntityType[EntityType["CYLINDER"] = 3] = "CYLINDER";
    EntityType[EntityType["CONE"] = 4] = "CONE";
    EntityType[EntityType["TRIANGLE"] = 5] = "TRIANGLE";
})(EntityType || (EntityType = {}));
var Mode;
(function (Mode) {
    Mode[Mode["GPU"] = 0] = "GPU";
    Mode[Mode["CPU"] = 1] = "CPU";
})(Mode || (Mode = {}));
var stringOfMode = function (mode) {
    switch (mode) {
        case Mode.CPU: return "cpu";
        case Mode.GPU: return "gpu";
    }
};
var Entity = (function () {
    function Entity(opts) {
        this.entityType = opts.entityType;
        this.color = opts.color;
        this.specularReflection = opts.specularReflection;
        this.lambertianReflection = opts.lambertianReflection;
        this.ambientColor = opts.ambientColor;
        this.opacity = opts.opacity;
        this.coordinates = opts.coordinates;
        this.dimensions = opts.dimensions;
    }
    return Entity;
}());
var sphere_1_opts = {
    entityType: EntityType.SPHERE,
    color: { red: 1.0, green: 1.0, blue: 0.7 },
    specularReflection: 0.2,
    lambertianReflection: 0.7,
    ambientColor: 0.1,
    opacity: 1.0,
    coordinates: { x: 100, y: 500, z: 500 },
    dimensions: { radius: 40 }
};
var sphere_2_opts = {
    entityType: EntityType.SPHERE,
    color: { red: 0.0, green: 0.0, blue: 0.7 },
    specularReflection: 0.2,
    lambertianReflection: 0.7,
    ambientColor: 0.1,
    opacity: 1.0,
    coordinates: { x: 200, y: 600, z: 200 },
    dimensions: { radius: 20 }
};
var entities = [
    new Entity(sphere_1_opts),
    new Entity(sphere_2_opts)
];
var objects = [
    2,
    EntityType.SPHERE, 13, 1.0, 1.0, 0.7, 0.2, 0.7, 0.1, 1.0, 100, 500, 500, 40,
    EntityType.SPHERE, 13, 0.0, 0.0, 1.0, 0.2, 0.7, 0.1, 1.0, 200, 600, 200, 20
];
var toggleMode = function (el) {
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
};
var togglePause = function (el) {
    el.value = isRunning ? "Start" : "Pause";
    isRunning = !isRunning;
    if (isRunning) {
        renderLoop();
    }
    ;
};
var createKernel = function (mode) {
    var opt = {
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
        mode: stringOfMode(mode)
    };
    var kernel = gpu.createKernel(function (Camera, Lights, Objects) {
        var idx = 1;
        var nextidx = 1;
        this.color(0.95, 0.95, 0.95);
        for (var i = 0; i < this.constants.OBJCOUNT; i++) {
            idx = nextidx;
            nextidx = Objects[idx + 1] + idx;
            if (Objects[idx] == this.constants.SPHERE) {
                if (dist(this.thread.x, this.thread.y, Objects[idx + 9], Objects[idx + 10]) < Objects[idx + 12]) {
                    this.color(Objects[idx + 2], Objects[idx + 3], Objects[idx + 4]);
                }
            }
        }
    }, opt);
    return kernel;
};
var updateFPS = function (fps) {
    var f = document.querySelector("#fps");
    f.innerHTML = fps.toString();
};
var renderLoop = function () {
    if (!isRunning) {
        return;
    }
    updateFPS(fps.getFPS());
    if (mode === Mode.CPU) {
        cpuKernel(camera, lights, objects);
        var cv = document.getElementsByTagName("canvas")[0];
        var bdy = cv.parentNode;
        var newCanvas = cpuKernel.getCanvas();
        bdy.replaceChild(newCanvas, cv);
    }
    else {
        gpuKernel(camera, lights, objects);
        var cv = document.getElementsByTagName("canvas")[0];
        var bdy = cv.parentNode;
        var newCanvas = gpuKernel.getCanvas();
        bdy.replaceChild(newCanvas, cv);
    }
    objects[10] = (objects[10] + 2) % 900;
    objects[24] = (objects[24] + 2) % 700;
    setTimeout(renderLoop, 1);
};
function square(x) {
    return x * x;
}
function dist(x1, y1, x2, y2) {
    return Math.sqrt(square(x2 - x1) + square(y2 - y1));
}
var gpu = new GPU();
gpu.addFunction(square);
gpu.addFunction(dist);
var isRunning = true;
var mode = Mode.GPU;
var gpuKernel = createKernel(Mode.GPU);
var cpuKernel = createKernel(Mode.CPU);
gpuKernel(camera, lights, objects);
var canvas = gpuKernel.getCanvas();
document.getElementsByTagName('body')[0].appendChild(canvas);
window.onload = renderLoop;
//# sourceMappingURL=app.js.map