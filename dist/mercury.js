'use strict';
var Mercury;
(function (Mercury) {
    var Modules;
    (function (Modules) {
        var Trackers;
        (function (Trackers) {
            var Krux = (function () {
                function Krux() {
                    window.Krux = window.Krux || [];
                }
                /**
                * @desc Exports page params to Krux.
                * mobileId variable is the ID referencing to the mobile site
                * (see ads_run.js and krux.js in app repository)
                */
                Krux.prototype.trackPageView = function () {
                    if (typeof window.Krux.load === 'function') {
                        window.Krux.load(M.prop('tracking.krux.mobileId'));
                    }
                };
                return Krux;
            })();
            Trackers.Krux = Krux;
        })(Trackers = Modules.Trackers || (Modules.Trackers = {}));
    })(Modules = Mercury.Modules || (Mercury.Modules = {}));
})(Mercury || (Mercury = {}));

/// <reference path="../../../../typings/google.analytics/ga.d.ts" />
/// <reference path="../../../baseline/mercury.ts" />
/// <reference path="../../../baseline/mercury.d.ts" />
/// <reference path="./trackers.d.ts" />
var Mercury;
(function (Mercury) {
    var Modules;
    (function (Modules) {
        var Trackers;
        (function (Trackers) {
            var UniversalAnalytics = (function () {
                function UniversalAnalytics(isSpecialWiki) {
                    if (isSpecialWiki === void 0) { isSpecialWiki = false; }
                    this.tracked = [];
                    this.accountPrimary = 'primary';
                    this.accountSpecial = 'special';
                    this.accountAds = 'ads';
                    if (!UniversalAnalytics.dimensions.length) {
                        throw new Error('Cannot instantiate UA tracker: please provide dimensions using UniversalAnalytics#setDimensions');
                    }
                    // All domains that host content for Wikia
                    // Use one of the domains below. If none matches, the tag will fall back to
                    // the default which is 'auto', probably good enough in edge cases.
                    var domain = [
                        'wikia.com',
                        'ffxiclopedia.org',
                        'jedipedia.de',
                        'marveldatabase.com',
                        'memory-alpha.org',
                        'uncyclopedia.org',
                        'websitewiki.de',
                        'wowwiki.com',
                        'yoyowiki.org'
                    ].filter(function (domain) { return document.location.hostname.indexOf(domain) > -1; })[0];
                    this.accounts = M.prop('tracking.ua');
                    // Primary account
                    this.initAccount(this.accountPrimary, domain);
                    this.initAccount(this.accountAds, domain);
                    if (isSpecialWiki) {
                        this.initAccount(this.accountSpecial, domain);
                    }
                }
                /**
                 * @static
                 * @description Synchronously sets the UA dimensional context
                 * @param {Array} dimensions  array of dimensions to set, may be strings or functions
                 * @param {boolean} overwrite  set to true to overwrite all preexisting dimensions and unset ones not declared
                 * @returns {boolean} true if dimensions were successfully set
                 */
                UniversalAnalytics.setDimensions = function (dimensions, overwrite) {
                    if (!dimensions.length) {
                        return false;
                    }
                    if (overwrite) {
                        this.dimensions = dimensions;
                    }
                    else {
                        $.extend(this.dimensions, dimensions);
                    }
                    return true;
                };
                /**
                 * @private
                 * @param {number} index of dimension
                 * @description Retrieves string value or invokes function for value
                 * @returns {string}
                 */
                UniversalAnalytics.prototype.getDimension = function (idx) {
                    var dimension = UniversalAnalytics.dimensions[idx];
                    return typeof dimension === 'function' ? dimension() : dimension;
                };
                /**
                 * Initialize an additional account or property
                 *
                 * @param {string} name The name of the account as specified in localSettings
                 * @param {string} domain
                 */
                UniversalAnalytics.prototype.initAccount = function (trackerName, domain) {
                    var _this = this;
                    var options, prefix, dimensionNum;
                    options = {
                        name: '',
                        allowLinker: true,
                        sampleRate: this.accounts[trackerName].sampleRate
                    };
                    prefix = '';
                    // Primary account should not have a namespace prefix
                    if (trackerName !== this.accountPrimary) {
                        prefix = this.accounts[trackerName].prefix + '.';
                    }
                    // Primary account should not have a namespace prefix
                    if (trackerName !== this.accountPrimary) {
                        options.name = this.accounts[trackerName].prefix;
                    }
                    ga('create', this.accounts[trackerName].id, 'auto', options);
                    ga(prefix + 'require', 'linker');
                    if (domain) {
                        ga(prefix + 'linker:autoLink', domain);
                    }
                    UniversalAnalytics.dimensions.forEach(function (dimension, idx) { return ga("" + prefix + "set", "dimension" + idx, _this.getDimension(idx)); });
                    this.tracked.push(this.accounts[trackerName]);
                };
                /**
                 * Tracks an event, using the parameters native to the UA send() method
                 *
                 * @see {@link https://developers.google.com/analytics/devguides/collection/analyticsjs/method-reference}
                 * @param {string} category Event category.
                 * @param {string} action Event action.
                 * @param {string} label Event label.
                 * @param {number} value Event value. Has to be an integer.
                 * @param {boolean} nonInteractive Whether event is non-interactive.
                 */
                UniversalAnalytics.prototype.track = function (category, action, label, value, nonInteractive) {
                    ga('send', {
                        hitType: 'event',
                        eventCategory: category,
                        eventAction: action,
                        eventLabel: label,
                        eventValue: value,
                        nonInteraction: nonInteractive
                    });
                };
                /**
                 * Tracks an ads-related event
                 * @see {@link https://developers.google.com/analytics/devguides/collection/analyticsjs/method-reference}
                 * @param {string} category Event category.
                 * @param {string} action Event action.
                 * @param {string} label Event label.
                 * @param {number} value Event value. Has to be an integer.
                 * @param {boolean} nonInteractive Whether event is non-interactive.
                 */
                UniversalAnalytics.prototype.trackAds = function (category, action, label, value, nonInteractive) {
                    ga(this.accounts[this.accountAds].prefix + '.send', {
                        hitType: 'event',
                        eventCategory: category,
                        eventAction: action,
                        eventLabel: label,
                        eventValue: value,
                        nonInteraction: nonInteractive
                    });
                };
                /**
                 * Tracks the current page view
                 */
                UniversalAnalytics.prototype.trackPageView = function () {
                    var pageType = this.getDimension(8);
                    if (!pageType) {
                        throw new Error('missing page type dimension (#8)');
                    }
                    this.tracked.forEach(function (account) {
                        var prefix = account.prefix ? account.prefix + '.' : '';
                        ga("" + prefix + "set", 'dimension8', pageType, 3);
                        ga("" + prefix + "send", 'pageview');
                    });
                };
                UniversalAnalytics.dimensions = [];
                return UniversalAnalytics;
            })();
            Trackers.UniversalAnalytics = UniversalAnalytics;
        })(Trackers = Modules.Trackers || (Modules.Trackers = {}));
    })(Modules = Mercury.Modules || (Mercury.Modules = {}));
})(Mercury || (Mercury = {}));

