let upVector = [0, 1, 0];
let intoVector = [0, 0, 1];
let rightVector = [1, 0, 0];
let zeroVector = [0, 0, 0];

// Dot Product

function vecDotProduct(a: number[], b: number[]) : number {
  return (a[0] * b[0] + a[1] * b[1] + a[2] * b[2]);
};

function dotProduct(x1, x2, x3, y1, y2, y3) : number {
  return x1 * y1 + x2 * y2 + x3 * y3; 
}

// Cross Product

function vecCrossProduct(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
};

function crossProductX(x1, x2, x3, y1, y2, y3) : number {
  return x2 * y3 - x3 * y2;
} 

function crossProductY(x1, x2, x3, y1, y2, y3) : number {
  return x3 * y1 - x1 * y3;
}

function crossProductZ(x1, x2, x3, y1, y2, y3) : number {
  return x1 * y2 - x2 * y1;
}

// Scale

function vecScale(a, sc) {
  return [a[0] * sc, a[1] * sc, a[2] * sc];
};

function scaleX(x1, x2, x3, scale) : number { return scale * x1; }
function scaleY(x1, x2, x3, scale) : number { return scale * x2; }
function scaleZ(x1, x2, x3, scale) : number { return scale * x3; }

// Magnitude

function vecMagnitude(a) {
  return Math.sqrt(vecDotProduct(a, a));
};

function magnitude(x1, x2, x3) : number {
  return Math.sqrt(x1 * x1 + x2 * x2 + x3 * x3);
}

// Normalize

function vecNormalize(a: number[]) : number[] {
  let mag = vecMagnitude(a);
  return vecScale(a, 1 / mag);
}

function normalizeX(x1, x2, x3) {
  var mag = Math.sqrt(x1 * x1 + x2 * x2 + x3 * x3);
  return scaleX(x1, x2, x3, 1 / mag);
}

function normalizeY(x1, x2, x3) {
  var mag = Math.sqrt(x1 * x1 + x2 * x2 + x3 * x3);
  return scaleY(x1, x2, x3, 1 / mag);
}

function normalizeZ(x1, x2, x3) {
  var mag = Math.sqrt(x1 * x1 + x2 * x2 + x3 * x3);
  return scaleZ(x1, x2, x3, 1 / mag);
}

// Add

