/// <reference path="../../baseline/mercury.d.ts" />
/// <reference path="../modules/Trackers/Perf.ts" />
'use strict';
var Mercury;
(function (Mercury) {
    var Utils;
    (function (Utils) {
        var instance;
        function getInstance() {
            if (Mercury.Modules.Trackers.Perf.checkDependencies()) {
                instance = instance || new Mercury.Modules.Trackers.Perf();
                return instance;
            }
            throw new Error('no instance found');
        }
        function trackPerf(obj) {
            return getInstance().track(obj);
        }
        Utils.trackPerf = trackPerf;
        function sendPagePerformance() {
            getInstance();
            Weppy.sendPagePerformance();
        }
        Utils.sendPagePerformance = sendPagePerformance;
    })(Utils = Mercury.Utils || (Mercury.Utils = {}));
})(Mercury || (Mercury = {}));
