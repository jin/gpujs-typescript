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
  let magnitude = vecMagnitude(a);
  let divideBy = (magnitude === 0) ? Infinity : 1 / magnitude;
  return vecScale(a, divideBy);
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

// Subtract

function vecSubtract(a, b) : number[] {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function subtractX(x1, x2, x3, y1, y2, y3) : number { return x1 - y1; }
function subtractY(x1, x2, x3, y1, y2, y3) : number { return x2 - y2; }
function subtractZ(x1, x2, x3, y1, y2, y3) : number { return x3 - y3; }

let vectorFunctions = [
  addX, addY, addZ,
  subtractX, subtractY, subtractZ,
  magnitude,
  normalizeX, normalizeY, normalizeZ,
  crossProductX, crossProductY, crossProductZ,
  scaleX, scaleY, scaleZ,
  dotProduct
];
