var Mercury;
(function (Mercury) {
    var Utils;
    (function (Utils) {
        function isPrimitive(val) {
            var typeOf = typeof val;
            return (val === null) ||
                (typeOf === 'string') ||
                (typeOf === 'number') ||
                (typeOf === 'boolean') ||
                (typeOf === 'undefined');
        }
        Utils.isPrimitive = isPrimitive;
    })(Utils = Mercury.Utils || (Mercury.Utils = {}));
})(Mercury || (Mercury = {}));
