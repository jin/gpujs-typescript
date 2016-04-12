/// <reference path="entity.ts" />
/// <reference path="vector.ts" />

namespace Scene {

  type Camera = number[];
  type Light = number[];

  let camera: Camera = [
    0, 0, 15,  // x,y,z coordinates idx 0, 1, 2
    0, 3, 0,      // Direction normal vector idx 3, 4, 5
    60            // Field of view. idx 6
  ];

  let lights: Light[] = [
    // [30, 40, -20, 0, 1, 0], // x, y, z, r, g, b
    // [4, 0, 8, 0, 1, 0],
    [4, 3, 5, 0, 1, 0]
  ];

  let lightEntity = {
    entityType: Entity.Type.SPHERE,
    red: 1, green: 1, blue: 1,
    x: 0, y: 3, z: 1.8, radius: 0.2,
    specularReflection: 0.2, lambertianReflection: 1, ambientColor: 0.1, opacity: 1.0,
    directionX: 0, directionY: 0, directionZ: 0
  };

  let sphere_opts: Entity.Opts[] = [
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
  ]

  let rand = (min, max) => {
    return Math.random() * (max - min) + min;
  }

  let generateRandomSpheres  = (count: number) : Entity.Opts[] => {
    let ary = [];
    let minDirection = -0.07, maxDirection = 0.07;
    for (let i = 0; i < count; i++) {
      ary.push(
        {
          entityType: Entity.Type.SPHERE,
          red: rand(0.1, 0.9), green: rand(0.1, 0.9), blue: rand(0.1, 0.9),
          x: rand(-4, 4), y: rand(0, 7), z: rand(-7, 2), radius: rand(0.3, 2),
          specularReflection: rand(0.1, 0.2), lambertianReflection: rand(0.8, 1), ambientColor: rand(0, 1), opacity: rand(0, 1),
          directionX: rand(minDirection, maxDirection), directionY: rand(minDirection, maxDirection), directionZ: rand(minDirection, maxDirection)
        }
      )
    }

    return ary;
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
    opacity: 1.0,
    directionX: 0,
    directionY: 0,
    directionZ: 0
  }

  // let opts: Entity.Opts[] = sphere_opts.concat(generateRandomSpheres(2));
  let opts: Entity.Opts[] = generateRandomSpheres(parseInt(rand(2, 5))).concat([lightEntity]);

  let entities: Entity.Entity[] = opts.map(function(opt) {
    return new Entity.Entity(opt);
  })

  let eyeVector = vecNormalize(vecSubtract([camera[3], camera[4], camera[5]], [camera[0], camera[1], camera[2]]));

  let vpRight = vecNormalize(vecCrossProduct(eyeVector, upVector));
  let vpUp = vecNormalize(vecCrossProduct(vpRight, eyeVector));

  let canvasHeight = 600;
  let canvasWidth = 600;

  let fieldOfViewRadians = Math.PI * (camera[6] / 2) / 180;
  let heightWidthRatio = canvasHeight / canvasWidth;
  let halfWidth = Math.tan(fieldOfViewRadians);
  let halfHeight = heightWidthRatio * halfWidth;
  let cameraWidth = halfWidth * 2;
  let cameraHeight = halfHeight * 2;
  let pixelWidth = cameraWidth / (canvasWidth - 1);
  let pixelHeight = cameraHeight / (canvasHeight - 1);

  export interface Scene {
    camera: number[],
    lights: number[][],
    entities: Entity.Entity[],
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
    pixelHeight: number
  }

  export let scene = {
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
  }

}
