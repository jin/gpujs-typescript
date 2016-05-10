function square(x) {
    return x * x;
}
function dist(x1, y1, x2, y2) {
    return Math.sqrt(square(x2 - x1) + square(y2 - y1));
}
var rand = function (min, max) {
    return Math.random() * (max - min) + min;
};
var utilityFunctions = [square, dist];
//# sourceMappingURL=utils.js.map