/// <reference path="../../baseline/mercury.d.ts" />
'use strict';
/**
* @description This module is an alias for whatever script loader implementation
* we are using. Use this stub to normalize/expose the features available to Wikia
* developers and also to allow for swapping implementations in the future.
*/
var Mercury;
(function (Mercury) {
    var Utils;
    (function (Utils) {
        function load() {
            var params = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                params[_i - 0] = arguments[_i];
            }
            return $script.apply(null, params);
        }
        Utils.load = load;
    })(Utils = Mercury.Utils || (Mercury.Utils = {}));
})(Mercury || (Mercury = {}));

/// <reference path='../../../typings/jquery/jquery.d.ts' />
/// <reference path='../../baseline/mercury.d.ts' />
/// <reference path='./Trackers/Krux.ts' />
/// <reference path='./Trackers/UniversalAnalytics.ts' />
/// <reference path='../../baseline/mercury.ts' />
/// <reference path='../utils/load.ts' />
'use strict';
var Mercury;
(function (Mercury) {
    var Modules;
    (function (Modules) {
        var Ads = (function () {
            function Ads() {
                this.adSlots = [];
                this.adsContext = null;
                this.currentAdsContext = null;
                this.isLoaded = false;
            }
            /**
             * Returns instance of Ads object
             * @returns {Mercury.Modules.Ads}
             */
            Ads.getInstance = function () {
                if (Ads.instance === null) {
                    Ads.instance = new Mercury.Modules.Ads();
                }
                return Ads.instance;
            };
            /**
             * Initializes the Ad module
             *
             * @param adsUrl Url for the ads script
             */
            Ads.prototype.init = function (adsUrl) {
                var _this = this;
                //Required by ads tracking code
                window.gaTrackAdEvent = this.gaTrackAdEvent;
                // Load the ads code from MW
                M.load(adsUrl, function () {
                    if (require) {
                        require([
                            'ext.wikia.adEngine.adEngine',
                            'ext.wikia.adEngine.adContext',
                            'ext.wikia.adEngine.config.mobile',
                            'ext.wikia.adEngine.adLogicPageViewCounter',
                            'wikia.krux'
                        ], function (adEngineModule, adContextModule, adConfigMobile, adLogicPageViewCounterModule, krux) {
                            _this.adEngineModule = adEngineModule;
                            _this.adContextModule = adContextModule;
                            _this.adConfigMobile = adConfigMobile;
                            _this.adLogicPageViewCounterModule = adLogicPageViewCounterModule;
                            window.Krux = krux || [];
                            _this.isLoaded = true;
                            _this.reloadWhenReady();
                            _this.kruxTrackFirstPage();
                        });
                    }
                    else {
                        console.error('Looks like ads asset has not been loaded');
                    }
                });
            };
            /**
             * Method for sampling and pushing ads-related events
             * @arguments coming from ads tracking request
             * It's called by track() method in wikia.tracker fetched from app by ads code
             */
            Ads.prototype.gaTrackAdEvent = function () {
                var adHitSample = 1, GATracker;
                //Sampling on GA side will kill the performance as we need to allocate object each time we track
                //ToDo: Optimize object allocation for tracking all events
                if (Math.random() * 100 <= adHitSample) {
                    GATracker = new Mercury.Modules.Trackers.UniversalAnalytics();
                    GATracker.trackAds.apply(GATracker, arguments);
                }
            };
            /**
             * Function fired when Krux is ready (see init()).
             * Calls the trackPageView() function on Krux instance.
             * load() in krux.js (/app) automatically detect that
             * there is a first page load (needs to load Krux scripts).
             */
            Ads.prototype.kruxTrackFirstPage = function () {
                var KruxTracker = new Mercury.Modules.Trackers.Krux();
                KruxTracker.trackPageView();
            };
            Ads.prototype.setContext = function (adsContext) {
                this.adsContext = adsContext ? adsContext : null;
            };
            /**
             * Reloads the ads with the provided adsContext
             * @param adsContext
             */
            Ads.prototype.reload = function (adsContext) {
                // Store the context for external reuse
                this.setContext(adsContext);
                this.currentAdsContext = adsContext;
                if (this.isLoaded && adsContext) {
                    this.adContextModule.setContext(adsContext);
                    this.adLogicPageViewCounterModule.increment();
                    // We need a copy of adSlots as .run destroys it
                    this.adEngineModule.run(this.adConfigMobile, this.getSlots(), 'queue.mercury');
                }
            };
            /**
             * This is callback that is run after script is loaded
             */
            Ads.prototype.reloadWhenReady = function () {
                this.reload(this.currentAdsContext);
            };
            /**
             * Returns copy of adSlots
             *
             * @returns {string[][]}
             */
            Ads.prototype.getSlots = function () {
                return $.extend([], this.adSlots);
            };
            /**
             * Adds ad slot
             *
             * @param name name of the slot
             * @returns {number} index of the inserted slot
             */
            Ads.prototype.addSlot = function (name) {
                return this.adSlots.push([name]);
            };
            /**
             * Removes ad slot by name
             *
             * @param name Name of ths slot to remove
             */
            Ads.prototype.removeSlot = function (name) {
                this.adSlots = $.grep(this.adSlots, function (slot) {
                    return slot[0] && slot[0] === name;
                }, true);
            };
            Ads.prototype.openLightbox = function (contents) {
                /**
                 * This method is being overwritten in ApplicationRoute for ads needs.
                 * To learn more check ApplicationRoute.ts file.
                 */
            };
            /**
             * Retrieves the ads context
             *
             * @returns {Object|null}
             */
            Ads.prototype.getContext = function () {
                return this.adsContext;
            };
            Ads.instance = null;
            return Ads;
        })();
        Modules.Ads = Ads;
    })(Modules = Mercury.Modules || (Mercury.Modules = {}));
})(Mercury || (Mercury = {}));

