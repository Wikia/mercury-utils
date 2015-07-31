/// <reference path="../../../baseline/mercury.d.ts" />
'use strict';
var Mercury;
(function (Mercury) {
    var Modules;
    (function (Modules) {
        var Trackers;
        (function (Trackers) {
            class BaseTracker {
                constructor() {
                    this.usesAdsContext = false;
                }
                url() {
                    return '';
                }
                appendScript() {
                    var elem = document.createElement('script');
                    elem.async = true;
                    elem.src = this.url();
                    BaseTracker.script.parentNode.insertBefore(elem, BaseTracker.script);
                }
            }
            BaseTracker.script = document.getElementsByTagName('script')[0];
            Trackers.BaseTracker = BaseTracker;
        })(Trackers = Modules.Trackers || (Modules.Trackers = {}));
    })(Modules = Mercury.Modules || (Mercury.Modules = {}));
})(Mercury || (Mercury = {}));
