/// <reference path="../../../../../typings/jquery/jquery.d.ts" />
/// <reference path="../../utils/track.ts" />
var Mercury;
(function (Mercury) {
    var Modules;
    (function (Modules) {
        var Trackers;
        (function (Trackers) {
            class Internal {
                constructor() {
                    this.baseUrl = 'https://beacon.wikia-services.com/__track/';
                    this.callbackTimeout = 200;
                    var config = Internal.getConfig();
                    this.head = document.head || document.getElementsByTagName('head')[0];
                    this.defaults = config;
                }
                static getConfig() {
                    var mercury = window.Mercury;
                    return {
                        c: mercury.wiki.id,
                        x: mercury.wiki.dbName,
                        lc: mercury.wiki.language.user,
                        u: 0,
                        s: 'mercury',
                        beacon: '',
                        cb: ~~(Math.random() * 99999)
                    };
                }
                static isPageView(category) {
                    return category.toLowerCase() === 'view';
                }
                createRequestURL(category, params) {
                    var parts = [], paramStr, targetRoute = Internal.isPageView(category) ? 'view' : 'special/trackingevent', value;
                    Object.keys(params).forEach((key) => {
                        value = params[key];
                        if (value != null) {
                            paramStr = encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
                            parts.push(paramStr);
                        }
                    });
                    return this.baseUrl + targetRoute + '?' + parts.join('&');
                }
                loadTrackingScript(url) {
                    var script = document.createElement('script');
                    script.src = url;
                    script.onload = script.onreadystatechange = (abort) => {
                        if (!abort || !!script.readyState || !/loaded|complete/.test(script.readyState)) {
                            return;
                        }
                        script.onload = script.onreadystatechange = null;
                        if (this.head && script.parentNode) {
                            this.head.removeChild(script);
                        }
                        script = undefined;
                        if (!abort && typeof this.success === 'function') {
                            setTimeout(this.success, this.callbackTimeout);
                        }
                        else if (abort && typeof this.error === 'function') {
                            setTimeout(this.error, this.callbackTimeout);
                        }
                    };
                    this.head.insertBefore(script, this.head.firstChild);
                }
                track(params) {
                    var config = $.extend(params, this.defaults);
                    this.loadTrackingScript(this.createRequestURL(config.ga_category, config));
                }
                trackPageView(context) {
                    this.track($.extend({
                        ga_category: 'view'
                    }, context));
                }
            }
            Trackers.Internal = Internal;
        })(Trackers = Modules.Trackers || (Modules.Trackers = {}));
    })(Modules = Mercury.Modules || (Mercury.Modules = {}));
})(Mercury || (Mercury = {}));
