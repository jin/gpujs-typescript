var upVector = [0, 1, 0];
var intoVector = [0, 0, 1];
var rightVector = [1, 0, 0];
var zeroVector = [0, 0, 0];
function vecDotProduct(a, b) {
    return (a[0] * b[0] + a[1] * b[1] + a[2] * b[2]);
}
;
function dotProduct(x1, x2, x3, y1, y2, y3) {
    return x1 * y1 + x2 * y2 + x3 * y3;
}
function vecCrossProduct(a, b) {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
    ];
}
;
function crossProductX(x1, x2, x3, y1, y2, y3) {
    return x2 * y3 - x3 * y2;
}
function crossProductY(x1, x2, x3, y1, y2, y3) {
    return x3 * y1 - x1 * y3;
}
function crossProductZ(x1, x2, x3, y1, y2, y3) {
    return x1 * y2 - x2 * y1;
}
function vecScale(a, sc) {
    return [a[0] * sc, a[1] * sc, a[2] * sc];
}
;
function scaleX(x1, x2, x3, scale) { return scale * x1; }
function scaleY(x1, x2, x3, scale) { return scale * x2; }
function scaleZ(x1, x2, x3, scale) { return scale * x3; }
function vecMagnitude(a) {
    return Math.sqrt(vecDotProduct(a, a));
}
;
function magnitude(x1, x2, x3) {
    return Math.sqrt(x1 * x1 + x2 * x2 + x3 * x3);
}
function vecNormalize(a) {
    var mag = vecMagnitude(a);
    return vecScale(a, 1 / mag);
}
function normalizeX(x1, x2, x3) {
    var mag = magnitude(x1, x2, x3);
    return scaleX(x1, x2, x3, 1 / mag);
}
function normalizeY(x1, x2, x3) {
    var mag = magnitude(x1, x2, x3);
    return scaleY(x1, x2, x3, 1 / mag);
}
function normalizeZ(x1, x2, x3) {
    var mag = magnitude(x1, x2, x3);
    return scaleZ(x1, x2, x3, 1 / mag);
}
function vecAdd(a, b) {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}
function addX(x1, x2, x3, y1, y2, y3) { return x1 + y1; }
function addY(x1, x2, x3, y1, y2, y3) { return x2 + y2; }
function addZ(x1, x2, x3, y1, y2, y3) { return x3 + y3; }
function vecAdd3(a, b, c) {
    return [a[0] + b[0] + c[0], a[1] + b[1] + c[1], a[2] + b[2] + c[2]];
}
function add3X(x1, x2, x3, y1, y2, y3, z1, z2, z3) { return x1 + y1 + z1; }
function add3Y(x1, x2, x3, y1, y2, y3, z1, z2, z3) { return x2 + y2 + z2; }
function add3Z(x1, x2, x3, y1, y2, y3, z1, z2, z3) { return x3 + y3 + z3; }
function vecSubtract(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}
function subtractX(x1, x2, x3, y1, y2, y3) { return x1 - y1; }
function subtractY(x1, x2, x3, y1, y2, y3) { return x2 - y2; }
function subtractZ(x1, x2, x3, y1, y2, y3) { return x3 - y3; }
function sphereIntersection(spherePtX, spherePtY, spherePtZ, sphereRadius, rayPtX, rayPtY, rayPtZ, rayVecX, rayVecY, rayVecZ) {
    var eyeToCenterX = spherePtX - rayPtX;
    var eyeToCenterY = spherePtY - rayPtY;
    var eyeToCenterZ = spherePtZ - rayPtZ;
    var sideLength = dotProduct(eyeToCenterX, eyeToCenterY, eyeToCenterZ, rayVecX, rayVecY, rayVecZ);
    var cameraToCenterLength = dotProduct(eyeToCenterX, eyeToCenterY, eyeToCenterZ, eyeToCenterX, eyeToCenterY, eyeToCenterZ);
    var discriminant = (sphereRadius * sphereRadius) - cameraToCenterLength + (sideLength * sideLength);
    if (discriminant < 0) {
        return -1;
    }
    else {
        return sideLength - Math.sqrt(discriminant);
    }
}
function sphereNormalX(spherePtX, spherePtY, spherePtZ, surfacePtX, surfacePtY, surfacePtZ) {
    var x = surfacePtX - spherePtX, y = surfacePtY - spherePtY, z = surfacePtZ - spherePtZ;
    return x * (1 / magnitude(x, y, z));
}
function sphereNormalY(spherePtX, spherePtY, spherePtZ, surfacePtX, surfacePtY, surfacePtZ) {
    var x = surfacePtX - spherePtX, y = surfacePtY - spherePtY, z = surfacePtZ - spherePtZ;
    return y * (1 / magnitude(x, y, z));
}
function sphereNormalZ(spherePtX, spherePtY, spherePtZ, surfacePtX, surfacePtY, surfacePtZ) {
    var x = surfacePtX - spherePtX, y = surfacePtY - spherePtY, z = surfacePtZ - spherePtZ;
    return z * (1 / magnitude(x, y, z));
}
function reflectVecX(incidentVecX, incidentVecY, incidentVecZ, normalVecX, normalVecY, normalVecZ) {
    var scaleFactor = dotProduct(incidentVecX, incidentVecY, incidentVecZ, normalVecX, normalVecY, normalVecZ);
    var normalVecXScaled = normalVecX * scaleFactor * 2;
    return normalVecXScaled - incidentVecX;
}
function reflectVecY(incidentVecX, incidentVecY, incidentVecZ, normalVecX, normalVecY, normalVecZ) {
    var scaleFactor = dotProduct(incidentVecX, incidentVecY, incidentVecZ, normalVecX, normalVecY, normalVecZ);
    var normalVecYScaled = normalVecY * scaleFactor * 2;
    return normalVecYScaled - incidentVecY;
}
function reflectVecZ(incidentVecX, incidentVecY, incidentVecZ, normalVecX, normalVecY, normalVecZ) {
    var scaleFactor = dotProduct(incidentVecX, incidentVecY, incidentVecZ, normalVecX, normalVecY, normalVecZ);
    var normalVecZScaled = normalVecZ * scaleFactor * 2;
    return normalVecZScaled - incidentVecZ;
}
function planeIntersection(normalVecX, normalVecY, normalVecZ, distance, rayPtX, rayPtY, rayPtZ, rayVecX, rayVecY, rayVecZ) {
    var denom = dotProduct(rayVecX, rayVecY, rayVecZ, normalVecX, normalVecY, normalVecZ);
    if (denom !== 0) {
        var t = -(distance + (rayPtX * normalVecX + rayPtY * normalVecY + rayPtZ * normalVecZ)) / denom;
        if (t < 0) {
            return -1;
        }
        else {
            return t;
        }
    }
    else {
        return -1;
    }
}
(function unitTests() {
    function expect(desc, expr, val) {
        if (expr !== val) {
            throw ("FAIL: " + desc + " / Actual: " + expr + " / Expected: " + val);
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
var vectorFunctions = [
    addX, addY, addZ,
    add3X, add3Y, add3Z,
    subtractX, subtractY, subtractZ,
    magnitude,
    normalizeX, normalizeY, normalizeZ,
    crossProductX, crossProductY, crossProductZ,
    scaleX, scaleY, scaleZ,
    dotProduct,
    sphereIntersection,
    sphereNormalX, sphereNormalY, sphereNormalZ,
    reflectVecX, reflectVecY, reflectVecZ,
    planeIntersection
];
//# sourceMappingURL=vector.js.map