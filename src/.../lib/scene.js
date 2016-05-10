var Scene;
(function (Scene) {
    var camera = [
        0, 0, 25,
        0, 0, 24,
        45
    ];
    var light_opts = [
        {
            entityType: Entity.Type.LIGHTSPHERE,
            red: 1, green: 1, blue: 1,
            x: 0, y: 7, z: 0, radius: 0.1,
            specularReflection: 0.0, lambertianReflection: 1, ambientColor: 1, opacity: 1.0,
            directionX: 0, directionY: 0, directionZ: 0
        }
    ];
    var lights = light_opts.map(function (light) {
        return [light.x, light.y + 0.5, light.z, light.red, light.green, light.blue];
    });
    var sphere_opts = [
        {
            entityType: Entity.Type.SPHERE,
            red: 1.0, green: 0.7, blue: 0.7,
            x: -4, y: 3.5, z: -2, radius: 0.5,
            specularReflection: 0.1, lambertianReflection: 1, ambientColor: 0.1, opacity: 1.0,
            directionX: 0.05, directionY: 0.05, directionZ: -0.05
        },
        {
            entityType: Entity.Type.SPHERE,
            red: 1.0, green: 0.7, blue: 0.2,
            x: -4, y: 3.5, z: -2, radius: 0.7,
            specularReflection: 0.2, lambertianReflection: 0.7, ambientColor: 0.1, opacity: 1.0,
            directionX: 0.07, directionY: 0.02, directionZ: 0.11
        },
        {
            entityType: Entity.Type.SPHERE,
            red: 0.6, green: 0.7, blue: 0.3,
            x: -4, y: 3.5, z: -2, radius: 0.4,
            specularReflection: 0.2, lambertianReflection: 0.6, ambientColor: 0.1, opacity: 1.0,
            directionX: 0.02, directionY: -0.02, directionZ: -0.05
        },
        {
            entityType: Entity.Type.SPHERE,
            red: 0.4, green: 0.2, blue: 0.4,
            x: -4, y: 3.5, z: -2, radius: 0.9,
            specularReflection: 0.2, lambertianReflection: 0.8, ambientColor: 0.1, opacity: 1.0,
            directionX: 0.04, directionY: -0.06, directionZ: 0.11
        }
    ];
    var generateRandomSpheres = function (count) {
        var ary = [];
        var minDirection = -0.15, maxDirection = 0.15;
        for (var i = 0; i < count; i++) {
            ary.push({
                entityType: Entity.Type.SPHERE,
                red: rand(0.05, 0.95), green: rand(0.05, 0.95), blue: rand(0.05, 0.95),
                x: rand(-7, 7), y: rand(0, 7), z: rand(-7, 2), radius: rand(0.3, 2.5),
                specularReflection: rand(0.1, 0.2), lambertianReflection: rand(0.8, 1),
                ambientColor: rand(0.1, 0.4), opacity: rand(0, 1),
                directionX: rand(minDirection, maxDirection),
                directionY: rand(minDirection, maxDirection),
                directionZ: rand(minDirection, maxDirection)
            });
        }
        return ary;
    };
    var plane_opts = [{
            entityType: Entity.Type.PLANE,
            red: 1.0,
            green: 1.0,
            blue: 1.0,
            x: 0,
            y: 3,
            z: 0,
            specularReflection: 0,
            lambertianReflection: 1,
            ambientColor: 0.2,
            opacity: 1.0,
            directionX: 0,
            directionY: 0,
            directionZ: 0,
            constant: 28
        }];
    var opts = generateRandomSpheres(4)
        .concat(light_opts);
    var entities = opts.map(function (opt) {
        return new Entity.Entity(opt);
    }).map(function (ent) { return ent.toVector(); });
    var eyeVector = vecNormalize(vecSubtract([camera[3], camera[4], camera[5]], [camera[0], camera[1], camera[2]]));
    var vpRight = vecNormalize(vecCrossProduct(eyeVector, upVector));
    var vpUp = vecNormalize(vecCrossProduct(vpRight, eyeVector));
    var canvasHeight = 640;
    var canvasWidth = 640;
    var fieldOfViewRadians = Math.PI * (camera[6] / 2) / 180;
    var heightWidthRatio = canvasHeight / canvasWidth;
    var halfWidth = Math.tan(fieldOfViewRadians);
    var halfHeight = heightWidthRatio * halfWidth;
    var cameraWidth = halfWidth * 2;
    var cameraHeight = halfHeight * 2;
    var pixelWidth = cameraWidth / (canvasWidth - 1);
    var pixelHeight = cameraHeight / (canvasHeight - 1);
    Scene.generateScene = function () {
        return {
            camera: camera,
            lights: lights,
            entities: entities,
            eyeVector: eyeVector,
            vpRight: vpRight,
            vpUp: vpUp,
            canvasHeight: canvasHeight,
            canvasWidth: canvasWidth,
            fovRadians: fieldOfViewRadians,
            heightWidthRatio: heightWidthRatio,
            halfWidth: halfWidth,
            halfHeight: halfHeight,
            cameraWidth: cameraWidth,
            cameraHeight: cameraHeight,
            pixelWidth: pixelWidth,
            pixelHeight: pixelHeight
        };
    };
    Scene.updateSphereCount = function (count) {
        opts = generateRandomSpheres(count).concat(light_opts);
        entities = opts.map(function (opt) {
            return new Entity.Entity(opt);
        }).map(function (ent) { return ent.toVector(); });
        return entities;
    };
})(Scene || (Scene = {}));
//# sourceMappingURL=scene.js.map