/// <reference path="../../baseline/mercury.d.ts" />
'use strict';
var Mercury;
(function (Mercury) {
    var Utils;
    (function (Utils) {
        var String;
        (function (String) {
            function normalizeToUnderscore(title = '') {
                return title
                    .replace(/\s/g, '_')
                    .replace(/_+/g, '_');
            }
            String.normalizeToUnderscore = normalizeToUnderscore;
            function normalizeToWhitespace(str = '') {
                return str
                    .replace(/_/g, ' ')
                    .replace(/\s+/g, ' ');
            }
            String.normalizeToWhitespace = normalizeToWhitespace;
        })(String = Utils.String || (Utils.String = {}));
    })(Utils = Mercury.Utils || (Mercury.Utils = {}));
})(Mercury || (Mercury = {}));
