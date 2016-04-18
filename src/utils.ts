function square(x: number) : number {
  return x * x;
}

function dist(x1: number, y1: number, x2: number, y2: number) : number {
  return Math.sqrt(square(x2 - x1) + square(y2 - y1));
}


let rand = (min, max) => {
  return Math.random() * (max - min) + min;
}

let utilityFunctions = [square, dist];
