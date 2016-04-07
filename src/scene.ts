/// <reference path="entity.ts" />

namespace Scene {

  export let camera: number[][] = [
    [300, 300, 0],                     // x,y,z coordinates
    [0, 0, 1],                     // Direction normal vector
    [45]                         // field of view : example 45
  ];

  export let lights: number[][] = [
    [200, 200, 200, 0, 1, 0]        // light 1, x,y,z location, and rgb colour (green
  ];

  let sphere_1_opts: Entity.Opts = {
    entityType: Entity.Type.SPHERE,
    red: 1.0,
    green: 0.7,
    blue: 0.7,
    x: 700,
    y: 500,
    z: 500,
    radius: 40,
    specularReflection: 0.2,
    lambertianReflection: 0.7,
    ambientColor: 0.1,
    opacity: 1.0
  }

  let sphere_2_opts: Entity.Opts = {
    entityType: Entity.Type.SPHERE,
    red: 1.0,
    green: 0.7,
    blue: 0.2,
    x: 500,
    y: 100,
    z: 100,
    radius: 80,
    specularReflection: 0.2,
    lambertianReflection: 0.7,
    ambientColor: 0.1,
    opacity: 1.0,
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
    opacity: 1.0
  }

  let opts: Entity.Opts[] = [sphere_1_opts, sphere_2_opts, cylinder_opts];
  export let entities: number[][] = opts.map(function(opt) {
    let ent = new Entity.Entity(opt);
    return ent.toVector();
  })

}
