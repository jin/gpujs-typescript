/// <reference path="entity.ts" />
/// <reference path="vector.ts" />
/// <reference path="utils.ts" />

namespace Scene {

  type Camera = number[];
  type Light = number[];

  let camera: Camera = [
    0, 0, 25,      // x,y,z coordinates idx 0, 1, 2
    0, 0, 24,      // Direction normal vector idx 3, 4, 5
    45             // Field of view. idx 6
  ];

  let light_opts = [
    // {
    //   entityType: Entity.Type.SPHERE,
    //   red: 1, green: 1, blue: 1,
    //   x: -7, y: 6, z: 4, radius: 0.3,
    //   specularReflection: 0.0, lambertianReflection: 1, ambientColor: 0.1, opacity: 1.0,
    //   directionX: 0, directionY: 0, directionZ: 0
    // },
    {
      entityType: Entity.Type.LIGHTSPHERE,
      red: 1, green: 1, blue: 1,
      x: 0, y: 7, z: 0, radius: 0.1,
      specularReflection: 0.0, lambertianReflection: 1, ambientColor: 1, opacity: 1.0,
      directionX: 0, directionY: 0, directionZ: 0
    }
    // {
    //   entityType: Entity.Type.SPHERE,
    //   red: 1, green: 1, blue: 1,
    //   x: 0, y: -7, z: 3, radius: 0.3,
    //   specularReflection: 0.2, lambertianReflection: 1, ambientColor: 0.1, opacity: 1.0,
    //   directionX: 0, directionY: 0, directionZ: 0
    // },
  ];

  // fake light entity
  let lights: number[][] = light_opts.map(light => {
    return [light.x, light.y + 0.5, light.z, light.red, light.green, light.blue];
  })

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

  let generateRandomSpheres = (count: number) : Entity.Opts[] => {
    let ary = [];
    let minDirection = -0.15, maxDirection = 0.15;
    for (let i = 0; i < count; i++) {
      ary.push(
        {
          entityType: Entity.Type.SPHERE,
          red: rand(0.05, 0.95), green: rand(0.05, 0.95), blue: rand(0.05, 0.95),
          x: rand(-7, 7) /* so they don't get stuck */, y: rand(0, 7), z: rand(-7, 2), radius: rand(0.3, 2.8),
          specularReflection: rand(0.1, 0.2), lambertianReflection: rand(0.8, 1), 
          ambientColor: rand(0.1, 0.4), opacity: rand(0, 1),
          directionX: rand(minDirection, maxDirection), 
          directionY: rand(minDirection, maxDirection), 
          directionZ: rand(minDirection, maxDirection)
        }
      )
    }
    return ary;
  }

  let plane_opts: Entity.Opts[] = [{
    entityType: Entity.Type.PLANE,
    red: 1.0,
    green: 1.0,
    blue: 1.0,
    x: 0, // normal vector x
    y: 3, // normal vector y
    z: 0, // normal vector z
    specularReflection: 0,
    lambertianReflection: 1,
    ambientColor: 0.2,
    opacity: 1.0,
    directionX: 0,
    directionY: 0,
    directionZ: 0,
    constant: 28 
  }]

  let opts: Entity.Opts[] = 
    generateRandomSpheres(4)
    .concat(light_opts)
    // .concat(plane_opts);

  let entities: number[][] = opts.map(function(opt) {
    return new Entity.Entity(opt);
  }).map(ent => ent.toVector());

  let eyeVector = vecNormalize(vecSubtract([camera[3], camera[4], camera[5]], [camera[0], camera[1], camera[2]]));

  let vpRight = vecNormalize(vecCrossProduct(eyeVector, upVector));
  let vpUp = vecNormalize(vecCrossProduct(vpRight, eyeVector));

  let canvasHeight = 640;
  let canvasWidth = 640;

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
    pixelHeight: number
  }

  export let generateScene = () => {
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
    }
  } 

  export let updateSphereCount = (count: number) => {
    opts = generateRandomSpheres(count).concat(light_opts)
    entities = opts.map(function(opt) {
      return new Entity.Entity(opt);
    }).map(ent => ent.toVector());
  }

}
