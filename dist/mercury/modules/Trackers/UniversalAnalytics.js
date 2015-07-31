/// <reference path="../../../../../typings/google.analytics/ga.d.ts" />
/// <reference path="../../../baseline/mercury.ts" />
/// <reference path="../../../baseline/mercury.d.ts" />
var Mercury;
(function (Mercury) {
    var Modules;
    (function (Modules) {
        var Trackers;
        (function (Trackers) {
            class UniversalAnalytics {
                constructor(isSpecialWiki = false) {
                    this.tracked = [];
                    this.accountPrimary = 'primary';
                    this.accountSpecial = 'special';
                    this.accountAds = 'ads';
                    if (!UniversalAnalytics.dimensions.length) {
                        throw new Error('Cannot instantiate UA tracker: please provide dimensions using UniversalAnalytics#setDimensions');
                    }
                    var domain = [
                        'wikia.com', 'ffxiclopedia.org', 'jedipedia.de',
                        'marveldatabase.com', 'memory-alpha.org', 'uncyclopedia.org',
                        'websitewiki.de', 'wowwiki.com', 'yoyowiki.org'
                    ].filter((domain) => document.location.hostname.indexOf(domain) > -1)[0];
                    this.accounts = M.prop('tracking.ua');
                    this.initAccount(this.accountPrimary, domain);
                    this.initAccount(this.accountAds, domain);
                    if (isSpecialWiki) {
                        this.initAccount(this.accountSpecial, domain);
                    }
                }
                static setDimensions(dimensions, overwrite) {
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
                }
                getDimension(idx) {
                    var dimension = UniversalAnalytics.dimensions[idx];
                    return typeof dimension === 'function' ? dimension() : dimension;
                }
                initAccount(trackerName, domain) {
                    var options, prefix, dimensionNum;
                    options = {
                        name: '',
                        allowLinker: true,
                        sampleRate: this.accounts[trackerName].sampleRate
                    };
                    prefix = '';
                    if (trackerName !== this.accountPrimary) {
                        prefix = this.accounts[trackerName].prefix + '.';
                    }
                    if (trackerName !== this.accountPrimary) {
                        options.name = this.accounts[trackerName].prefix;
                    }
                    ga('create', this.accounts[trackerName].id, 'auto', options);
                    ga(prefix + 'require', 'linker');
                    if (domain) {
                        ga(prefix + 'linker:autoLink', domain);
                    }
                    UniversalAnalytics.dimensions.forEach((dimension, idx) => ga(`${prefix}set`, `dimension${idx}`, this.getDimension(idx)));
                    this.tracked.push(this.accounts[trackerName]);
                }
                track(category, action, label, value, nonInteractive) {
                    ga('send', {
                        hitType: 'event',
                        eventCategory: category,
                        eventAction: action,
                        eventLabel: label,
                        eventValue: value,
                        nonInteraction: nonInteractive
                    });
                }
                trackAds(category, action, label, value, nonInteractive) {
                    ga(this.accounts[this.accountAds].prefix + '.send', {
                        hitType: 'event',
                        eventCategory: category,
                        eventAction: action,
                        eventLabel: label,
                        eventValue: value,
                        nonInteraction: nonInteractive
                    });
                }
                trackPageView() {
                    var pageType = this.getDimension(8);
                    if (!pageType) {
                        throw new Error('missing page type dimension (#8)');
                    }
                    this.tracked.forEach((account) => {
                        var prefix = account.prefix ? account.prefix + '.' : '';
                        ga(`${prefix}set`, 'dimension8', pageType, 3);
                        ga(`${prefix}send`, 'pageview');
                    });
                }
            }
            UniversalAnalytics.dimensions = [];
            Trackers.UniversalAnalytics = UniversalAnalytics;
        })(Trackers = Modules.Trackers || (Modules.Trackers = {}));
    })(Modules = Mercury.Modules || (Mercury.Modules = {}));
})(Mercury || (Mercury = {}));