/// <reference path="../../baseline/mercury.d.ts" />
'use strict';
var Mercury;
(function (Mercury) {
    var Modules;
    (function (Modules) {
        Modules.Thumbnailer = window.Vignette;
    })(Modules = Mercury.Modules || (Mercury.Modules = {}));
})(Mercury || (Mercury = {}));

/// <reference path="../../../../typings/jquery/jquery.d.ts" />
/// <reference path="../../utils/track.ts" />
var Mercury;
(function (Mercury) {
    var Modules;
    (function (Modules) {
        var Trackers;
        (function (Trackers) {
            var Internal = (function () {
                function Internal() {
                    this.baseUrl = 'https://beacon.wikia-services.com/__track/';
                    this.callbackTimeout = 200;
                    var config = Internal.getConfig();
                    this.head = document.head || document.getElementsByTagName('head')[0];
                    this.defaults = config;
                }
                Internal.getConfig = function () {
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
                };
                Internal.isPageView = function (category) {
                    return category.toLowerCase() === 'view';
                };
                Internal.prototype.createRequestURL = function (category, params) {
                    var parts = [], paramStr, targetRoute = Internal.isPageView(category) ? 'view' : 'special/trackingevent', value;
                    Object.keys(params).forEach(function (key) {
                        value = params[key];
                        if (value != null) {
                            paramStr = encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
                            parts.push(paramStr);
                        }
                    });
                    return this.baseUrl + targetRoute + '?' + parts.join('&');
                };
                Internal.prototype.loadTrackingScript = function (url) {
                    var _this = this;
                    var script = document.createElement('script');
                    script.src = url;
                    script.onload = script.onreadystatechange = function (abort) {
                        if (!abort || !!script.readyState || !/loaded|complete/.test(script.readyState)) {
                            return;
                        }
                        // Handle memory leak in IE
                        script.onload = script.onreadystatechange = null;
                        // Remove the script
                        if (_this.head && script.parentNode) {
                            _this.head.removeChild(script);
                        }
                        // Dereference the script
                        script = undefined;
                        if (!abort && typeof _this.success === 'function') {
                            setTimeout(_this.success, _this.callbackTimeout);
                        }
                        else if (abort && typeof _this.error === 'function') {
                            setTimeout(_this.error, _this.callbackTimeout);
                        }
                    };
                    this.head.insertBefore(script, this.head.firstChild);
                };
                Internal.prototype.track = function (params) {
                    var config = $.extend(params, this.defaults);
                    this.loadTrackingScript(this.createRequestURL(config.ga_category, config));
                };
                /**
                 * alias to track a page view
                 */
                Internal.prototype.trackPageView = function (context) {
                    this.track($.extend({
                        ga_category: 'view'
                    }, context));
                };
                return Internal;
            })();
            Trackers.Internal = Internal;
        })(Trackers = Modules.Trackers || (Modules.Trackers = {}));
    })(Modules = Mercury.Modules || (Mercury.Modules = {}));
})(Mercury || (Mercury = {}));

