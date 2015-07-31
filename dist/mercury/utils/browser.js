/// <reference path="../../baseline/mercury.d.ts" />
'use strict';
var Mercury;
(function (Mercury) {
    var Utils;
    (function (Utils) {
        var Browser;
        (function (Browser) {
            function getSystem() {
                var ua = window.navigator.userAgent, system;
                if (ua.match(/iPad|iPhone|iPod/i) !== null) {
                    system = 'ios';
                }
                else if (ua.match(/Android/i) !== null) {
                    system = 'android';
                }
                return system;
            }
            Browser.getSystem = getSystem;
        })(Browser = Utils.Browser || (Utils.Browser = {}));
    })(Utils = Mercury.Utils || (Mercury.Utils = {}));
})(Mercury || (Mercury = {}));
