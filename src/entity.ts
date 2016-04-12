
namespace Entity {

  export enum Type { EMPTY, SPHERE, CUBOID, CYLINDER, CONE, TRIANGLE }

  export interface Opts {
    entityType: Type,
    x?: number,
    y?: number,
    z?: number,
    width?: number,
    height?: number,
    depth?: number,
    radius?: number,
    red?: number,
    green?: number,
    blue?: number,
    lambertianReflection: number, // Lambertian model reflection 0 to 1
    opacity: number, // 0 to 1
    specularReflection: number,  // 0 to 1
    ambientColor: number, // 0 to 1
    directionX: number,
    directionY: number,
    directionZ: number
  }

  export class Entity {

    entityType: Type
    x: number
    y: number
    z: number
    width: number
    height: number
    depth: number
    radius: number
    red: number
    green: number
    blue: number
    lambertianReflection: number
    opacity: number
    specularReflection: number
    ambientColor: number
    directionX: number
    directionY: number
    directionZ: number

    constructor(opts: Opts) {
      this.entityType = opts.entityType;
      this.opacity = opts.opacity;
      this.ambientColor = opts.ambientColor;
      this.specularReflection = opts.specularReflection;
      this.lambertianReflection = opts.lambertianReflection;

      this.x = opts.x                   || 0;
      this.y = opts.y                   || 0;
      this.z = opts.z                   || 0;
      this.red = opts.red               || 0;
      this.blue = opts.blue             || 0;
      this.green = opts.green           || 0;
      this.width = opts.width           || 0;
      this.height = opts.height         || 0;
      this.depth = opts.depth           || 0;
      this.radius = opts.radius         || 0;
      this.directionX = opts.directionX || 0;
      this.directionY = opts.directionY || 0;
      this.directionZ = opts.directionZ || 0;
    }

    toVector() : number[] {
      let array = [
        this.entityType,           // 0
        this.x,                    // 1
        this.y,                    // 2
        this.z,                    // 3
        this.width,                // 4
        this.height,               // 5
        this.depth,                // 6
        this.radius,               // 7
        this.red,                  // 8
        this.green,                // 9
        this.blue,                 // 10
        this.lambertianReflection, // 11
        this.opacity,              // 12
        this.specularReflection,   // 13
        this.ambientColor,         // 14
        this.directionX,           // 15
        this.directionY,           // 16
        this.directionZ            // 17
      ];

      return array;
    }

    fromNumberArray(array: number[]) {
    }

  }
}

