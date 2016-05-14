!function (t, e) { "object" == typeof exports && "object" == typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define([], e) : "object" == typeof exports ? exports.Redux = e() : t.Redux = e(); }(this, function () { return function (t) { function e(r) { if (n[r])
    return n[r].exports; var o = n[r] = { exports: {}, id: r, loaded: !1 }; return t[r].call(o.exports, o, o.exports, e), o.loaded = !0, o.exports; } var n = {}; return e.m = t, e.c = n, e.p = "", e(0); }([function (t, e, n) {
        "use strict";
        function r(t) { return t && t.__esModule ? t : { "default": t }; }
        e.__esModule = !0, e.compose = e.applyMiddleware = e.bindActionCreators = e.combineReducers = e.createStore = void 0;
        var o = n(2), i = r(o), u = n(7), c = r(u), f = n(6), a = r(f), s = n(5), d = r(s), l = n(1), p = r(l), y = n(3);
        r(y);
        e.createStore = i["default"], e.combineReducers = c["default"], e.bindActionCreators = a["default"], e.applyMiddleware = d["default"], e.compose = p["default"];
    }, function (t, e) {
        "use strict";
        function n() { for (var t = arguments.length, e = Array(t), n = 0; t > n; n++)
            e[n] = arguments[n]; if (0 === e.length)
            return function (t) { return t; }; var r = function () { var t = e[e.length - 1], n = e.slice(0, -1); return { v: function () { return n.reduceRight(function (t, e) { return e(t); }, t.apply(void 0, arguments)); } }; }(); return "object" == typeof r ? r.v : void 0; }
        e.__esModule = !0, e["default"] = n;
    }, function (t, e, n) {
        "use strict";
        function r(t) { return t && t.__esModule ? t : { "default": t }; }
        function o(t, e, n) { function r() { b === h && (b = h.slice()); } function i() { return v; } function c(t) { if ("function" != typeof t)
            throw Error("Expected listener to be a function."); var e = !0; return r(), b.push(t), function () { if (e) {
            e = !1, r();
            var n = b.indexOf(t);
            b.splice(n, 1);
        } }; } function s(t) { if (!(0, u["default"])(t))
            throw Error("Actions must be plain objects. Use custom middleware for async actions."); if (void 0 === t.type)
            throw Error('Actions may not have an undefined "type" property. Have you misspelled a constant?'); if (x)
            throw Error("Reducers may not dispatch actions."); try {
            x = !0, v = y(v, t);
        }
        finally {
            x = !1;
        } for (var e = h = b, n = 0; e.length > n; n++)
            e[n](); return t; } function d(t) { if ("function" != typeof t)
            throw Error("Expected the nextReducer to be a function."); y = t, s({ type: a.INIT }); } function l() { var t, e = c; return t = { subscribe: function (t) { function n() { t.next && t.next(i()); } if ("object" != typeof t)
                throw new TypeError("Expected the observer to be an object."); n(); var r = e(n); return { unsubscribe: r }; } }, t[f["default"]] = function () { return this; }, t; } var p; if ("function" == typeof e && void 0 === n && (n = e, e = void 0), void 0 !== n) {
            if ("function" != typeof n)
                throw Error("Expected the enhancer to be a function.");
            return n(o)(t, e);
        } if ("function" != typeof t)
            throw Error("Expected the reducer to be a function."); var y = t, v = e, h = [], b = h, x = !1; return s({ type: a.INIT }), p = { dispatch: s, subscribe: c, getState: i, replaceReducer: d }, p[f["default"]] = l, p; }
        e.__esModule = !0, e.ActionTypes = void 0, e["default"] = o;
        var i = n(4), u = r(i), c = n(11), f = r(c), a = e.ActionTypes = { INIT: "@@redux/INIT" };
    }, function (t, e) {
        "use strict";
        function n(t) { "undefined" != typeof console && "function" == typeof console.error && console.error(t); try {
            throw Error(t);
        }
        catch (e) { } }
        e.__esModule = !0, e["default"] = n;
    }, function (t, e, n) { function r(t) { if (!u(t) || l.call(t) != c || i(t))
        return !1; var e = o(t); if (null === e)
        return !0; var n = s.call(e, "constructor") && e.constructor; return "function" == typeof n && n instanceof n && a.call(n) == d; } var o = n(8), i = n(9), u = n(10), c = "[object Object]", f = Object.prototype, a = Function.prototype.toString, s = f.hasOwnProperty, d = a.call(Object), l = f.toString; t.exports = r; }, function (t, e, n) {
        "use strict";
        function r(t) { return t && t.__esModule ? t : { "default": t }; }
        function o() { for (var t = arguments.length, e = Array(t), n = 0; t > n; n++)
            e[n] = arguments[n]; return function (t) { return function (n, r, o) { var u = t(n, r, o), f = u.dispatch, a = [], s = { getState: u.getState, dispatch: function (t) { return f(t); } }; return a = e.map(function (t) { return t(s); }), f = c["default"].apply(void 0, a)(u.dispatch), i({}, u, { dispatch: f }); }; }; }
        e.__esModule = !0;
        var i = Object.assign || function (t) { for (var e = 1; arguments.length > e; e++) {
            var n = arguments[e];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (t[r] = n[r]);
        } return t; };
        e["default"] = o;
        var u = n(1), c = r(u);
    }, function (t, e) {
        "use strict";
        function n(t, e) { return function () { return e(t.apply(void 0, arguments)); }; }
        function r(t, e) { if ("function" == typeof t)
            return n(t, e); if ("object" != typeof t || null === t)
            throw Error("bindActionCreators expected an object or a function, instead received " + (null === t ? "null" : typeof t) + '. Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?'); for (var r = Object.keys(t), o = {}, i = 0; r.length > i; i++) {
            var u = r[i], c = t[u];
            "function" == typeof c && (o[u] = n(c, e));
        } return o; }
        e.__esModule = !0, e["default"] = r;
    }, function (t, e, n) {
        "use strict";
        function r(t) { return t && t.__esModule ? t : { "default": t }; }
        function o(t, e) { var n = e && e.type, r = n && '"' + n + '"' || "an action"; return "Given action " + r + ', reducer "' + t + '" returned undefined. To ignore an action, you must explicitly return the previous state.'; }
        function i(t) { Object.keys(t).forEach(function (e) { var n = t[e], r = n(void 0, { type: c.ActionTypes.INIT }); if (void 0 === r)
            throw Error('Reducer "' + e + '" returned undefined during initialization. If the state passed to the reducer is undefined, you must explicitly return the initial state. The initial state may not be undefined.'); var o = "@@redux/PROBE_UNKNOWN_ACTION_" + Math.random().toString(36).substring(7).split("").join("."); if (void 0 === n(void 0, { type: o }))
            throw Error('Reducer "' + e + '" returned undefined when probed with a random type. ' + ("Don't try to handle " + c.ActionTypes.INIT + ' or other actions in "redux/*" ') + "namespace. They are considered private. Instead, you must return the current state for any unknown actions, unless it is undefined, in which case you must return the initial state, regardless of the action type. The initial state may not be undefined."); }); }
        function u(t) { for (var e = Object.keys(t), n = {}, r = 0; e.length > r; r++) {
            var u = e[r];
            "function" == typeof t[u] && (n[u] = t[u]);
        } var c, f = Object.keys(n); try {
            i(n);
        }
        catch (a) {
            c = a;
        } return function () { var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, e = arguments[1]; if (c)
            throw c; for (var r = !1, i = {}, u = 0; f.length > u; u++) {
            var a = f[u], s = n[a], d = t[a], l = s(d, e);
            if (void 0 === l) {
                var p = o(a, e);
                throw Error(p);
            }
            i[a] = l, r = r || l !== d;
        } return r ? i : t; }; }
        e.__esModule = !0, e["default"] = u;
        var c = n(2), f = n(4), a = (r(f), n(3));
        r(a);
    }, function (t, e) { function n(t) { return r(Object(t)); } var r = Object.getPrototypeOf; t.exports = n; }, function (t, e) { function n(t) { var e = !1; if (null != t && "function" != typeof t.toString)
        try {
            e = !!(t + "");
        }
        catch (n) { } return e; } t.exports = n; }, function (t, e) { function n(t) { return !!t && "object" == typeof t; } t.exports = n; }, function (t, e, n) { (function (e) {
        "use strict";
        t.exports = n(12)(e || window || this);
    }).call(e, function () { return this; }()); }, function (t, e) {
        "use strict";
        t.exports = function (t) { var e, n = t.Symbol; return "function" == typeof n ? n.observable ? e = n.observable : (e = "function" == typeof n["for"] ? n["for"]("observable") : n("observable"), n.observable = e) : e = "@@observable", e; };
    }]); });
