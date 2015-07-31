/// <reference path="../../baseline/mercury.d.ts" />
'use strict';
var Mercury;
(function (Mercury) {
    var Utils;
    (function (Utils) {
        function load(...params) {
            return $script.apply(null, params);
        }
        Utils.load = load;
    })(Utils = Mercury.Utils || (Mercury.Utils = {}));
})(Mercury || (Mercury = {}));
