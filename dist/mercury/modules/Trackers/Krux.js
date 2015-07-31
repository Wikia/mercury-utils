'use strict';
var Mercury;
(function (Mercury) {
    var Modules;
    (function (Modules) {
        var Trackers;
        (function (Trackers) {
            class Krux {
                constructor() {
                    window.Krux = window.Krux || [];
                }
                trackPageView() {
                    if (typeof window.Krux.load === 'function') {
                        window.Krux.load(M.prop('tracking.krux.mobileId'));
                    }
                }
            }
            Trackers.Krux = Krux;
        })(Trackers = Modules.Trackers || (Modules.Trackers = {}));
    })(Modules = Mercury.Modules || (Mercury.Modules = {}));
})(Mercury || (Mercury = {}));