function vecAdd(a, b) : number[] {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function addX(x1, x2, x3, y1, y2, y3) : number { return x1 + y1; }
function addY(x1, x2, x3, y1, y2, y3) : number { return x2 + y2; }
function addZ(x1, x2, x3, y1, y2, y3) : number { return x3 + y3; }

// Add

function vecAdd3(a, b, c) : number[] {
  return [a[0] + b[0] + c[0], a[1] + b[1] + c[1], a[2] + b[2] + c[2]];
}

function add3X(x1, x2, x3, y1, y2, y3, z1, z2, z3) : number { return x1 + y1 + z1; }
function add3Y(x1, x2, x3, y1, y2, y3, z1, z2, z3) : number { return x2 + y2 + z2; }
function add3Z(x1, x2, x3, y1, y2, y3, z1, z2, z3) : number { return x3 + y3 + z3; }

// Subtract

function vecSubtract(a: number[], b: number[]) : number[] {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function subtractX(x1, x2, x3, y1, y2, y3) : number { return x1 - y1; }
function subtractY(x1, x2, x3, y1, y2, y3) : number { return x2 - y2; }
function subtractZ(x1, x2, x3, y1, y2, y3) : number { return x3 - y3; }

// let testSphere = {
//     x: 0,
//     y: 3.5,
//     z: -3,
//     radius: 2
// }

// let testRay = {
//   point: {
//     x: 0,
//     y: 1.8,
//     z: 10
//   },
//   getVector: function(x, y) {
//     let vpRight = [1, 0, 0];
//     let pixelWidth = 0.0013830169027482305;
//     let halfWidth = 0.41421356237309503;
//     let vpUp = [0, 0.9928768384869221, 0.11914522061843065];
//     let pixelHeight = 0.0013830169027482305;
//     let halfHeight = 0.41421356237309503;
//     let eyeVector = [0, 0.11914522061843064, -0.992876838486922];

//     var xcomp = vecScale(vpRight, (x * pixelWidth) - halfWidth),
//       ycomp = vecScale(vpUp, (y * pixelHeight) - halfHeight);

//     var vector = vecNormalize(vecAdd3(eyeVector, xcomp, ycomp));
//     return vector;
//   }
// }

function sphereIntersection(spherePtX, spherePtY, spherePtZ, sphereRadius, rayPtX, rayPtY, rayPtZ, rayVecX, rayVecY, rayVecZ): number {
  var eyeToCenterX = spherePtX - rayPtX;
  var eyeToCenterY = spherePtY - rayPtY;
  var eyeToCenterZ = spherePtZ - rayPtZ;
  var sideLength = eyeToCenterX * rayVecX + eyeToCenterY * rayVecY + eyeToCenterZ * rayVecZ;
  var cameraToCenterLength = eyeToCenterX * eyeToCenterX + eyeToCenterY * eyeToCenterY + eyeToCenterZ * eyeToCenterZ;
  var discriminant = (sphereRadius * sphereRadius) - cameraToCenterLength + (sideLength * sideLength);
  if (discriminant < 0) {
    return -1;
  } else {
    return sideLength - Math.sqrt(discriminant);
  }
}

// let x = 300, y = 300;
// console.log(sphereIntersection(testSphere.x, testSphere.y, testSphere.z, testSphere.radius, testRay.point.x, testRay.point.y, testRay.point.z, testRay.getVector(x, y)[0], testRay.getVector(x, y)[1], testRay.getVector(x, y)[2]));

(function unitTests() {
  function expect(desc, expr, val) {
    if (expr !== val) {
      throw("FAIL: " + desc + " / Actual: " + expr + " / Expected: " + val);
    } 
  }

  expect("addX", addX(1, 2, 3, 4, 5, 6), 5);
  expect("addY", addY(1, 2, 3, 4, 5, 6), 7);
  expect("addZ", addZ(1, 2, 3, 4, 5, 6), 9);
  expect("add3X", add3X(1, 2, 3, 4, 5, 6, 7, 8, 9), 12);
  expect("add3Y", add3Y(1, 2, 3, 4, 5, 6, 7, 8, 9), 15);
  expect("add3Z", add3Z(1, 2, 3, 4, 5, 6, 7, 8, 9), 18);
  expect("subtractX", subtractX(1, 2, 3, 4, 5, 6), -3);
  expect("subtractY", subtractY(1, 2, 3, 4, 5, 6), -3);
  expect("subtractZ", subtractZ(1, 2, 3, 4, 5, 6), -3);
  expect("magnitude", magnitude(2, 3, 4), Math.sqrt(4 + 9 + 16));
  expect("normalizeX", normalizeX(7, 24, 0), 7 / 25);
  expect("normalizeY", normalizeY(7, 24, 0), 24 / 25);
  expect("normalizeZ", normalizeZ(0, 24, 7), 7 / 25);
  expect("scaleX", scaleX(1, 2, 3, 3), 3);
  expect("scaleY", scaleY(1, 2, 3, 3), 6);
  expect("scaleZ", scaleZ(1, 2, 3, 3), 9);
  expect("crossProductX", crossProductX(2, 3, 4, 5, 6, 7), -3);
  expect("crossProductY", crossProductY(2, 3, 4, 5, 6, 7), 6);
  expect("crossProductZ", crossProductZ(2, 3, 4, 5, 6, 7), -3);
  expect("dotProduct", dotProduct(2, 3, 4, 5, 6, 7), 56);
})();

let vectorFunctions = [
  addX, addY, addZ,
  add3X, add3Y, add3Z,
  subtractX, subtractY, subtractZ,
  magnitude,
  normalizeX, normalizeY, normalizeZ,
  crossProductX, crossProductY, crossProductZ,
  scaleX, scaleY, scaleZ,
  dotProduct,
  sphereIntersection
];
