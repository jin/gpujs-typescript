let upVector = [0, 1, 0];
let intoVector = [0, 0, 1];
let rightVector = [1, 0, 0];
let zeroVector = [0, 0, 0];

function vecDotProduct(a: number[], b: number[]) : number {
  return (a[0] * b[0] + a[1] * b[1] + a[2] * b[2]);
};

function vecCrossProduct(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
};

function vecScale(a, sc) {
  return [a[0] * sc, a[1] * sc, a[2] * sc];
};

function vecMagnitude(a) {
  return Math.sqrt(vecDotProduct(a, a));
};

function vecNormalize(a: number[]) : number[] {
  let magnitude = vecMagnitude(a);
  let divideBy = (magnitude === 0) ? Infinity : 1 / magnitude;
  return vecScale(a, divideBy);
}

function vecAdd(a, b) : number[] {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function vecSubtract(a, b) : number[] {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

let vectorFunctions = [
  vecDotProduct,
  vecCrossProduct,
  vecScale,
  vecMagnitude,
  vecNormalize,
  vecAdd,
  vecSubtract
];
