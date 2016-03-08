/// <reference path="./lib/gpu.d.ts" />

// Debugging helpers
function p(x) {
  console.log(x)
}

var gpu = new GPU();

// Create the GPU accelerated function from a kernel
// function that computes a single element in the
// 512 x 512 matrix (2D array). The kernel function
// is run in a parallel manner in the GPU resulting
// in very fast computations! (...sometimes)
var mat_mult = gpu.createKernel(function(A, B) {
    var sum = 0;
    for (var i=0; i<2; i++) {
        sum += A[this.thread.y][i] * B[i][this.thread.x];
    }
    return sum;
}).dimensions([2, 2]);

var A = [
  [1, 1],
  [1, 0]
]

var B = [
  [1, 1],
  [1, 0]
]

// Perform matrix multiplication on 2 matrices of size 2x2
var C = mat_mult(A, B);
p(C)
