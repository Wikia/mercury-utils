/// <reference path="./BaseTracker.ts" />
'use strict';
var Mercury;
(function (Mercury) {
    var Modules;
    (function (Modules) {
        var Trackers;
        (function (Trackers) {
            class Comscore extends Trackers.BaseTracker {
                constructor() {
                    window._comscore = window._comscore || [];
                    super();
                }
                url() {
                    return (document.location.protocol == "https:" ? "https://sb" : "http://b") + ".scorecardresearch.com/beacon.js?" + Math.random();
                }
                trackPageView() {
                    var comscore = M.prop('tracking.comscore'), id = comscore.id, c7Value = comscore.c7Value;
                    window._comscore.push({
                        c1: '2',
                        c2: id,
                        options: {
                            url_append: comscore.keyword + '=' + c7Value
                        }
                    });
                    this.appendScript();
                }
            }
            Trackers.Comscore = Comscore;
        })(Trackers = Modules.Trackers || (Modules.Trackers = {}));
    })(Modules = Mercury.Modules || (Mercury.Modules = {}));
})(Mercury || (Mercury = {}));
