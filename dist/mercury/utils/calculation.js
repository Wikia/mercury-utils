/// <reference path="../../baseline/mercury.d.ts" />
'use strict';
var Mercury;
(function (Mercury) {
    var Utils;
    (function (Utils) {
        var Calculation;
        (function (Calculation) {
            function containerSize(maxWidth, maxHeight, contentWidth, contentHeight) {
                var targetSize = {
                    width: 0,
                    height: 0
                };
                if (maxWidth < maxHeight) {
                    targetSize.width = maxWidth;
                    targetSize.height = Math.min(maxHeight, ~~(maxWidth * contentHeight / contentWidth));
                }
                else {
                    targetSize.width = Math.min(maxWidth, ~~(maxHeight * contentWidth / contentHeight));
                    targetSize.height = maxHeight;
                }
                return targetSize;
            }
            Calculation.containerSize = containerSize;
        })(Calculation = Utils.Calculation || (Utils.Calculation = {}));
    })(Utils = Mercury.Utils || (Mercury.Utils = {}));
})(Mercury || (Mercury = {}));