/// <reference path="../modules/Trackers/Internal.ts" />
/// <reference path="../modules/Trackers/UniversalAnalytics.ts" />
var Mercury;
(function (Mercury) {
    var Utils;
    (function (Utils) {
        // These actions were ported over from legacy Wikia app code:
        // https://github.com/Wikia/app/blob/dev/resources/wikia/modules/tracker.stub.js
        // The property keys were modified to fit style rules
        var actions = {
            // Generic add
            add: 'add',
            // Generic click, mostly javascript clicks
            // NOTE: When tracking clicks, consider binding to 'onMouseDown' instead of 'onClick'
            // to allow the browser time to send these events naturally. For more information on
            // this issue, see the `track()` method in "resources/modules/tracker.js"
            click: 'click',
            // Click on navigational button
            clickLinkButton: 'click-link-button',
            // Click on image link
            clickLinkImage: 'click-link-image',
            // Click on text link
            clickLinkText: 'click-link-text',
            // Generic close
            close: 'close',
            // Clicking okay in a confirmation modal
            confirm: 'confirm',
            // Generic disable
            disable: 'disable',
            // Generic enable
            enable: 'enable',
            // Generic error (generally AJAX)
            error: 'error',
            // Generic hover
            hover: 'hover',
            // impression of item on page/module
            impression: 'impression',
            // App installation
            install: 'install',
            // Generic keypress
            keypress: 'keypress',
            paginate: 'paginate',
            // Video play
            playVideo: 'play-video',
            // Removal
            remove: 'remove',
            // Generic open
            open: 'open',
            // Sharing view email, social network, etc
            share: 'share',
            // Form submit, usually a post method
            submit: 'submit',
            // Successful ajax response
            success: 'success',
            // General swipe event
            swipe: 'swipe',
            // Action to take a survey
            takeSurvey: 'take-survey',
            // View
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
                // Property doesn't exist
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
            //We rely on ga_* params in both trackers
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
        /**
         * function for aggregating all page tracking that Wikia uses.
         * To make trackPageView work with your tracker,
         * make it a class in Mercury.Modules.Trackers and export one function 'trackPageView'
         *
         * trackPageView is called in ArticleView.onArticleChange
         */
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
        // Export actions so that they're accessible as M.trackActions
        Utils.trackActions = actions;
    })(Utils = Mercury.Utils || (Mercury.Utils = {}));
})(Mercury || (Mercury = {}));

/// <reference path="../../baseline/mercury.d.ts" />
/**
 * @define calculation
 *
 * Library with generic calculation functions
 */
'use strict';
var Mercury;
(function (Mercury) {
    var Utils;
    (function (Utils) {
        var Calculation;
        (function (Calculation) {
            /**
             * Calculate container size based on max dimensions and aspect ratio of the content
             *
             * @param {number} maxWidth
             * @param {number} maxHeight
             * @param {number} contentWidth
             * @param {number} contentHeight
             * @return {ContainerSize}
             */
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

/// <reference path="../../../baseline/mercury.d.ts" />
/// <reference path="../../utils/track.ts" />
/// <reference path="../../utils/load.ts" />
/// <reference path="../../utils/calculation.ts" />
var Mercury;
(function (Mercury) {
    var Modules;
    (function (Modules) {
        var VideoPlayers;
        (function (VideoPlayers) {
            var BasePlayer = (function () {
                function BasePlayer(provider, params) {
                    //Most common video container selector
                    this.containerSelector = '.lightbox-content-inner > iframe';
                    if (!provider) {
                        throw new Error('VideoPlayer requires a provider as the first argument');
                    }
                    this.provider = provider;
                    this.params = params;
                    this.id = params.videoId;
                    this.videoWidth = params.size.width;
                    this.videoHeight = params.size.height;
                }
                BasePlayer.prototype.loadPlayer = function () {
                    var _this = this;
                    return M.load(this.resourceURI, function () {
                        // called once player is loaded
                        _this.playerDidLoad();
                    });
                };
                /**
                 * Intentionally a no-op, documentation that this hook is implemented
                 * and to not error when called by loadPlayer*
                 */
                BasePlayer.prototype.playerDidLoad = function () {
                };
                /**
                 * Sets CSS width and height for the video container.
                 * Container selector is can be overriden by the inheriting class
                 * @param {String} containerSelector - JQuery selector of the video container
                 */
                BasePlayer.prototype.onResize = function (containerSelector) {
                    if (containerSelector === void 0) { containerSelector = this.containerSelector; }
                    var $container = $(containerSelector), $lightbox = $('.lightbox-wrapper'), lightboxWidth = $lightbox.width(), lightboxHeight = $lightbox.height(), targetSize, sanitizedSize;
                    targetSize = Mercury.Utils.Calculation.containerSize(lightboxWidth, lightboxHeight, this.videoWidth, this.videoHeight);
                    // sanitize as our backend sometimes returns size of 0x0
                    if (targetSize.width > 0 && targetSize.height > 0) {
                        sanitizedSize = {
                            width: targetSize.width,
                            height: targetSize.height
                        };
                    }
                    else {
                        sanitizedSize = {
                            width: '100%',
                            height: '100%'
                        };
                    }
                    $container.css(sanitizedSize);
                };
                BasePlayer.prototype.createUniqueId = function (id) {
                    var element = document.getElementById(id), newId = id + new Date().getTime();
                    if (element) {
                        element.id = newId;
                    }
                    return newId;
                };
                BasePlayer.prototype.track = function (event) {
                    if (event === void 0) { event = ''; }
                    return M.track({
                        action: event,
                        label: this.provider,
                        category: 'video-player-' + event
                    });
                };
                return BasePlayer;
            })();
            VideoPlayers.BasePlayer = BasePlayer;
        })(VideoPlayers = Modules.VideoPlayers || (Modules.VideoPlayers = {}));
    })(Modules = Mercury.Modules || (Mercury.Modules = {}));
})(Mercury || (Mercury = {}));

/// <reference path="../../baseline/mercury.d.ts" />
/// <reference path="./VideoPlayers/Base.ts" />
'use strict';
var Mercury;
(function (Mercury) {
    var Modules;
    (function (Modules) {
        var playerClassMap = {
            youtube: 'YouTube',
            ooyala: 'Ooyala'
        };
        var VideoLoader = (function () {
            function VideoLoader(data) {
                this.data = data;
                this.loadPlayerClass();
            }
            VideoLoader.prototype.isProvider = function (name) {
                return !!this.data.provider.toLowerCase().match(name);
            };
            /**
             * Loads player for the video, currently either OoyalaPlayer, YouTubePlayer or BasePlayer (default)
             */
            VideoLoader.prototype.loadPlayerClass = function () {
                var provider = this.getProviderName(), playerClassStr = (playerClassMap[provider] || 'Base') + 'Player', players = Modules.VideoPlayers, params = $.extend(this.data.jsParams, {
                    size: {
                        height: this.data.height,
                        width: this.data.width
                    }
                });
                this.player = new players[playerClassStr](provider, params);
                this.player.onResize();
            };
            VideoLoader.prototype.getProviderName = function () {
                return this.isProvider('ooyala') ? 'ooyala' : this.data.provider;
            };
            VideoLoader.prototype.onResize = function () {
                this.player.onResize();
            };
            return VideoLoader;
        })();
        Modules.VideoLoader = VideoLoader;
    })(Modules = Mercury.Modules || (Mercury.Modules = {}));
})(Mercury || (Mercury = {}));

/// <reference path="../../baseline/mercury.d.ts" />
/**
 * @define articlelink
 *
 * Library to parse links in an article and return information about how to process a given link.
 */
'use strict';
var Mercury;
(function (Mercury) {
    var Utils;
    (function (Utils) {
        /**
         * @param basePath the base url of the wiki without trailing slash, i.e. http://lastofus.wikia.com
         * or http://halo.bisaacs.wikia-dev
         * @param title the title of the article, such as David_Michael_Vigil
         * @param hash jumplink, either '#something' (to indicate there is a jumplink) or '' or undefined
         * @param uri the absolute link
         *
         * @return object in the form { article, url }. Only one of article or url will be non-null. If article is
         * non-null, then the application should transition to that article. If url is non-null, then the application should
         * go to the link directly. NOTE: url might be a jumplink. Do with that what you will.
         */
        function getLinkInfo(basePath, title, hash, uri) {
            var localPathMatch = uri.match('^' + window.location.origin + '(.*)$');
            if (localPathMatch) {
                var local = localPathMatch[1], 
                // Special internal link, we want to treat it as an external. (|| uri.match(/^\/Special:.*/))
                // NOTE: see below, but we might also have to deal with links in the form /Special:.*
                namespaces = Mercury.wiki.namespaces;
                //Handle links to main page
                if (local === '/') {
                    return {
                        article: '',
                        url: basePath + local
                    };
                }
                for (var ns in namespaces) {
                    if (!namespaces.hasOwnProperty(ns) || namespaces[ns].id === 0) {
                        continue;
                    }
                    // Style guide advises using dot accessor instead of brackets, but it is difficult
                    // to access a key with an asterisk* in it
                    var regex = '^(\/wiki)?\/' + namespaces[ns] + ':.*$';
                    if (local.match(regex)) {
                        return {
                            article: null,
                            url: basePath + local
                        };
                    }
                }
                /**
                 * Here we test if its an article link. We also have to check for /wiki/something for the jump links,
                 * because the url will be in that form and there will be a hash
                 * Some wikis, e.g. GTA, have article URLs in the from /something without the /wiki, so the /wiki
                 * is optional here.
                 *
                 * TODO: We currently don't handle links to other pages with jump links appended. If input is a
                 * link to another page, we'll simply transition to the top of that page regardless of whether or not
                 * there is a #jumplink appended to it.
                 */
                var article = local.match(/^(\/(wiki))?\/([^#]+)(#.*)?$/), comparison;
                try {
                    comparison = decodeURIComponent(article[3]);
                }
                catch (e) {
                    comparison = article[3];
                }
                if (article) {
                    if (comparison === title && hash) {
                        return {
                            article: null,
                            url: hash
                        };
                    }
                    return {
                        article: article[3],
                        url: null,
                        hash: article[4] ? hash : null
                    };
                }
            }
            return {
                article: null,
                url: uri
            };
        }
        Utils.getLinkInfo = getLinkInfo;
    })(Utils = Mercury.Utils || (Mercury.Utils = {}));
})(Mercury || (Mercury = {}));

/// <reference path="../../baseline/mercury.d.ts" />
/**
 * @define browser
 */
'use strict';
var Mercury;
(function (Mercury) {
    var Utils;
    (function (Utils) {
        var Browser;
        (function (Browser) {
            /**
             * Detects if user is using iOS or Android system
             * @return {string}
             */
            function getSystem() {
                var ua = window.navigator.userAgent, system;
                if (ua.match(/iPad|iPhone|iPod/i) !== null) {
                    system = 'ios';
                }
                else if (ua.match(/Android/i) !== null) {
                    system = 'android';
                }
                return system;
            }
            Browser.getSystem = getSystem;
        })(Browser = Utils.Browser || (Utils.Browser = {}));
    })(Utils = Mercury.Utils || (Mercury.Utils = {}));
})(Mercury || (Mercury = {}));

/// <reference path="../../baseline/mercury.d.ts" />
/**
 * @desc Helper functions to deal with Date and time
 */
var Mercury;
(function (Mercury) {
    var Utils;
    (function (Utils) {
        var DateTime;
        (function (DateTime) {
            /**
             * Interval types
             */
            (function (Interval) {
                Interval[Interval["Now"] = 0] = "Now";
                Interval[Interval["Second"] = 1] = "Second";
                Interval[Interval["Minute"] = 2] = "Minute";
                Interval[Interval["Hour"] = 3] = "Hour";
                Interval[Interval["Day"] = 4] = "Day";
                Interval[Interval["Month"] = 5] = "Month";
                Interval[Interval["Year"] = 6] = "Year";
            })(DateTime.Interval || (DateTime.Interval = {}));
            var Interval = DateTime.Interval;
            /**
             * Returns Interval type and value given two dates
             *
             * @param from Date in the past
             * @param to Optional date in the future. Defaults to current date/time
             * @returns TimeAgoResult
             */
            function timeAgo(from, to) {
                if (to === void 0) { to = new Date(); }
                var timeDiff = Math.floor((to.getTime() - from.getTime()) / 1000);
                if (timeDiff == 0) {
                    return {
                        type: 0 /* Now */,
                        value: 0
                    };
                }
                // seconds
                if (timeDiff < 60) {
                    return {
                        type: 1 /* Second */,
                        value: timeDiff
                    };
                }
                // minutes
                timeDiff = Math.floor(timeDiff / 60);
                if (timeDiff < 60) {
                    return {
                        type: 2 /* Minute */,
                        value: timeDiff
                    };
                }
                // hours
                timeDiff = Math.floor(timeDiff / 60);
                if (timeDiff < 24) {
                    return {
                        type: 3 /* Hour */,
                        value: timeDiff
                    };
                }
                // days
                timeDiff = Math.floor(timeDiff / 24);
                if (timeDiff < 30) {
                    return {
                        type: 4 /* Day */,
                        value: timeDiff
                    };
                }
                // months
                timeDiff = Math.floor(timeDiff / 30);
                if (timeDiff < 12) {
                    return {
                        type: 5 /* Month */,
                        value: timeDiff
                    };
                }
                // years
                timeDiff = Math.floor(timeDiff / 12);
                return {
                    type: 6 /* Year */,
                    value: timeDiff
                };
            }
            DateTime.timeAgo = timeAgo;
        })(DateTime = Utils.DateTime || (Utils.DateTime = {}));
    })(Utils = Mercury.Utils || (Mercury.Utils = {}));
})(Mercury || (Mercury = {}));

/// <reference path="../../baseline/mercury.d.ts" />
'use strict';
var Mercury;
(function (Mercury) {
    var Utils;
    (function (Utils) {
        var String;
        (function (String) {
            /**
             * We need to support links like:
             * /wiki/Rachel Berry
             * /wiki/Rachel  Berry
             * /wiki/Rachel__Berry
             *
             * but we want them to be displayed normalized in URL bar
             */
            function normalizeToUnderscore(title) {
                if (title === void 0) { title = ''; }
                return title.replace(/\s/g, '_').replace(/_+/g, '_');
            }
            String.normalizeToUnderscore = normalizeToUnderscore;
            function normalizeToWhitespace(str) {
                if (str === void 0) { str = ''; }
                return str.replace(/_/g, ' ').replace(/\s+/g, ' ');
            }
            String.normalizeToWhitespace = normalizeToWhitespace;
        })(String = Utils.String || (Utils.String = {}));
    })(Utils = Mercury.Utils || (Mercury.Utils = {}));
})(Mercury || (Mercury = {}));

/// <reference path="../../../baseline/mercury.d.ts" />
'use strict';
/**
 * Base class for trackers that have to append their scripts like Comscore or Quantserve
 */
var Mercury;
(function (Mercury) {
    var Modules;
    (function (Modules) {
        var Trackers;
        (function (Trackers) {
            var BaseTracker = (function () {
                function BaseTracker() {
                    this.usesAdsContext = false;
                }
                //This method should overridden implemented by a tracker
                BaseTracker.prototype.url = function () {
                    return '';
                };
                BaseTracker.prototype.appendScript = function () {
                    var elem = document.createElement('script');
                    elem.async = true;
                    elem.src = this.url();
                    BaseTracker.script.parentNode.insertBefore(elem, BaseTracker.script);
                };
                BaseTracker.script = document.getElementsByTagName('script')[0];
                return BaseTracker;
            })();
            Trackers.BaseTracker = BaseTracker;
        })(Trackers = Modules.Trackers || (Modules.Trackers = {}));
    })(Modules = Mercury.Modules || (Mercury.Modules = {}));
})(Mercury || (Mercury = {}));

/// <reference path="./BaseTracker.ts" />
/// <reference path="../../../../bower_components/weppy/weppy.d.ts" />
/// <reference path="../../../baseline/mercury/utils/state.ts" />
'use strict';
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Mercury;
(function (Mercury) {
    var Modules;
    (function (Modules) {
        var Trackers;
        (function (Trackers) {
            var Perf = (function (_super) {
                __extends(Perf, _super);
                function Perf() {
                    this.tracker = Weppy.namespace('mercury');
                    this.context = {
                        skin: 'mercury',
                        'user-agent': window.navigator.userAgent,
                        env: M.prop('environment'),
                        url: window.location.href.split('#')[0],
                        country: M.prop('geo.country'),
                        logged_in: !!M.prop('userId')
                    };
                    this.tracker.setOptions({
                        host: M.prop('weppyConfig').host,
                        transport: 'url',
                        context: this.context,
                        sample: M.prop('weppyConfig').samplingRate,
                        aggregationInterval: M.prop('weppyConfig').aggregationInterval
                    });
                    _super.call(this);
                }
                Perf.checkDependencies = function () {
                    return typeof Weppy === 'function';
                };
                Perf.prototype.track = function (params) {
                    var trackFn = this.tracker;
                    if (typeof params.module === 'string') {
                        trackFn = this.tracker.into(params.module);
                    }
                    // always set the current URL as part of the context
                    this.context.url = window.location.href.split('#')[0];
                    // update context in Weppy with new URL and any explicitly passed overrides for context
                    trackFn.setOptions({
                        context: $.extend(params.context, this.context)
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
                };
                return Perf;
            })(Trackers.BaseTracker);
            Trackers.Perf = Perf;
        })(Trackers = Modules.Trackers || (Modules.Trackers = {}));
    })(Modules = Mercury.Modules || (Mercury.Modules = {}));
})(Mercury || (Mercury = {}));

/// <reference path="../../baseline/mercury.d.ts" />
/// <reference path="../modules/Trackers/Perf.ts" />
'use strict';
/**
* @description Instantiates performance tracker
*/
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
            // Initializes Weppy context
            getInstance();
            Weppy.sendPagePerformance();
            // used for automation test
            M.prop('pagePerformanceSent', true);
        }
        Utils.sendPagePerformance = sendPagePerformance;
    })(Utils = Mercury.Utils || (Mercury.Utils = {}));
})(Mercury || (Mercury = {}));

/// <reference path="../../baseline/mercury.d.ts" />
/**
 * @define variantTesting
 *
 * Helper for variant testing using Optimizely
 */
'use strict';
var Mercury;
(function (Mercury) {
    var Utils;
    (function (Utils) {
        var VariantTesting;
        (function (VariantTesting) {
            /**
             * Activates all variant tests for the current page
             *
             * @returns {void}
             */
            function activate() {
                var optimizely = window.optimizely;
                if (optimizely) {
                    optimizely.push(['activate']);
                }
            }
            VariantTesting.activate = activate;
            /**
             * Tracks an event by name
             *
             * @param {string} eventName
             * @returns {void}
             */
            function trackEvent(eventName) {
                var optimizely = window.optimizely;
                if (optimizely) {
                    optimizely.push(['trackEvent', eventName]);
                }
            }
            VariantTesting.trackEvent = trackEvent;
            /**
             * Integrates Optimizely with Universal Analytics
             *
             * @param {[]} dimensions
             * @returns {[]}
             */
            function integrateOptimizelyWithUA(dimensions) {
                var optimizely = window.optimizely, activeExperiments = this.getActiveExperimentsList(), dimension, experimentName, variationName;
                if (activeExperiments) {
                    activeExperiments.forEach(function (experimentId) {
                        if (optimizely.allExperiments.hasOwnProperty(experimentId) && typeof optimizely.allExperiments[experimentId].universal_analytics === 'object') {
                            dimension = optimizely.allExperiments[experimentId].universal_analytics.slot;
                            experimentName = optimizely.allExperiments[experimentId].name;
                            variationName = optimizely.variationNamesMap[experimentId];
                            dimensions[dimension] = "Optimizely " + experimentName + " (" + experimentId + "): " + variationName;
                        }
                    });
                }
                return dimensions;
            }
            VariantTesting.integrateOptimizelyWithUA = integrateOptimizelyWithUA;
            /**
             * Get list of Optimizely active experiments
             *
             * @returns {[]}
             */
            function getActiveExperimentsList() {
                var optimizely = window.optimizely;
                return (optimizely && optimizely.activeExperiments) ? optimizely.activeExperiments : null;
            }
            VariantTesting.getActiveExperimentsList = getActiveExperimentsList;
            /**
             * Get number of the Optimizely experiment variation the user is running for given experiment ID
             *
             * @param {string} experimentId
             * @returns {number}
             */
            function getExperimentVariationNumberBySingleId(experimentId) {
                var optimizely = window.optimizely;
                return (optimizely && optimizely.variationMap && typeof optimizely.variationMap[experimentId] === 'number') ? optimizely.variationMap[experimentId] : null;
            }
            VariantTesting.getExperimentVariationNumberBySingleId = getExperimentVariationNumberBySingleId;
            /**
             * Get Optimizely experiment ID based on environment the app is running on
             *
             * @param {object} experimentIds contains experimentIdProd and experimentIdDev
             * @returns {string} experimentId
             */
            function getExperimentIdForThisEnvironment(experimentIds) {
                var environment = M.prop('environment');
                switch (environment) {
                    case 'prod':
                        return experimentIds.prod;
                    case 'dev':
                    case 'sandbox':
                        return experimentIds.dev;
                    default:
                        return null;
                }
            }
            VariantTesting.getExperimentIdForThisEnvironment = getExperimentIdForThisEnvironment;
            /**
             * Get Optimizely variation number for given experiment ID based on environment the app is running on
             *
             * @param {OptimizelyExperimentIds} experimentIds
             * @returns {number}
             */
            function getExperimentVariationNumber(experimentIds) {
                var experimentIdForThisEnv = this.getExperimentIdForThisEnvironment(experimentIds), activeExperimentsList = this.getActiveExperimentsList();
                if (activeExperimentsList && activeExperimentsList.indexOf(experimentIdForThisEnv) !== -1) {
                    return this.getExperimentVariationNumberBySingleId(experimentIdForThisEnv);
                }
                return null;
            }
            VariantTesting.getExperimentVariationNumber = getExperimentVariationNumber;
        })(VariantTesting = Utils.VariantTesting || (Utils.VariantTesting = {}));
    })(Utils = Mercury.Utils || (Mercury.Utils = {}));
})(Mercury || (Mercury = {}));

/// <reference path="./BaseTracker.ts" />
'use strict';
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Mercury;
(function (Mercury) {
    var Modules;
    (function (Modules) {
        var Trackers;
        (function (Trackers) {
            var Comscore = (function (_super) {
                __extends(Comscore, _super);
                function Comscore() {
                    window._comscore = window._comscore || [];
                    _super.call(this);
                }
                Comscore.prototype.url = function () {
                    return (document.location.protocol == "https:" ? "https://sb" : "http://b") + ".scorecardresearch.com/beacon.js?" + Math.random();
                };
                Comscore.prototype.trackPageView = function () {
                    var comscore = M.prop('tracking.comscore'), id = comscore.id, c7Value = comscore.c7Value;
                    window._comscore.push({
                        c1: '2',
                        c2: id,
                        options: {
                            url_append: comscore.keyword + '=' + c7Value
                        }
                    });
                    this.appendScript();
                };
                return Comscore;
            })(Trackers.BaseTracker);
            Trackers.Comscore = Comscore;
        })(Trackers = Modules.Trackers || (Modules.Trackers = {}));
    })(Modules = Mercury.Modules || (Mercury.Modules = {}));
})(Mercury || (Mercury = {}));

/// <reference path="./BaseTracker.ts" />
'use strict';
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Mercury;
(function (Mercury) {
    var Modules;
    (function (Modules) {
        var Trackers;
        (function (Trackers) {
            var Quantserve = (function (_super) {
                __extends(Quantserve, _super);
                function Quantserve() {
                    window._qevents = [];
                    _super.call(this);
                    this.usesAdsContext = true;
                }
                Quantserve.prototype.url = function () {
                    return (document.location.protocol == "https:" ? "https://secure" : "http://edge") + ".quantserve.com/quant.js?" + Math.random();
                };
                Quantserve.prototype.trackPageView = function () {
                    var quantcastLabels = ['Category.MobileWeb.Mercury'];
                    if (Mercury.wiki.vertical) {
                        quantcastLabels.unshift(Mercury.wiki.vertical);
                    }
                    //without this quantserve does not want to track 2+ page view
                    window.__qc = null;
                    window._qevents = [{
                        qacct: M.prop('tracking.quantserve'),
                        labels: quantcastLabels.join(',')
                    }];
                    this.appendScript();
                };
                return Quantserve;
            })(Trackers.BaseTracker);
            Trackers.Quantserve = Quantserve;
        })(Trackers = Modules.Trackers || (Modules.Trackers = {}));
    })(Modules = Mercury.Modules || (Mercury.Modules = {}));
})(Mercury || (Mercury = {}));

/// <reference path="../../../../typings/jquery/jquery.d.ts" />
/// <reference path="../../../baseline/mercury.d.ts" />
/// <reference path="../../utils/calculation.ts" />
/// <reference path="./Base.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Mercury;
(function (Mercury) {
    var Modules;
    (function (Modules) {
        var VideoPlayers;
        (function (VideoPlayers) {
            var OoyalaPlayer = (function (_super) {
                __extends(OoyalaPlayer, _super);
                function OoyalaPlayer(provider, params) {
                    _super.call(this, provider, params);
                    // a bit ambiguous based on legacy return, but the first file is the
                    // Ooyala embedded API, the second is AgeGate
                    this.resourceURI = this.params.jsFile[0];
                    // Ooyala JSON payload contains a DOM id
                    this.containerId = this.createUniqueId(this.params.playerId);
                    this.started = false;
                    this.ended = false;
                    this.containerSelector = '#' + this.containerId;
                    this.setupPlayer();
                }
                OoyalaPlayer.prototype.setupPlayer = function () {
                    var _this = this;
                    this.params = $.extend(this.params, {
                        onCreate: function () {
                            return _this.onCreate.apply(_this, arguments);
                        }
                    });
                    if (!window.OO) {
                        this.loadPlayer();
                    }
                    else {
                        this.createPlayer();
                    }
                };
                OoyalaPlayer.prototype.createPlayer = function () {
                    window.OO.Player.create(this.containerId, this.params.videoId, this.params);
                };
                OoyalaPlayer.prototype.playerDidLoad = function () {
                    this.createPlayer();
                };
                OoyalaPlayer.prototype.onCreate = function (player) {
                    var _this = this;
                    var messageBus = player.mb;
                    // Player has loaded
                    messageBus.subscribe(window.OO.EVENTS.PLAYER_CREATED, 'tracking', function () {
                        _this.track('player-load');
                    });
                    // Actual content starts playing (past any ads or age-gates)
                    messageBus.subscribe(window.OO.EVENTS.PLAYING, 'tracking', function () {
                        if (!_this.started) {
                            _this.track('content-begin');
                            _this.started = true;
                        }
                    });
                    // Ad starts
                    messageBus.subscribe(window.OO.EVENTS.WILL_PLAY_ADS, 'tracking', function () {
                        _this.track('ad-start');
                    });
                    // Ad has been fully watched
                    messageBus.subscribe(window.OO.EVENTS.ADS_PLAYED, 'tracking', function () {
                        _this.track('ad-finish');
                    });
                };
                return OoyalaPlayer;
            })(VideoPlayers.BasePlayer);
            VideoPlayers.OoyalaPlayer = OoyalaPlayer;
        })(VideoPlayers = Modules.VideoPlayers || (Modules.VideoPlayers = {}));
    })(Modules = Mercury.Modules || (Mercury.Modules = {}));
})(Mercury || (Mercury = {}));

/// <reference path="../../../baseline/mercury.d.ts" />
/// <reference path="./Base.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Mercury;
(function (Mercury) {
    var Modules;
    (function (Modules) {
        var VideoPlayers;
        (function (VideoPlayers) {
            var YouTubePlayer = (function (_super) {
                __extends(YouTubePlayer, _super);
                function YouTubePlayer(provider, params) {
                    _super.call(this, provider, params);
                    this.resourceURI = 'https://www.youtube.com/iframe_api';
                    this.containerId = this.createUniqueId('youtubeVideoPlayer');
                    this.started = false;
                    this.ended = false;
                    this.bindPlayerEvents();
                }
                YouTubePlayer.prototype.bindPlayerEvents = function () {
                    var _this = this;
                    this.params.events = {
                        'onReady': function () {
                            return _this.onPlayerReady.apply(_this, arguments);
                        },
                        'onStateChange': function () {
                            return _this.onPlayerStateChange.apply(_this, arguments);
                        }
                    };
                    if (window.YT) {
                        this.createPlayer();
                    }
                    else {
                        window.onYouTubeIframeAPIReady = function () {
                            _this.createPlayer();
                        };
                        this.loadPlayer();
                    }
                };
                YouTubePlayer.prototype.createPlayer = function () {
                    this.player = new window.YT.Player(this.containerId, this.params);
                };
                YouTubePlayer.prototype.onPlayerReady = function () {
                    this.onResize();
                    this.track('player-loaded');
                };
                YouTubePlayer.prototype.onPlayerStateChange = function (event) {
                    if (!this.started && event.data === 1) {
                        this.track('content-begin');
                        this.started = true;
                    }
                    if (!this.ended && event.data === 0) {
                        this.track('content-end');
                        this.ended = true;
                    }
                };
                return YouTubePlayer;
            })(VideoPlayers.BasePlayer);
            VideoPlayers.YouTubePlayer = YouTubePlayer;
        })(VideoPlayers = Modules.VideoPlayers || (Modules.VideoPlayers = {}));
    })(Modules = Mercury.Modules || (Mercury.Modules = {}));
})(Mercury || (Mercury = {}));
