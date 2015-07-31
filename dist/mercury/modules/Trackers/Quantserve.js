/// <reference path="../../../../../typings/ember/ember.d.ts" />
/// <reference path="./BaseTracker.ts" />
'use strict';
var Mercury;
(function (Mercury) {
    var Modules;
    (function (Modules) {
        var Trackers;
        (function (Trackers) {
            class Quantserve extends Trackers.BaseTracker {
                constructor() {
                    window._qevents = [];
                    super();
                    this.usesAdsContext = true;
                }
                url() {
                    return (document.location.protocol == "https:" ? "https://secure" : "http://edge") + ".quantserve.com/quant.js?" + Math.random();
                }
                trackPageView() {
                    var quantcastLabels = ['Category.MobileWeb.Mercury'];
                    if (Mercury.wiki.vertical) {
                        quantcastLabels.unshift(Mercury.wiki.vertical);
                    }
                    window.__qc = null;
                    window._qevents = [{
                            qacct: M.prop('tracking.quantserve'),
                            labels: quantcastLabels.join(',')
                        }];
                    this.appendScript();
                }
            }
            Trackers.Quantserve = Quantserve;
        })(Trackers = Modules.Trackers || (Modules.Trackers = {}));
    })(Modules = Mercury.Modules || (Mercury.Modules = {}));
})(Mercury || (Mercury = {}));