var Entity;
(function (Entity_1) {
    (function (Type) {
        Type[Type["EMPTY"] = 0] = "EMPTY";
        Type[Type["SPHERE"] = 1] = "SPHERE";
        Type[Type["CUBOID"] = 2] = "CUBOID";
        Type[Type["CYLINDER"] = 3] = "CYLINDER";
        Type[Type["CONE"] = 4] = "CONE";
        Type[Type["TRIANGLE"] = 5] = "TRIANGLE";
        Type[Type["PLANE"] = 6] = "PLANE";
        Type[Type["LIGHTSPHERE"] = 7] = "LIGHTSPHERE";
    })(Entity_1.Type || (Entity_1.Type = {}));
    var Type = Entity_1.Type;
    class Entity {
        constructor(opts) {
            this.entityType = opts.entityType;
            this.opacity = opts.opacity;
            this.ambientColor = opts.ambientColor;
            this.specularReflection = opts.specularReflection;
            this.lambertianReflection = opts.lambertianReflection;
            this.x = opts.x || 0;
            this.y = opts.y || 0;
            this.z = opts.z || 0;
            this.red = opts.red || 0;
            this.blue = opts.blue || 0;
            this.green = opts.green || 0;
            this.width = opts.width || 0;
            this.height = opts.height || 0;
            this.depth = opts.depth || 0;
            this.radius = opts.radius || 0;
            this.directionX = opts.directionX || 0;
            this.directionY = opts.directionY || 0;
            this.directionZ = opts.directionZ || 0;
            this.constant = opts.constant || 0;
        }
        toVector() {
            let array = [
                this.entityType,
                this.x,
                this.y,
                this.z,
                this.width,
                this.height,
                this.depth,
                this.radius,
                this.red,
                this.green,
                this.blue,
                this.lambertianReflection,
                this.opacity,
                this.specularReflection,
                this.ambientColor,
                this.directionX,
                this.directionY,
                this.directionZ,
                this.constant
            ];
            return array;
        }
        fromNumberArray(array) {
        }
    }
    Entity_1.Entity = Entity;
})(Entity || (Entity = {}));
let upVector = [0, 1, 0];
let intoVector = [0, 0, 1];
let rightVector = [1, 0, 0];
let zeroVector = [0, 0, 0];
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
    let mag = vecMagnitude(a);
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
let vectorFunctions = [
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
function square(x) {
    return x * x;
}
function dist(x1, y1, x2, y2) {
    return Math.sqrt(square(x2 - x1) + square(y2 - y1));
}
let rand = (min, max) => {
    return Math.random() * (max - min) + min;
};
let utilityFunctions = [square, dist];
var Scene;
(function (Scene) {
    let camera = [
        0, 0, 25,
        0, 0, 24,
        45
    ];
    let light_opts = [
        {
            entityType: Entity.Type.LIGHTSPHERE,
            red: 1, green: 1, blue: 1,
            x: 0, y: 7, z: 0, radius: 0.1,
            specularReflection: 0.0, lambertianReflection: 1, ambientColor: 1, opacity: 1.0,
            directionX: 0, directionY: 0, directionZ: 0
        }
    ];
    let lights = light_opts.map(light => {
        return [light.x, light.y + 0.5, light.z, light.red, light.green, light.blue];
    });
    let sphere_opts = [
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
    ];
    let generateRandomSpheres = (count) => {
        let ary = [];
        let minDirection = -0.15, maxDirection = 0.15;
        for (let i = 0; i < count; i++) {
            ary.push({
                entityType: Entity.Type.SPHERE,
                red: rand(0.05, 0.95), green: rand(0.05, 0.95), blue: rand(0.05, 0.95),
                x: rand(-7, 7), y: rand(0, 7), z: rand(-7, 2), radius: rand(0.3, 2.5),
                specularReflection: rand(0.1, 0.2), lambertianReflection: rand(0.8, 1),
                ambientColor: rand(0.1, 0.4), opacity: rand(0, 1),
                directionX: rand(minDirection, maxDirection),
                directionY: rand(minDirection, maxDirection),
                directionZ: rand(minDirection, maxDirection)
            });
        }
        return ary;
    };
    let plane_opts = [{
            entityType: Entity.Type.PLANE,
            red: 1.0,
            green: 1.0,
            blue: 1.0,
            x: 0,
            y: 3,
            z: 0,
            specularReflection: 0,
            lambertianReflection: 1,
            ambientColor: 0.2,
            opacity: 1.0,
            directionX: 0,
            directionY: 0,
            directionZ: 0,
            constant: 28
        }];
    let opts = generateRandomSpheres(4)
        .concat(light_opts);
    let entities = opts.map(function (opt) {
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
    Scene.generateScene = () => {
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
        };
    };
    Scene.updateSphereCount = (count) => {
        opts = generateRandomSpheres(count).concat(light_opts);
        entities = opts.map(function (opt) {
            return new Entity.Entity(opt);
        }).map(ent => ent.toVector());
        return entities;
    };
})(Scene || (Scene = {}));
var Benchmark;
(function (Benchmark_1) {
    class Benchmark {
        constructor() {
            this.mode = "";
            this.benchmarkDuration = 8000;
            this.resetBenchmark();
            this.resultHistory = [];
            this.framesToRender = 60;
        }
        resetBenchmark() {
            this.isBenchmarking = false;
            this.latestResults = {
                mode: this.mode,
                actualBenchmarkDuration: 0,
                totalFrameCount: 0,
                frameRenderDurations: []
            };
            this.startTime = null;
        }
        startBenchmark(mode, callback) {
            this.resetBenchmark();
            this.setMode(mode);
            this.setCallback(callback);
            this.startTime = performance.now();
            this.isBenchmarking = true;
        }
        stopBenchmark() {
            this.isBenchmarking = false;
            this.latestResults.actualBenchmarkDuration = performance.now() - this.startTime;
            this.computeMinMaxAvg();
            this.saveResults();
            this.callback();
        }
        setCallback(callback) {
            this.callback = callback;
        }
        getResults() {
            return this.latestResults;
        }
        saveResults() {
            this.resultHistory.push(this.latestResults);
            localStorage.setItem(this.mode, JSON.stringify(this.latestResults));
            localStorage.setItem("history", JSON.stringify(this.resultHistory));
        }
        displaySpeedup(elem) {
            let cpuResults = JSON.parse(localStorage.getItem('cpu'));
            let gpuResults = JSON.parse(localStorage.getItem('gpu'));
            let minSpeedup = cpuResults.minFrameRenderDuration / gpuResults.minFrameRenderDuration;
            let medianSpeedup = cpuResults.medianFrameRenderDuration / gpuResults.medianFrameRenderDuration;
            let fpsSpeedup = gpuResults.averageFPS / cpuResults.averageFPS;
            elem.innerHTML = `Speedups:
      <ul>
        <li>FPS speedup: ${fpsSpeedup}</li>
        <li>Min frame render speedup: ${minSpeedup}</li>
        <li>Median frame render speedup: ${medianSpeedup}</li>
      </ul>`;
        }
        displayResults(elem) {
            let dimElem = document.getElementById('grid-dimension');
            let sphereElem = document.getElementById('sphere-count');
            elem.innerHTML = `
      <ul>
        <li> Mode: ${this.getResults().mode.toUpperCase()} </li>
        <li> Dimension: ${dimElem.innerHTML} </li>
        <li> Sphere count: ${sphereElem.innerHTML} </li>
        <li> Total frames rendered: ${this.getResults().totalFrameCount} </li>
        <li> Actual time spent (ms): ${this.getResults().actualBenchmarkDuration} </li>
        <li> Average FPS: ${this.getResults().averageFPS} </li>
        <li> Frame render time - min (ms): ${this.getResults().minFrameRenderDuration} </li>
        <li> Frame render time - median (ms): ${this.getResults().medianFrameRenderDuration} </li>
      </ul>
      ${elem.innerHTML}
      `;
        }
        setMode(mode) {
            this.mode = mode;
            this.latestResults.mode = mode;
        }
        addFrameGenDuration(duration) {
            if (!this.isBenchmarking) {
                return;
            }
            this.latestResults.frameRenderDurations.push(duration);
        }
        incrementTotalFrameCount() {
            if (!this.isBenchmarking) {
                return;
            }
            this.latestResults.totalFrameCount += 1;
            if (this.latestResults.totalFrameCount >= this.framesToRender) {
                this.stopBenchmark();
            }
        }
        computeMinMaxAvg() {
            this.latestResults.averageFPS = this.getAverageFPS();
            this.latestResults.minFrameRenderDuration = this.getMinFrameRenderDuration();
            this.latestResults.maxFrameRenderDuration = this.getMaxFrameRenderDuration();
            this.latestResults.avgFrameRenderDuration = this.getAvgFrameRenderDuration();
            this.latestResults.medianFrameRenderDuration = this.getMedianFrameRenderDuration();
        }
        getAverageFPS() {
            let durationSeconds = this.getResults().actualBenchmarkDuration / 1000;
            let frameCount = this.getResults().totalFrameCount;
            return frameCount / durationSeconds;
        }
        getMinFrameRenderDuration() {
            return Math.min(...this.getResults().frameRenderDurations);
        }
        getMaxFrameRenderDuration() {
            return Math.max(...this.getResults().frameRenderDurations);
        }
        getMedianFrameRenderDuration() {
            let count = this.getResults().frameRenderDurations.length;
            if (count % 2 == 0) {
                count -= 1;
            }
            let median = this.getResults().frameRenderDurations.sort()[Math.floor(count / 2)];
            return median;
        }
        getAvgFrameRenderDuration() {
            let sum = this.getResults().frameRenderDurations.reduce((a, b) => a + b);
            let avg = sum / this.getResults().frameRenderDurations.length;
            return avg;
        }
    }
    Benchmark_1.Benchmark = Benchmark;
})(Benchmark || (Benchmark = {}));
var Mode;
(function (Mode) {
    Mode[Mode["GPU"] = 0] = "GPU";
    Mode[Mode["CPU"] = 1] = "CPU";
})(Mode || (Mode = {}));
const TOGGLE_MODE = "TOGGLE_MODE";
const initialState = {
    mode: Mode.GPU
};
let toggleModeAction = () => {
    return {
        type: TOGGLE_MODE
    };
};
let reducer = (state = initialState, action) => {
    switch (action.type) {
        case TOGGLE_MODE:
            let newMode = (state.mode == Mode.GPU) ? Mode.CPU : Mode.GPU;
            return Object.assign({}, state, {
                mode: newMode
            });
        default:
            return state;
    }
};
var store = Redux.createStore(reducer);
let unsubscribe = store.subscribe(() => {
    console.log(store.getState());
    canvasNeedsUpdate = true;
    const state = store.getState();
    document.getElementById('mode').innerHTML = stringOfMode(state.mode).toUpperCase();
});
var gpu = new GPU();
var kernelDimension = kernelDimension || 2;
if (sessionStorage.getItem("kernelDimension")) {
    kernelDimension = parseInt(sessionStorage.getItem("kernelDimension"));
    let slider = document.getElementById("dimension-slider");
    slider.value = kernelDimension;
    let label = document.getElementById("grid-dimension");
    label.innerHTML = kernelDimension;
}
var canvasNeedsUpdate = true;
var isRunning = true;
let stringOfMode = (mode) => {
    switch (mode) {
        case Mode.CPU: return "cpu";
        case Mode.GPU: return "gpu";
    }
};
let togglePause = (el) => {
    el.value = isRunning ? "Start" : "Pause";
    isRunning = !isRunning;
    if (isRunning) {
        renderLoop();
    }
    ;
};
let updateFPS = (fps) => {
    var f = document.querySelector("#fps");
    f.innerHTML = fps.toString();
};
let updateDimension = (elem) => {
    renderLoop = null;
    kernelDimension = parseInt(elem.value);
    sessionStorage.setItem("kernelDimension", JSON.stringify(kernelDimension));
    isRunning = false;
    document.getElementById('grid-dimension').innerHTML = elem.value;
    [gpuKernels, cpuKernels] = generateKernels(kernelDimension, scene);
    canvasNeedsUpdate = true;
    renderLoop = renderer(gpuKernels, cpuKernels, scene);
    setTimeout(() => {
        isRunning = true;
        renderLoop();
    }, 1000);
};
let generateCanvasGrid = (dim) => {
    var canvasContainer = document.getElementById("canvas-container");
    var divs = [];
    for (let i = 0; i < dim; i++) {
        var divElem = document.createElement('div');
        for (let j = 0; j < dim; j++) {
            let spanElem = document.createElement('span');
            spanElem.id = "canvas" + (j + (i * dim));
            spanElem.className = "canvas";
            divElem.appendChild(spanElem);
        }
        divs.push(divElem);
    }
    for (let i = divs.length - 1; i >= 0; i--) {
        canvasContainer.appendChild(divs[i]);
    }
};
let removeCanvasGrid = () => {
    var canvasContainer = document.getElementById("canvas-container");
    while (canvasContainer.lastChild) {
        for (let i = 0; i < canvasContainer.lastChild.childNodes.length; i++) {
            canvasContainer.lastChild.childNodes[i] = null;
        }
        canvasContainer.removeChild(canvasContainer.lastChild);
    }
};
let updateSphereSlider = (elem) => {
    isRunning = false;
    document.getElementById('sphere-count').innerHTML = elem.value;
    updateSphereCount(parseInt(elem.value));
};
let updateSphereCount = (count) => {
    let newEntities = Scene.updateSphereCount(count);
    scene.entities = newEntities;
    [gpuKernels, cpuKernels] = generateKernels(kernelDimension, scene);
    renderLoop = renderer(gpuKernels, cpuKernels, scene);
    canvasNeedsUpdate = true;
    setTimeout(() => {
        isRunning = true;
        if (isRunning) {
            renderLoop();
        }
        ;
    }, 1000);
};
let bm = new Benchmark.Benchmark();
let benchmark = (elem) => {
    elem.value = "Running..";
    elem.disabled = true;
    let resultsElem = document.getElementById("results");
    let speedupElem = document.getElementById("speedup");
    updateFPS("Benchmarking..");
    bm.startBenchmark(stringOfMode(store.getState().mode), () => {
        bm.displayResults(resultsElem);
        store.dispatch(toggleModeAction());
        bm.startBenchmark(stringOfMode(store.getState().mode), () => {
            bm.displayResults(resultsElem);
            bm.displaySpeedup(speedupElem);
            store.dispatch(toggleModeAction());
            elem.value = "Benchmark";
            elem.disabled = false;
        });
    });
};
var renderer = (gpuKernels, cpuKernel, scene) => {
    let camera = scene.camera, lights = scene.lights, entities = scene.entities, eyeVector = scene.eyeVector, vpRight = scene.vpRight, vpUp = scene.vpUp, canvasHeight = scene.canvasHeight, canvasWidth = scene.canvasWidth, fovRadians = scene.fovRadians, heightWidthRatio = scene.heightWidthRatio, halfWidth = scene.halfWidth, halfHeight = scene.halfHeight, cameraWidth = scene.cameraWidth, cameraHeight = scene.cameraHeight, pixelWidth = scene.pixelWidth, pixelHeight = scene.pixelHeight;
    var Movement;
    (function (Movement) {
        Movement[Movement["Forward"] = 0] = "Forward";
        Movement[Movement["Backward"] = 1] = "Backward";
        Movement[Movement["LeftStrafe"] = 2] = "LeftStrafe";
        Movement[Movement["RightStrafe"] = 3] = "RightStrafe";
    })(Movement || (Movement = {}));
    document.onkeydown = function (e) {
        let keyMap = {
            87: Movement.Forward,
            83: Movement.Backward,
            65: Movement.LeftStrafe,
            68: Movement.RightStrafe,
        };
        let forwardSpeed = 0.2;
        let backwardSpeed = 0.2;
        let strafeSpeed = 0.2;
        switch (keyMap[e.keyCode]) {
            case Movement.Forward:
                camera[2] -= forwardSpeed;
                break;
            case Movement.Backward:
                camera[2] += backwardSpeed;
                break;
            case Movement.LeftStrafe:
                camera[0] -= strafeSpeed;
                break;
            case Movement.RightStrafe:
                camera[0] += strafeSpeed;
                break;
            default:
                break;
        }
    };
    var fps = {
        startTime: 0,
        frameNumber: 0,
        totalFrameCount: 0,
        getFPS: function () {
            this.totalFrameCount++;
            this.frameNumber++;
            var d = new Date().getTime();
            var currentTime = (d - this.startTime) / 1000;
            var result = Math.floor(this.frameNumber / currentTime);
            if (currentTime > 1) {
                this.startTime = new Date().getTime();
                this.frameNumber = 0;
            }
            return result;
        }
    };
    let nextTick = () => {
        if (!isRunning) {
            return;
        }
        if (!bm.isBenchmarking) {
            updateFPS(fps.getFPS().toString());
        }
        if (bm.isBenchmarking) {
            startTime = performance.now();
        }
        var startTime, endTime;
        if (store.getState().mode == Mode.CPU) {
            for (let i = 0; i < cpuKernels.length; i++) {
                let cpuKernel = cpuKernels[i];
                cpuKernel(camera, lights, entities, eyeVector, vpRight, vpUp, canvasHeight, canvasWidth, fovRadians, heightWidthRatio, halfWidth, halfHeight, cameraWidth, cameraHeight, pixelWidth, pixelHeight, i % kernelDimension, Math.floor(i / kernelDimension));
                if (canvasNeedsUpdate) {
                    let cv = document.getElementById("canvas" + i).childNodes[0];
                    let bdy = cv.parentNode;
                    let newCanvas = cpuKernel.getCanvas();
                    bdy.replaceChild(newCanvas, cv);
                }
            }
            if (canvasNeedsUpdate) {
                canvasNeedsUpdate = false;
            }
        }
        else {
            for (let i = 0; i < gpuKernels.length; i++) {
                let gpuKernel = gpuKernels[i];
                gpuKernel(camera, lights, entities, eyeVector, vpRight, vpUp, canvasHeight, canvasWidth, fovRadians, heightWidthRatio, halfWidth, halfHeight, cameraWidth, cameraHeight, pixelWidth, pixelHeight, i % kernelDimension, Math.floor(i / kernelDimension));
                if (canvasNeedsUpdate) {
                    let cv = document.getElementById("canvas" + i).childNodes[0];
                    let bdy = cv.parentNode;
                    let newCanvas = gpuKernel.getCanvas();
                    bdy.replaceChild(newCanvas, cv);
                }
            }
            if (canvasNeedsUpdate) {
                canvasNeedsUpdate = false;
            }
        }
        for (let idx = 0; idx < entities.length; idx++) {
            entities[idx] = moveEntity(canvasWidth, canvasWidth, canvasWidth, entities[idx]);
        }
        entities = checkSphereSphereCollision(entities);
        if (bm.isBenchmarking) {
            let timeTaken = performance.now() - startTime;
            bm.addFrameGenDuration(timeTaken);
            bm.incrementTotalFrameCount();
            setTimeout(nextTick, 1);
        }
        else {
            requestAnimationFrame(nextTick);
        }
    };
    let checkSphereSphereCollision = (allEntities) => {
        for (let first = 0; first < allEntities.length - 1; first++) {
            if (allEntities[first][0] !== Entity.Type.SPHERE) {
                continue;
            }
            let sphere = allEntities[first];
            for (let second = first + 1; second < allEntities.length; second++) {
                if (allEntities[second][0] !== Entity.Type.SPHERE) {
                    continue;
                }
                let other = allEntities[second];
                let distance = vecMagnitude(vecSubtract([sphere[1], sphere[2], sphere[3]], [other[1], other[2], other[3]]));
                let radiusSum = sphere[7] + other[7];
                if (distance < radiusSum + (0.05 * radiusSum)) {
                    let basisVector = vecNormalize(vecSubtract([sphere[1], sphere[2], sphere[3]], [other[1], other[2], other[3]]));
                    let v1 = [sphere[15], sphere[16], sphere[17]];
                    let x1 = vecDotProduct(basisVector, v1);
                    let v1x = vecScale(basisVector, x1);
                    let v1y = vecSubtract(v1, v1x);
                    let m1 = 1;
                    basisVector = vecScale(basisVector, -1);
                    let v2 = [other[15], other[16], other[17]];
                    let x2 = vecDotProduct(basisVector, v2);
                    let v2x = vecScale(basisVector, x2);
                    let v2y = vecSubtract(v2, v2x);
                    let m2 = 1;
                    let newSphereVelocity = vecAdd3(vecScale(v1x, (m1 - m2) / (m1 + m2)), vecScale(v2x, (2 * m2) / (m1 + m2)), v1y);
                    allEntities[first][15] = newSphereVelocity[0];
                    allEntities[first][16] = newSphereVelocity[1];
                    allEntities[first][17] = newSphereVelocity[2];
                    let otherSphereVelocity = vecAdd3(vecScale(v1x, (2 * m2) / (m1 + m2)), vecScale(v2x, (m2 - m1) / (m1 + m2)), v2y);
                    allEntities[second][15] = otherSphereVelocity[0];
                    allEntities[second][16] = otherSphereVelocity[1];
                    allEntities[second][17] = otherSphereVelocity[2];
                    for (let colIdx = 8; colIdx < 11; colIdx++) {
                        allEntities[first][colIdx] = rand(0, 1);
                        allEntities[second][colIdx] = rand(0, 1);
                    }
                }
            }
        }
        return allEntities;
    };
    let moveEntity = (width, height, depth, entity) => {
        let reflect = (entity, normal) => {
            let incidentVec = [entity[15], entity[16], entity[17]];
            let dp = vecDotProduct(incidentVec, normal);
            let tmp = vecSubtract(incidentVec, vecScale(normal, 2 * dp));
            return tmp;
        };
        entity[1] += entity[15];
        entity[2] += entity[16];
        entity[3] += entity[17];
        if (entity[1] < -7) {
            [entity[15], entity[16], entity[17]] = reflect(entity, [1, 0, 0]);
        }
        if (entity[1] > 7) {
            [entity[15], entity[16], entity[17]] = reflect(entity, [-1, 0, 0]);
        }
        if (entity[2] < -7) {
            [entity[15], entity[16], entity[17]] = reflect(entity, [0, 1, 0]);
        }
        if (entity[2] > 7) {
            [entity[15], entity[16], entity[17]] = reflect(entity, [0, -1, 0]);
        }
        if (entity[3] < -15) {
            [entity[15], entity[16], entity[17]] = reflect(entity, [0, 0, 1]);
        }
        if (entity[3] > 7) {
            [entity[15], entity[16], entity[17]] = reflect(entity, [0, 0, -1]);
        }
        return entity;
    };
    return nextTick;
};
var createKernel = (mode, scene) => {
    const opt = {
        mode: stringOfMode(mode),
        dimensions: [Math.floor(scene.canvasWidth / kernelDimension), Math.floor(scene.canvasHeight / kernelDimension)],
        debug: false,
        graphical: true,
        safeTextureReadHack: false,
        constants: {
            ENTITY_COUNT: scene.entities.length,
            LIGHT_COUNT: scene.lights.length,
            SPHERE: Entity.Type.SPHERE,
            PLANE: Entity.Type.PLANE,
            LIGHTSPHERE: Entity.Type.LIGHTSPHERE
        }
    };
    return gpu.createKernel(function (camera, lights, entities, eyeVector, vpRight, vpUp, canvasHeight, canvasWidth, fovRadians, heightWidthRatio, halfWidth, halfHeight, cameraWidth, cameraHeight, pixelWidth, pixelHeight, xOffset, yOffset) {
        var x = this.thread.x + (this.dimensions.x * xOffset);
        var y = this.thread.y + (this.dimensions.y * yOffset);
        var xCompX = vpRight[0] * (x * pixelWidth - halfWidth);
        var xCompY = vpRight[1] * (x * pixelWidth - halfWidth);
        var xCompZ = vpRight[2] * (x * pixelWidth - halfWidth);
        var yCompX = vpUp[0] * (y * pixelHeight - halfHeight);
        var yCompY = vpUp[1] * (y * pixelHeight - halfHeight);
        var yCompZ = vpUp[2] * (y * pixelHeight - halfHeight);
        var rayPtX = camera[0];
        var rayPtY = camera[1];
        var rayPtZ = camera[2];
        var rayVecX = eyeVector[0] + xCompX + yCompX;
        var rayVecY = eyeVector[1] + xCompY + yCompY;
        var rayVecZ = eyeVector[2] + xCompZ + yCompZ;
        var normRayVecX = normalizeX(rayVecX, rayVecY, rayVecZ);
        var normRayVecY = normalizeY(rayVecX, rayVecY, rayVecZ);
        var normRayVecZ = normalizeZ(rayVecX, rayVecY, rayVecZ);
        var red = 0.30;
        var green = 0.35;
        var blue = 0.31;
        var nearestEntityIndex = -1;
        var maxEntityDistance = Math.pow(2, 32);
        var nearestEntityDistance = Math.pow(2, 32);
        for (var i = 0; i < this.constants.ENTITY_COUNT; i++) {
            var distance = -1;
            var entityType = entities[i][0];
            if (entityType == this.constants.SPHERE ||
                entityType == this.constants.LIGHTSPHERE) {
                distance = sphereIntersection(entities[i][1], entities[i][2], entities[i][3], entities[i][7], rayPtX, rayPtY, rayPtZ, normRayVecX, normRayVecY, normRayVecZ);
            }
            else if (entityType == this.constants.PLANE) {
                distance = planeIntersection(entities[i][1], entities[i][2], entities[i][3], entities[i][18], rayPtX, rayPtY, rayPtZ, normRayVecX, normRayVecY, normRayVecZ);
            }
            if (distance >= 0 && distance < nearestEntityDistance) {
                nearestEntityIndex = i;
                nearestEntityDistance = distance;
                red = entities[i][8];
                green = entities[i][9];
                blue = entities[i][10];
            }
        }
        this.color(red, green, blue);
        if (nearestEntityIndex >= 0) {
            var entityPtX = entities[nearestEntityIndex][1];
            var entityPtY = entities[nearestEntityIndex][2];
            var entityPtZ = entities[nearestEntityIndex][3];
            var entityRed = entities[nearestEntityIndex][8];
            var entityGreen = entities[nearestEntityIndex][9];
            var entityBlue = entities[nearestEntityIndex][10];
            var intersectPtX = rayPtX + normRayVecX * nearestEntityDistance;
            var intersectPtY = rayPtY + normRayVecY * nearestEntityDistance;
            var intersectPtZ = rayPtZ + normRayVecZ * nearestEntityDistance;
            var sphereNormPtX = sphereNormalX(entityPtX, entityPtY, entityPtZ, intersectPtX, intersectPtY, intersectPtZ);
            var sphereNormPtY = sphereNormalY(entityPtX, entityPtY, entityPtZ, intersectPtX, intersectPtY, intersectPtZ);
            var sphereNormPtZ = sphereNormalZ(entityPtX, entityPtY, entityPtZ, intersectPtX, intersectPtY, intersectPtZ);
            var lambertRed = 0, lambertGreen = 0, lambertBlue = 0;
            for (var i = 0; i < this.constants.LIGHT_COUNT; i++) {
                var lightPtX = lights[i][0];
                var lightPtY = lights[i][1];
                var lightPtZ = lights[i][2];
                var vecToLightX = sphereNormalX(intersectPtX, intersectPtY, intersectPtZ, lightPtX, lightPtY, lightPtZ);
                var vecToLightY = sphereNormalY(intersectPtX, intersectPtY, intersectPtZ, lightPtX, lightPtY, lightPtZ);
                var vecToLightZ = sphereNormalZ(intersectPtX, intersectPtY, intersectPtZ, lightPtX, lightPtY, lightPtZ);
                var shadowCast = -1;
                var lambertAmount = 0;
                var entityLambert = entities[nearestEntityIndex][11];
                for (var j = 0; j < this.constants.ENTITY_COUNT; j++) {
                    if (entities[j][0] == this.constants.SPHERE) {
                        var distance = sphereIntersection(entities[j][1], entities[j][2], entities[j][3], entities[j][7], intersectPtX, intersectPtY, intersectPtZ, vecToLightX, vecToLightY, vecToLightZ);
                        if (distance > -0.005) {
                            shadowCast = 1;
                        }
                    }
                }
                if (shadowCast < 0) {
                    var contribution = dotProduct(vecToLightX, vecToLightY, vecToLightZ, sphereNormPtX, sphereNormPtY, sphereNormPtZ);
                    if (contribution > 0) {
                        lambertAmount += contribution;
                    }
                }
                lambertAmount = Math.min(1, lambertAmount);
                lambertRed += entityRed * lambertAmount * entityLambert;
                lambertGreen += entityGreen * lambertAmount * entityLambert;
                lambertBlue += entityBlue * lambertAmount * entityLambert;
            }
            var specularRed = 0, specularBlue = 0, specularGreen = 0;
            var incidentRayVecX = rayVecX;
            var incidentRayVecY = rayVecY;
            var incidentRayVecZ = rayVecZ;
            var reflectedPtX = intersectPtX;
            var reflectedPtY = intersectPtY;
            var reflectedPtZ = intersectPtZ;
            var depthLimit = 3;
            var depth = 0;
            var entitySpecular = entities[nearestEntityIndex][13];
            while (depth < depthLimit) {
                var reflectedVecX = -reflectVecX(incidentRayVecX, incidentRayVecY, incidentRayVecZ, sphereNormPtX, sphereNormPtY, sphereNormPtZ);
                var reflectedVecY = -reflectVecY(incidentRayVecX, incidentRayVecY, incidentRayVecZ, sphereNormPtX, sphereNormPtY, sphereNormPtZ);
                var reflectedVecZ = -reflectVecZ(incidentRayVecX, incidentRayVecY, incidentRayVecZ, sphereNormPtX, sphereNormPtY, sphereNormPtZ);
                var nearestEntityIndexSpecular = -1;
                var maxEntityDistanceSpecular = Math.pow(2, 32);
                var nearestEntityDistanceSpecular = Math.pow(2, 32);
                for (var i = 0; i < this.constants.ENTITY_COUNT; i++) {
                    if (entities[i][0] == this.constants.SPHERE) {
                        var distance = sphereIntersection(entities[i][1], entities[i][2], entities[i][3], entities[i][7], reflectedPtX, reflectedPtY, reflectedPtZ, reflectedVecX, reflectedVecY, reflectedVecZ);
                        if (distance >= 0 && distance < nearestEntityDistance) {
                            nearestEntityIndexSpecular = i;
                            nearestEntityDistanceSpecular = distance;
                        }
                    }
                }
                if (nearestEntityIndexSpecular >= 0) {
                    entityPtX = entities[nearestEntityIndexSpecular][1];
                    entityPtY = entities[nearestEntityIndexSpecular][2];
                    entityPtZ = entities[nearestEntityIndexSpecular][3];
                    specularRed += entities[nearestEntityIndexSpecular][8] * entitySpecular;
                    specularGreen += entities[nearestEntityIndexSpecular][9] * entitySpecular;
                    specularBlue += entities[nearestEntityIndexSpecular][10] * entitySpecular;
                    reflectedPtX = reflectedPtX + normalizeX(reflectedVecX, reflectedVecY, reflectedVecZ) * nearestEntityDistance;
                    reflectedPtY = reflectedPtY + normalizeY(reflectedVecX, reflectedVecY, reflectedVecZ) * nearestEntityDistance;
                    reflectedPtZ = reflectedPtZ + normalizeZ(reflectedVecX, reflectedVecY, reflectedVecZ) * nearestEntityDistance;
                    sphereNormPtX = sphereNormalX(entityPtX, entityPtY, entityPtZ, reflectedPtX, reflectedPtY, reflectedPtZ);
                    sphereNormPtY = sphereNormalZ(entityPtX, entityPtY, entityPtZ, reflectedPtX, reflectedPtY, reflectedPtZ);
                    sphereNormPtY = sphereNormalZ(entityPtX, entityPtY, entityPtZ, reflectedPtX, reflectedPtY, reflectedPtZ);
                    incidentRayVecX = reflectedVecX;
                    incidentRayVecY = reflectedVecY;
                    incidentRayVecZ = reflectedVecZ;
                    depth += 1;
                }
                else {
                    depth = depthLimit;
                }
            }
            var ambient = entities[nearestEntityIndex][14];
            this.color(lambertRed + (lambertRed * specularRed) + entityRed * ambient, lambertGreen + (lambertGreen * specularGreen) + entityGreen * ambient, lambertBlue + (lambertBlue * specularBlue) + entityBlue * ambient);
        }
    }, opt);
};
let generateKernels = (dim, scene) => {
    removeCanvasGrid();
    generateCanvasGrid(dim);
    let kernelCount = dim * dim;
    let gpuKernels = [];
    let cpuKernels = [];
    for (let i = 0; i < kernelCount; i++) {
        let kernel = createKernel(Mode.GPU, scene);
        gpuKernels.push(kernel);
        document.getElementById('canvas' + i).appendChild(kernel.getCanvas());
        cpuKernels.push(createKernel(Mode.CPU, scene));
    }
    return [gpuKernels, cpuKernels];
};
let addFunctions = (gpu, functions) => functions.forEach(f => gpu.addFunction(f));
addFunctions(gpu, vectorFunctions);
addFunctions(gpu, utilityFunctions);
let scene = Scene.generateScene();
let [gpuKernels, cpuKernels] = generateKernels(kernelDimension, scene);
var renderLoop = renderer(gpuKernels, cpuKernels, scene);
window.onload = renderLoop;
//# sourceMappingURL=app.js.map