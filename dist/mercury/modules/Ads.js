/// <reference path='../../../../typings/jquery/jquery.d.ts' />
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
        class Ads {
            constructor() {
                this.adSlots = [];
                this.adsContext = null;
                this.currentAdsContext = null;
                this.isLoaded = false;
            }
            static getInstance() {
                if (Ads.instance === null) {
                    Ads.instance = new Mercury.Modules.Ads();
                }
                return Ads.instance;
            }
            init(adsUrl) {
                window.gaTrackAdEvent = this.gaTrackAdEvent;
                M.load(adsUrl, () => {
                    if (require) {
                        require([
                            'ext.wikia.adEngine.adEngine',
                            'ext.wikia.adEngine.adContext',
                            'ext.wikia.adEngine.config.mobile',
                            'ext.wikia.adEngine.adLogicPageViewCounter',
                            'wikia.krux'
                        ], (adEngineModule, adContextModule, adConfigMobile, adLogicPageViewCounterModule, krux) => {
                            this.adEngineModule = adEngineModule;
                            this.adContextModule = adContextModule;
                            this.adConfigMobile = adConfigMobile;
                            this.adLogicPageViewCounterModule = adLogicPageViewCounterModule;
                            window.Krux = krux || [];
                            this.isLoaded = true;
                            this.reloadWhenReady();
                            this.kruxTrackFirstPage();
                        });
                    }
                    else {
                        console.error('Looks like ads asset has not been loaded');
                    }
                });
            }
            gaTrackAdEvent() {
                var adHitSample = 1, GATracker;
                if (Math.random() * 100 <= adHitSample) {
                    GATracker = new Mercury.Modules.Trackers.UniversalAnalytics();
                    GATracker.trackAds.apply(GATracker, arguments);
                }
            }
            kruxTrackFirstPage() {
                var KruxTracker = new Mercury.Modules.Trackers.Krux();
                KruxTracker.trackPageView();
            }
            setContext(adsContext) {
                this.adsContext = adsContext ? adsContext : null;
            }
            reload(adsContext) {
                this.setContext(adsContext);
                this.currentAdsContext = adsContext;
                if (this.isLoaded && adsContext) {
                    this.adContextModule.setContext(adsContext);
                    this.adLogicPageViewCounterModule.increment();
                    this.adEngineModule.run(this.adConfigMobile, this.getSlots(), 'queue.mercury');
                }
            }
            reloadWhenReady() {
                this.reload(this.currentAdsContext);
            }
            getSlots() {
                return $.extend([], this.adSlots);
            }
            addSlot(name) {
                return this.adSlots.push([name]);
            }
            removeSlot(name) {
                this.adSlots = $.grep(this.adSlots, (slot) => {
                    return slot[0] && slot[0] === name;
                }, true);
            }
            openLightbox(contents) {
            }
            getContext() {
                return this.adsContext;
            }
        }
        Ads.instance = null;
        Modules.Ads = Ads;
    })(Modules = Mercury.Modules || (Mercury.Modules = {}));
})(Mercury || (Mercury = {}));
