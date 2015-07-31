/// <reference path="../../../../typings/ember/ember.d.ts" />
/// <reference path="../modules/Trackers/Internal.ts" />
/// <reference path="../modules/Trackers/UniversalAnalytics.ts" />
var Mercury;
(function (Mercury) {
    var Utils;
    (function (Utils) {
        var actions = {
            add: 'add',
            click: 'click',
            clickLinkButton: 'click-link-button',
            clickLinkImage: 'click-link-image',
            clickLinkText: 'click-link-text',
            close: 'close',
            confirm: 'confirm',
            disable: 'disable',
            enable: 'enable',
            error: 'error',
            hover: 'hover',
            impression: 'impression',
            install: 'install',
            keypress: 'keypress',
            paginate: 'paginate',
            playVideo: 'play-video',
            remove: 'remove',
            open: 'open',
            share: 'share',
            submit: 'submit',
            success: 'success',
            swipe: 'swipe',
            takeSurvey: 'take-survey',
            view: 'view'
        }, context = {
            a: null,
            n: null
        };
        function pruneParams(params) {
            delete params.action;
            delete params.label;
            delete params.value;
            delete params.category;
            delete params.isNonInteractive;
        }
        function isSpecialWiki() {
            try {
                return !!(M.prop('isGASpecialWiki') || Mercury.wiki.isGASpecialWiki);
            }
            catch (e) {
                return false;
            }
        }
        function track(params) {
            var trackingMethod = params.trackingMethod || 'both', action = params.action, category = params.category ? 'mercury-' + params.category : null, label = params.label || '', value = params.value || 0, isNonInteractive = params.isNonInteractive !== false, trackers = Mercury.Modules.Trackers, tracker, uaTracker;
            if (M.prop('queryParams.noexternals')) {
                return;
            }
            params = $.extend({
                ga_action: action,
                ga_category: category,
                ga_label: label,
                ga_value: value,
                ga_is_nonInteractive: isNonInteractive
            }, params);
            pruneParams(params);
            if (trackingMethod === 'both' || trackingMethod === 'ga') {
                if (!category || !action) {
                    throw new Error('missing required GA params');
                }
                uaTracker = new trackers.UniversalAnalytics(isSpecialWiki());
                uaTracker.track(category, actions[action], label, value, isNonInteractive);
            }
            if (trackingMethod === 'both' || trackingMethod === 'internal') {
                tracker = new trackers.Internal();
                params = $.extend(context, params);
                tracker.track(params);
            }
        }
        Utils.track = track;
        function trackPageView(adsContext) {
            var trackers = Mercury.Modules.Trackers;
            if (M.prop('queryParams.noexternals')) {
                return;
            }
            Object.keys(trackers).forEach(function (tracker) {
                var Tracker = trackers[tracker], instance;
                if (typeof Tracker.prototype.trackPageView === 'function') {
                    instance = new Tracker(isSpecialWiki());
                    console.info('Track pageView:', tracker);
                    instance.trackPageView(instance.usesAdsContext ? adsContext : context);
                }
            });
        }
        Utils.trackPageView = trackPageView;
        function setTrackContext(data) {
            context = data;
        }
        Utils.setTrackContext = setTrackContext;
        Utils.trackActions = actions;
    })(Utils = Mercury.Utils || (Mercury.Utils = {}));
})(Mercury || (Mercury = {}));
