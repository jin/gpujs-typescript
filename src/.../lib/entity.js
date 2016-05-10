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
    var Entity = (function () {
        function Entity(opts) {
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
        Entity.prototype.toVector = function () {
            var array = [
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
        };
        Entity.prototype.fromNumberArray = function (array) {
        };
        return Entity;
    }());
    Entity_1.Entity = Entity;
})(Entity || (Entity = {}));
//# sourceMappingURL=entity.js.map