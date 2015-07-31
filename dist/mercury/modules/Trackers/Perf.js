/// <reference path="./BaseTracker.ts" />
/// <reference path="../../../../vendor/weppy/weppy.d.ts" />
/// <reference path="../../../baseline/mercury/utils/state.ts" />
'use strict';
var Mercury;
(function (Mercury) {
    var Modules;
    (function (Modules) {
        var Trackers;
        (function (Trackers) {
            class Perf extends Trackers.BaseTracker {
                constructor() {
                    this.tracker = Weppy.namespace('mercury');
                    this.defaultContext = {
                        skin: 'mercury',
                        'user-agent': window.navigator.userAgent,
                        env: M.prop('environment'),
                        url: window.location.href.split('#')[0],
                        country: M.prop('geo.country')
                    };
                    this.tracker.setOptions({
                        host: M.prop('weppyConfig').host,
                        transport: 'url',
                        context: this.defaultContext,
                        sample: M.prop('weppyConfig').samplingRate,
                        aggregationInterval: M.prop('weppyConfig').aggregationInterval,
                        logged_in: !!M.prop('userId')
                    });
                    super();
                }
                static checkDependencies() {
                    return typeof Weppy === 'function';
                }
                track(params) {
                    var trackFn = this.tracker;
                    if (typeof params.module === 'string') {
                        trackFn = this.tracker.into(params.module);
                    }
                    this.defaultContext.url = window.location.href.split('#')[0];
                    trackFn.setOptions({
                        context: $.extend(params.context, this.defaultContext)
                    });
                    switch (params.type) {
                        case 'count':
                            trackFn.count(params.name, params.value, params.annotations);
                            break;
                        case 'store':
                            trackFn.store(params.name, params.value, params.annotations);
                            break;
                        case 'timer':
                            trackFn.timer.send(params.name, params.value, params.annotations);
                            break;
                        case 'mark':
                            trackFn.timer.mark(params.name, params.annotations);
                            break;
                        case undefined:
                            throw 'You failed to specify a tracker type.';
                            break;
                        default:
                            throw 'This action not supported in Weppy tracker';
                    }
                    trackFn.flush();
                }
            }
            Trackers.Perf = Perf;
        })(Trackers = Modules.Trackers || (Modules.Trackers = {}));
    })(Modules = Mercury.Modules || (Mercury.Modules = {}));
})(Mercury || (Mercury = {}));
