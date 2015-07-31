/// <reference path='../../../../typings/jquery/jquery.d.ts' />
/// <reference path='../../baseline/mercury.d.ts' />
/// <reference path='./Trackers/Krux.ts' />
/// <reference path='./Trackers/UniversalAnalytics.ts' />
/// <reference path='../../baseline/mercury.ts' />
/// <reference path='../utils/load.ts' />

'use strict';

interface Window {
	gaTrackAdEvent: any;
}

module Mercury.Modules {

	export class Ads {
		private static instance: Mercury.Modules.Ads = null;
		private adSlots: string[][] = [];
		private adsContext: any = null;
		private adEngineModule: any;
		private adContextModule: any;
		private adConfigMobile: any;
		private adLogicPageViewCounterModule: {
			get (): number;
			increment (): number;
		};
		private currentAdsContext: any = null;
		private isLoaded = false;

		/**
		 * Returns instance of Ads object
		 * @returns {Mercury.Modules.Ads}
		 */
		public static getInstance (): Mercury.Modules.Ads {
			if (Ads.instance === null) {
				Ads.instance = new Mercury.Modules.Ads();
			}
			return Ads.instance;
		}

		/**
		 * Initializes the Ad module
		 *
		 * @param adsUrl Url for the ads script
		 */
		public init (adsUrl: string): void {
			//Required by ads tracking code
			window.gaTrackAdEvent = this.gaTrackAdEvent;
			// Load the ads code from MW
			M.load(adsUrl, () => {
				if (require) {
					require([
						'ext.wikia.adEngine.adEngine',
						'ext.wikia.adEngine.adContext',
						'ext.wikia.adEngine.config.mobile',
						'ext.wikia.adEngine.adLogicPageViewCounter',
						'wikia.krux'
					], (
						adEngineModule: any,
						adContextModule: any,
						adConfigMobile: any,
						adLogicPageViewCounterModule: any,
						krux: any
					) => {
						this.adEngineModule = adEngineModule;
						this.adContextModule = adContextModule;
						this.adConfigMobile = adConfigMobile;
						this.adLogicPageViewCounterModule = adLogicPageViewCounterModule;
						window.Krux = krux || [];
						this.isLoaded = true;
						this.reloadWhenReady();
						this.kruxTrackFirstPage();
					});
				} else {
					console.error('Looks like ads asset has not been loaded');
				}
			});
		}

		/**
		 * Method for sampling and pushing ads-related events
		 * @arguments coming from ads tracking request
		 * It's called by track() method in wikia.tracker fetched from app by ads code
		 */
		public gaTrackAdEvent (): void {
			var adHitSample: number = 1, //Percentage of all the track requests to go through
				GATracker: Mercury.Modules.Trackers.UniversalAnalytics;
			//Sampling on GA side will kill the performance as we need to allocate object each time we track
			//ToDo: Optimize object allocation for tracking all events
			if (Math.random() * 100 <= adHitSample) {
				GATracker = new Mercury.Modules.Trackers.UniversalAnalytics();
				GATracker.trackAds.apply(GATracker, arguments);
			}
		}

		/**
		 * Function fired when Krux is ready (see init()).
		 * Calls the trackPageView() function on Krux instance.
		 * load() in krux.js (/app) automatically detect that
		 * there is a first page load (needs to load Krux scripts).
		 */
		private kruxTrackFirstPage (): void {
			var KruxTracker = new Mercury.Modules.Trackers.Krux();
			KruxTracker.trackPageView();
		}

		private setContext (adsContext: any): void {
			this.adsContext = adsContext ? adsContext : null;
		}

		/**
		 * Reloads the ads with the provided adsContext
		 * @param adsContext
		 */
		public reload (adsContext: any): void {
			// Store the context for external reuse
			this.setContext(adsContext);
			this.currentAdsContext = adsContext;

			if (this.isLoaded && adsContext) {
				this.adContextModule.setContext(adsContext);
				this.adLogicPageViewCounterModule.increment();
				// We need a copy of adSlots as .run destroys it
				this.adEngineModule.run(this.adConfigMobile, this.getSlots(), 'queue.mercury');
			}
		}

		/**
		 * This is callback that is run after script is loaded
		 */
		public reloadWhenReady (): void {
			this.reload(this.currentAdsContext);
		}

		/**
		 * Returns copy of adSlots
		 *
		 * @returns {string[][]}
		 */
		getSlots (): string[][] {
			return <string[][]>$.extend([], this.adSlots);
		}

		/**
		 * Adds ad slot
		 *
		 * @param name name of the slot
		 * @returns {number} index of the inserted slot
		 */
		public addSlot (name: string): number {
			return this.adSlots.push([name]);
		}

		/**
		 * Removes ad slot by name
		 *
		 * @param name Name of ths slot to remove
		 */
		public removeSlot (name:string): void {
			this.adSlots = $.grep(this.adSlots, (slot) => {
				return slot[0] && slot[0] === name;
			}, true);
		}

		public openLightbox (contents: any): void {
			/**
			 * This method is being overwritten in ApplicationRoute for ads needs.
			 * To learn more check ApplicationRoute.ts file.
			 */
		}

		/**
		 * Retrieves the ads context
		 *
		 * @returns {Object|null}
		 */
		getContext (): any {
			return this.adsContext;
		}
	}
}

/// <reference path="../../baseline/mercury.d.ts" />

'use strict';

interface Window {
	Vignette: any;
}

module Mercury.Modules {
	export var Thumbnailer = window.Vignette;
}

/// <reference path="../../baseline/mercury.d.ts" />
/// <reference path="./VideoPlayers/Base.ts" />
'use strict';

interface PlayerClassMap {
	[index: string]: string;
}

module Mercury.Modules {

	var playerClassMap: PlayerClassMap = {
		youtube: 'YouTube',
		ooyala: 'Ooyala'
	};

	export class VideoLoader {
		data: any;
		player: VideoPlayers.BasePlayer;

		constructor (data: any) {
			this.data = data;
			this.loadPlayerClass();
		}

		private isProvider (name: string): boolean {
			return !!this.data.provider.toLowerCase().match(name);
		}

		/**
		 * Loads player for the video, currently either OoyalaPlayer, YouTubePlayer or BasePlayer (default)
		 */
		loadPlayerClass () {
			var provider: string = this.getProviderName(),
				playerClassStr: string = (playerClassMap[provider] || 'Base') + 'Player',
				players: any = VideoPlayers,
				params: any = $.extend(this.data.jsParams, {
					size: {
						height: this.data.height,
						width: this.data.width
					}
				});

			this.player = new players[playerClassStr](provider, params);
			this.player.onResize();
		}

		getProviderName () {
			return this.isProvider('ooyala') ? 'ooyala' : this.data.provider;
		}

		onResize () {
			this.player.onResize();
		}
	}
}

/// <reference path="../../baseline/mercury.d.ts" />
/**
 * @define articlelink
 *
 * Library to parse links in an article and return information about how to process a given link.
 */
'use strict';

interface LinkInfo {
	article: string;
	url: string;
	hash?: string;
}

module Mercury.Utils {
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
	export function getLinkInfo(basePath: string, title: string, hash: string, uri: string): LinkInfo {
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
			var article = local.match(/^(\/(wiki))?\/([^#]+)(#.*)?$/),
				comparison: string;

			try {
				comparison = decodeURIComponent(article[3]);
			} catch (e) {
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
}

/// <reference path="../../baseline/mercury.d.ts" />

/**
 * @define browser
 */
'use strict';

module Mercury.Utils.Browser {
	/**
	 * Detects if user is using iOS or Android system
	 * @return {string}
	 */
	export function getSystem (): string {
		var ua: string = window.navigator.userAgent,
			system: string;

		if (ua.match(/iPad|iPhone|iPod/i) !== null) {
			system = 'ios';
		} else if (ua.match(/Android/i) !== null) {
			system = 'android';
		}
		return system;
	}
}

/// <reference path="../../baseline/mercury.d.ts" />

/**
 * @define calculation
 *
 * Library with generic calculation functions
 */
'use strict';

interface ContainerSize {
	width: number;
	height: number;
}

module Mercury.Utils.Calculation {
	/**
	 * Calculate container size based on max dimensions and aspect ratio of the content
	 *
	 * @param {number} maxWidth
	 * @param {number} maxHeight
	 * @param {number} contentWidth
	 * @param {number} contentHeight
	 * @return {ContainerSize}
	 */
	export function containerSize (
		maxWidth: number,
		maxHeight: number,
		contentWidth: number,
		contentHeight: number
		): ContainerSize {
		var targetSize: ContainerSize = {
			width: 0,
			height: 0
		};

		if (maxWidth < maxHeight) {
			targetSize.width = maxWidth;
			targetSize.height = Math.min(maxHeight, ~~(maxWidth * contentHeight / contentWidth));
		} else {
			targetSize.width = Math.min(maxWidth, ~~(maxHeight * contentWidth / contentHeight));
			targetSize.height = maxHeight;
		}

		return targetSize;
	}
}

/// <reference path="../../baseline/mercury.d.ts" />

interface TimeAgoResult {
	type: Mercury.Utils.DateTime.Interval
	value: number
}

/**
 * @desc Helper functions to deal with Date and time
 */
module Mercury.Utils.DateTime {

	/**
	 * Interval types
	 */
	export enum Interval {
		Now,
		Second,
		Minute,
		Hour,
		Day,
		Month,
		Year
	}

	/**
	 * Returns Interval type and value given two dates
	 *
	 * @param from Date in the past
	 * @param to Optional date in the future. Defaults to current date/time
	 * @returns TimeAgoResult
	 */
	export function timeAgo (from: Date, to: Date = new Date()): TimeAgoResult {
		var timeDiff = Math.floor((to.getTime() - from.getTime()) / 1000);

		if (timeDiff == 0) {
			return {
				type: Interval.Now,
				value: 0
			};
		}
		// seconds
		if (timeDiff < 60) {
			return {
				type: Interval.Second,
				value: timeDiff
			};
		}
		// minutes
		timeDiff = Math.floor(timeDiff / 60);
		if (timeDiff < 60) {
			return {
				type: Interval.Minute,
				value: timeDiff
			};
		}
		// hours
		timeDiff = Math.floor(timeDiff / 60);
		if (timeDiff < 24) {
			return {
				type: Interval.Hour,
				value: timeDiff
			}
		}
		// days
		timeDiff = Math.floor(timeDiff / 24);
		if (timeDiff < 30) {
			return {
				type: Interval.Day,
				value: timeDiff
			}
		}
		// months
		timeDiff = Math.floor(timeDiff / 30);
		if (timeDiff < 12) {
			return {
				type: Interval.Month,
				value: timeDiff
			}
		}
		// years
		timeDiff = Math.floor(timeDiff / 12);
		return {
			type: Interval.Year,
			value: timeDiff
		}
	}
}

/// <reference path="../../baseline/mercury.d.ts" />
'use strict';

declare var $script: Function;

/**
* @description This module is an alias for whatever script loader implementation
* we are using. Use this stub to normalize/expose the features available to Wikia
* developers and also to allow for swapping implementations in the future.
*/
module Mercury.Utils {
	export function load (...params: any[]) {
		return $script.apply(null, params);
	}
}

/// <reference path="../../baseline/mercury.d.ts" />
'use strict';

module Mercury.Utils.String {
	/**
	 * We need to support links like:
	 * /wiki/Rachel Berry
	 * /wiki/Rachel  Berry
	 * /wiki/Rachel__Berry
	 *
	 * but we want them to be displayed normalized in URL bar
	 */
	export function normalizeToUnderscore (title: string = ''): string {
		return title
			.replace(/\s/g, '_')
			.replace(/_+/g, '_');
	}

	export function normalizeToWhitespace (str: string = ''): string {
		return str
			.replace(/_/g, ' ')
			.replace(/\s+/g, ' ');
	}
}

/// <reference path="../../../../typings/ember/ember.d.ts" />
/// <reference path="../modules/Trackers/Internal.ts" />
/// <reference path="../modules/Trackers/UniversalAnalytics.ts" />

interface Window {
	ga: any;
	Mercury: any;
}

interface TrackContext {
	//article title
	a: string;
	//namespace
	n: number;
}

interface TrackingParams {
	action?: string;
	label?: string;
	value?: number;
	category: string;
	trackingMethod?: string;
	isNonInteractive?: boolean;
	[idx: string]: any;
}

interface TrackFunction {
	(params: TrackingParams): void;
	actions: any;
}

interface TrackerInstance {
	new(): TrackerInstance;
	track: TrackFunction;
	trackPageView: (context?: TrackContext) => void;
	usesAdsContext: boolean;
}

module Mercury.Utils {
	// These actions were ported over from legacy Wikia app code:
	// https://github.com/Wikia/app/blob/dev/resources/wikia/modules/tracker.stub.js
	// The property keys were modified to fit style rules
	var actions: any = {
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
		},
		context: TrackContext = {
			a: null,
			n: null
		};

	function pruneParams (params: TrackingParams) {
		delete params.action;
		delete params.label;
		delete params.value;
		delete params.category;
		delete params.isNonInteractive;
	}

	function isSpecialWiki () {
		try {
			return !!(M.prop('isGASpecialWiki') || Mercury.wiki.isGASpecialWiki);
		} catch (e) {
			// Property doesn't exist
			return false;
		}
	}

	export function track (params: TrackingParams): void {
		var trackingMethod: string = params.trackingMethod || 'both',
			action: string = params.action,
			category: string = params.category ? 'mercury-' + params.category : null,
			label: string = params.label || '',
			value: number = params.value || 0,
			isNonInteractive: boolean = params.isNonInteractive !== false,
			trackers = Mercury.Modules.Trackers,
			tracker: Mercury.Modules.Trackers.Internal,
			uaTracker: Mercury.Modules.Trackers.UniversalAnalytics;

		if (M.prop('queryParams.noexternals')) {
			return;
		}

		params = <TrackingParams>$.extend({
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
			params = <InternalTrackingParams>$.extend(context, params);
			tracker.track(<InternalTrackingParams>params);
		}
	}

	/**
	 * function for aggregating all page tracking that Wikia uses.
	 * To make trackPageView work with your tracker,
	 * make it a class in Mercury.Modules.Trackers and export one function 'trackPageView'
	 *
	 * trackPageView is called in ArticleView.onArticleChange
	 */
	export function trackPageView (adsContext: any) {
		var trackers: any = Mercury.Modules.Trackers;

		if (M.prop('queryParams.noexternals')) {
			return;
		}

		Object.keys(trackers).forEach(function (tracker: string) {
			var Tracker = trackers[tracker],
				instance: TrackerInstance;

			if (typeof Tracker.prototype.trackPageView === 'function') {
				instance = new Tracker(isSpecialWiki());
				console.info('Track pageView:', tracker);
				instance.trackPageView(instance.usesAdsContext ? adsContext : context);
			}
		});
	}

	export function setTrackContext(data: TrackContext) {
		context = data;
	}

	// Export actions so that they're accessible as M.trackActions
	export var trackActions = actions;
}

/// <reference path="../../baseline/mercury.d.ts" />
/// <reference path="../modules/Trackers/Perf.ts" />
'use strict';

/**
* @description Instantiates performance tracker
*/
module Mercury.Utils {
	var instance: Mercury.Modules.Trackers.Perf;
	function getInstance(): typeof instance {
		if (Mercury.Modules.Trackers.Perf.checkDependencies()) {
			instance = instance || new Mercury.Modules.Trackers.Perf();
			return instance;
		}
		throw new Error('no instance found');
	}

	export function trackPerf(obj: PerfTrackerParams): void {
		return getInstance().track(obj);
	}

	export function sendPagePerformance(): void {
		// Initializes Weppy context
		getInstance();
		Weppy.sendPagePerformance();
	}
}

/// <reference path="../../baseline/mercury.d.ts" />

/**
 * @define variantTesting
 *
 * Helper for variant testing using Optimizely
 */
'use strict';

interface Window {
	optimizely?: any;
}

interface OptimizelyExperimentIds {
	prod: string;
	dev: string;
}

module Mercury.Utils.VariantTesting {
	/**
	 * Activates all variant tests for the current page
	 *
	 * @returns {void}
	 */
	export function activate (): void {
		var optimizely = window.optimizely;
		if (optimizely) {
			optimizely.push(['activate']);
		}
	}

	/**
	 * Tracks an event by name
	 *
	 * @param {string} eventName
	 * @returns {void}
	 */
	export function trackEvent (eventName: string): void {
		var optimizely = window.optimizely;
		if (optimizely) {
			optimizely.push(['trackEvent', eventName]);
		}
	}

	/**
	 * Integrates Optimizely with Universal Analytics
	 *
	 * @param {[]} dimensions
	 * @returns {[]}
	 */
	export function integrateOptimizelyWithUA (dimensions: any[]): any[] {
		var optimizely = window.optimizely,
			activeExperiments = this.getActiveExperimentsList(),
			dimension: number,
			experimentName: string,
			variationName: string;

		if (activeExperiments) {
			activeExperiments.forEach((experimentId: string): void => {
				if (
					optimizely.allExperiments.hasOwnProperty(experimentId) &&
					typeof optimizely.allExperiments[experimentId].universal_analytics === 'object'
				) {
					dimension = optimizely.allExperiments[experimentId].universal_analytics.slot;
					experimentName = optimizely.allExperiments[experimentId].name;
					variationName = optimizely.variationNamesMap[experimentId];

					dimensions[dimension] = `Optimizely ${experimentName} (${experimentId}): ${variationName}`;
				}
			});
		}

		return dimensions;
	}

	/**
	 * Get list of Optimizely active experiments
	 *
	 * @returns {[]}
	 */
	export function getActiveExperimentsList (): string[] {
		var optimizely = window.optimizely;

		return (optimizely && optimizely.activeExperiments) ? optimizely.activeExperiments : null;
	}

	/**
	 * Get number of the Optimizely experiment variation the user is running for given experiment ID
	 *
	 * @param {string} experimentId
	 * @returns {number}
	 */
	export function getExperimentVariationNumberBySingleId (experimentId: string): number {
		var optimizely = window.optimizely;

		return (optimizely && optimizely.variationMap && typeof optimizely.variationMap[experimentId] === 'number') ?
			optimizely.variationMap[experimentId] : null;
	}

	/**
	 * Get Optimizely experiment ID based on environment the app is running on
	 *
	 * @param {object} experimentIds contains experimentIdProd and experimentIdDev
	 * @returns {string} experimentId
	 */
	export function getExperimentIdForThisEnvironment (experimentIds: OptimizelyExperimentIds): string {
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

	/**
	 * Get Optimizely variation number for given experiment ID based on environment the app is running on
	 *
	 * @param {OptimizelyExperimentIds} experimentIds
	 * @returns {number}
	 */
	export function getExperimentVariationNumber (experimentIds: OptimizelyExperimentIds): number {
		var experimentIdForThisEnv = this.getExperimentIdForThisEnvironment(experimentIds),
			activeExperimentsList = this.getActiveExperimentsList();

		if (activeExperimentsList && activeExperimentsList.indexOf(experimentIdForThisEnv) !== -1) {
			return this.getExperimentVariationNumberBySingleId(experimentIdForThisEnv);
		}

		return null;
	}
}

/// <reference path="../../../baseline/mercury.d.ts" />
'use strict';

/**
 * Base class for trackers that have to append their scripts like Comscore or Quantserve
 */
module Mercury.Modules.Trackers {
	export class BaseTracker {
		static script: HTMLScriptElement = document.getElementsByTagName('script')[0];
		usesAdsContext: boolean = false;

		//This method should overridden implemented by a tracker
		url (): string {
			return '';
		}

		appendScript (): void {
			var elem: HTMLScriptElement = document.createElement('script');

			elem.async = true;
			elem.src = this.url();

			BaseTracker.script.parentNode.insertBefore(elem, BaseTracker.script);
		}
	}
}

/// <reference path="./BaseTracker.ts" />
'use strict';

interface Window {
	_comscore: any[];
}

module Mercury.Modules.Trackers {
	export class Comscore extends BaseTracker {
		constructor () {
			window._comscore = window._comscore || [];
			super();
		}

		url (): string {
			return (document.location.protocol == "https:" ? "https://sb" : "http://b") + ".scorecardresearch.com/beacon.js?" + Math.random();
		}

		trackPageView (): void {
			var comscore = M.prop('tracking.comscore'),
				id: string =  comscore.id,
				c7Value: string = comscore.c7Value;

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
}

/// <reference path="../../../../../typings/jquery/jquery.d.ts" />
/// <reference path="../../utils/track.ts" />

interface InternalTrackingConfig {
	// TODO: These are legacy config values that are terse and very coupled with MW, lets see if we can't
	// deprecate these and use something a bit more appropriate
	// wgCityId
	c: Number;
	// wgDBname
	x: String;
	// wgContentLanguage
	lc: String;
	// trackID || wgTrackID || 0
	u: Number;
	// skin
	s: String;
	// beacon_id || ''
	beacon: String;
	// cachebuster
	cb: Number;
}

interface InternalTrackingParams extends TrackingParams {
	//category
	ga_category: string;
	// wgArticleId
	a: String;
	// wgNamespaceNumber
	n: Number;
}

module Mercury.Modules.Trackers {
	export class Internal {
		baseUrl: string = 'https://beacon.wikia-services.com/__track/';
		callbackTimeout: number = 200;
		success: Function;
		error: Function;
		head: HTMLElement;
		defaults: InternalTrackingConfig;

		constructor () {
			var config = Internal.getConfig();

			this.head = document.head || document.getElementsByTagName('head')[0];
			this.defaults = config;
		}

		static getConfig (): InternalTrackingConfig {
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

		static isPageView (category: string): boolean {
			return category.toLowerCase() === 'view';
		}

		private createRequestURL (category: string, params: any): string {
			var parts: string[] = [],
				paramStr: string,
				targetRoute = Internal.isPageView(category) ? 'view' : 'special/trackingevent',
				value: string;

			Object.keys(params).forEach((key: string) => {
				value = params[key];

				if (value != null) {
					paramStr = encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
					parts.push(paramStr);
				}
			});

			return this.baseUrl + targetRoute + '?' + parts.join('&');
		}

		private loadTrackingScript (url: string): void {
			var script = document.createElement('script');

			script.src = url;

			script.onload = script.onreadystatechange = (abort: any): void => {

				if (!abort || !!script.readyState || !/loaded|complete/.test(script.readyState)) {
					return;
				}

				// Handle memory leak in IE
				script.onload = script.onreadystatechange = null;

				// Remove the script
				if (this.head && script.parentNode) {
					this.head.removeChild(script);
				}

				// Dereference the script
				script = undefined;

				if (!abort && typeof this.success === 'function') {
					setTimeout(this.success, this.callbackTimeout);

				} else if (abort && typeof this.error === 'function') {
					setTimeout(this.error, this.callbackTimeout);
				}
			};

			this.head.insertBefore(script, this.head.firstChild);
		}

		track (params: InternalTrackingParams): void {
			var config = <InternalTrackingParams>$.extend(params, this.defaults);

			this.loadTrackingScript(
				this.createRequestURL(config.ga_category, config)
			);
		}

		/**
		 * alias to track a page view
		 */
		trackPageView (context: TrackContext): void {
			this.track(<InternalTrackingParams>$.extend({
				ga_category: 'view'
			}, context));
		}
	}
}

'use strict';

interface Window {
	Krux: {
		load?: (skinSiteId: string) => void;
	};
}

module Mercury.Modules.Trackers {
	export class Krux {

		constructor () {
			window.Krux = window.Krux || [];
		}

		/**
		* @desc Exports page params to Krux.
		* mobileId variable is the ID referencing to the mobile site
		* (see ads_run.js and krux.js in app repository)
		*/
		trackPageView (): void {
			if (typeof window.Krux.load === 'function') {
				window.Krux.load(M.prop('tracking.krux.mobileId'));
			}
		}
	}
}

/// <reference path="./BaseTracker.ts" />
/// <reference path="../../../../vendor/weppy/weppy.d.ts" />
/// <reference path="../../../baseline/mercury/utils/state.ts" />
'use strict';

interface PerfTrackerParams {
	type: string;
	context?: any;
	module?: string;
	name: string;
	value?: number;
	annotations?: any;
}

module Mercury.Modules.Trackers {
	export class Perf extends BaseTracker {

		public static checkDependencies () {
			return typeof Weppy === 'function';
		}

		tracker: any;
		defaultContext: {
			skin: string;
			url?: string;
			'user-agent': string;
			env: string;
			country: string;
		};

		constructor () {
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

		track (params: PerfTrackerParams): void {
			var trackFn = this.tracker;

			if (typeof params.module === 'string') {
				trackFn = this.tracker.into(params.module);
			}

			// always set the current URL as part of the context
			this.defaultContext.url = window.location.href.split('#')[0];

			// update context in Weppy with new URL and any explicitly passed overrides for context
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
}

/// <reference path="../../../../../typings/ember/ember.d.ts" />
/// <reference path="./BaseTracker.ts" />
'use strict';

interface Window {
	_qevents: any[];
	__qc: any;
}

module Mercury.Modules.Trackers {
	export class Quantserve extends BaseTracker {
		constructor () {
			window._qevents = [];
			super();
			this.usesAdsContext = true;
		}

		url (): string {
			return (document.location.protocol == "https:" ? "https://secure" : "http://edge") + ".quantserve.com/quant.js?" + Math.random();
		}

		trackPageView (): void {
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
		}
	}
}

/// <reference path="../../../../../typings/google.analytics/ga.d.ts" />
/// <reference path="../../../baseline/mercury.ts" />
/// <reference path="../../../baseline/mercury.d.ts" />

interface TrackerOptions {
	name: string;
	allowLinker: boolean;
	sampleRate: number;
}

module Mercury.Modules.Trackers {
	export class UniversalAnalytics {
		static dimensions: (string|Function)[] = [];
		tracked: GAAccount[] = [];
		accounts: GAAccountMap;
		accountPrimary = 'primary';
		accountSpecial = 'special';
		accountAds = 'ads';

		constructor (isSpecialWiki = false) {
			if (!UniversalAnalytics.dimensions.length) {
				throw new Error(
					'Cannot instantiate UA tracker: please provide dimensions using UniversalAnalytics#setDimensions'
				);
			}

			// All domains that host content for Wikia
			// Use one of the domains below. If none matches, the tag will fall back to
			// the default which is 'auto', probably good enough in edge cases.
			var domain: string = [
					'wikia.com', 'ffxiclopedia.org', 'jedipedia.de',
					'marveldatabase.com', 'memory-alpha.org', 'uncyclopedia.org',
					'websitewiki.de', 'wowwiki.com', 'yoyowiki.org'
				].filter((domain: string) => document.location.hostname.indexOf(domain) > -1)[0];

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
		public static setDimensions (dimensions: typeof UniversalAnalytics.dimensions, overwrite?: boolean): boolean {
			if (!dimensions.length) {
				return false;
			}

			if (overwrite) {
				this.dimensions = dimensions;
			} else {
				$.extend(this.dimensions, dimensions);
			}

			return true;
		}

		/**
		 * @private
		 * @param {number} index of dimension
		 * @description Retrieves string value or invokes function for value
		 * @returns {string}
		 */
		private getDimension (idx: number): string {
			var dimension = UniversalAnalytics.dimensions[idx];
			return typeof dimension === 'function' ? dimension() : dimension;
		}

		/**
		 * Initialize an additional account or property
		 *
		 * @param {string} name The name of the account as specified in localSettings
		 * @param {string} domain
		 */
		initAccount (trackerName: string, domain: string): void {
			var options: TrackerOptions, prefix: string,
				dimensionNum: string;

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

			UniversalAnalytics.dimensions.forEach((dimension: string|Function, idx: number) =>
				ga(`${prefix}set`, `dimension${idx}`, this.getDimension(idx)));

			this.tracked.push(this.accounts[trackerName]);
		}

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
		track (category: string, action: string, label: string, value: number, nonInteractive: boolean): void {
			ga(
				'send',
				{
					hitType: 'event',
					eventCategory: category,
					eventAction: action,
					eventLabel: label,
					eventValue: value,
					nonInteraction: nonInteractive
				}
			);
		}

		/**
		 * Tracks an ads-related event
		 * @see {@link https://developers.google.com/analytics/devguides/collection/analyticsjs/method-reference}
		 * @param {string} category Event category.
		 * @param {string} action Event action.
		 * @param {string} label Event label.
		 * @param {number} value Event value. Has to be an integer.
		 * @param {boolean} nonInteractive Whether event is non-interactive.
		 */
		trackAds (category: string, action: string, label: string, value: number, nonInteractive: boolean): void {
			ga(
				this.accounts[this.accountAds].prefix + '.send',
				{
					hitType: 'event',
					eventCategory: category,
					eventAction: action,
					eventLabel: label,
					eventValue: value,
					nonInteraction: nonInteractive
				}
			);
		}

		/**
		 * Tracks the current page view
		 */
		trackPageView (): void {
			var pageType = this.getDimension(8);

			if (!pageType) {
				throw new Error('missing page type dimension (#8)');
			}

			this.tracked.forEach((account: GAAccount) => {
				var prefix = account.prefix ? account.prefix + '.' : '';
				ga(`${prefix}set`, 'dimension8', pageType, 3);
				ga(`${prefix}send`, 'pageview');
			});
		}
	}
}

/// <reference path="../../../baseline/mercury.d.ts" />
/// <reference path="../../utils/track.ts" />
/// <reference path="../../utils/load.ts" />
/// <reference path="../../utils/calculation.ts" />

module Mercury.Modules.VideoPlayers {
	export class BasePlayer {
		player: any;
		params: any;
		id: string;
		provider: string;
		resourceURI: string;
		//Most common video container selector
		containerSelector: string = '.lightbox-content-inner > iframe';
		videoWidth: number;
		videoHeight: number;

		constructor (provider: string, params: any) {
			if (!provider) {
				throw new Error('VideoPlayer requires a provider as the first argument');
			}
			this.provider = provider;
			this.params = params;
			this.id = params.videoId;
			this.videoWidth = params.size.width;
			this.videoHeight = params.size.height;
		}

		loadPlayer () {
			return M.load(this.resourceURI, () => {
				// called once player is loaded
				this.playerDidLoad();
			});
		}

		/**
		 * Intentionally a no-op, documentation that this hook is implemented
		 * and to not error when called by loadPlayer*
		 */
		playerDidLoad (): void {}

		/**
		 * Sets CSS width and height for the video container.
		 * Container selector is can be overriden by the inheriting class
		 * @param {String} containerSelector - JQuery selector of the video container
		 */
		onResize (containerSelector: string = this.containerSelector): void {
			var $container: JQuery = $(containerSelector),
				$lightbox: JQuery = $('.lightbox-wrapper'),
				lightboxWidth: number = $lightbox.width(),
				lightboxHeight: number = $lightbox.height(),
				targetSize: ContainerSize,
				sanitizedSize: any;

			targetSize = Mercury.Utils.Calculation.containerSize(
				lightboxWidth,
				lightboxHeight,
				this.videoWidth,
				this.videoHeight
			);

			// sanitize as our backend sometimes returns size of 0x0
			if (targetSize.width > 0 && targetSize.height > 0) {
				sanitizedSize = {
					width: targetSize.width,
					height: targetSize.height
				};
			} else {
				sanitizedSize = {
					width: '100%',
					height: '100%'
				};
			}

			$container.css(sanitizedSize);
		}

		createUniqueId (id: string): string {
			var element = document.getElementById(id),
			    newId = id + new Date().getTime();

			if (element) {
				element.id = newId;
			}

			return newId;
		}

		track (event = ''): void {
			return M.track({
				action: event,
				label: this.provider,
				category: 'video-player-' + event
			});
		}

	}
}

/// <reference path="../../../../../typings/jquery/jquery.d.ts" />
/// <reference path="../../../baseline/mercury.d.ts" />
/// <reference path="../../utils/calculation.ts" />
/// <reference path="./Base.ts" />

interface Window {
	OO: {
		Player: {
			create: (
				 container: string,
				 videoId: string,
				 params: any
				 ) => void
		};
		EVENTS: any
	}
}

module Mercury.Modules.VideoPlayers {

	export class OoyalaPlayer extends BasePlayer {
		started: boolean;
		ended: boolean;
		containerSelector: string;

		// a bit ambiguous based on legacy return, but the first file is the
		// Ooyala embedded API, the second is AgeGate
		public resourceURI = this.params.jsFile[0];
		// Ooyala JSON payload contains a DOM id
		public containerId = this.createUniqueId(this.params.playerId);

		constructor (provider: string, params: any) {
			super(provider, params);
			this.started = false;
			this.ended = false;
			this.containerSelector = '#' + this.containerId;
			this.setupPlayer();
		}

		setupPlayer (): void {
			this.params = $.extend(this.params, {
				onCreate: () => { return this.onCreate.apply(this, arguments) }
			});

			if (!window.OO) {
				this.loadPlayer();
			} else {
				this.createPlayer();
			}
		}

		createPlayer (): void {
			window.OO.Player.create(this.containerId, this.params.videoId, this.params);
		}

		playerDidLoad (): void {
			this.createPlayer();
		}

		onCreate (player: any): void {
			var messageBus = player.mb;

			// Player has loaded
			messageBus.subscribe(window.OO.EVENTS.PLAYER_CREATED, 'tracking', () => {
				this.track('player-load');
			});

			// Actual content starts playing (past any ads or age-gates)
			messageBus.subscribe(window.OO.EVENTS.PLAYING, 'tracking', () => {
				if (!this.started) {
					this.track('content-begin');
					this.started = true;
				}
			});

			// Ad starts
			messageBus.subscribe(window.OO.EVENTS.WILL_PLAY_ADS, 'tracking', () => {
				this.track('ad-start');
			});

			// Ad has been fully watched
			messageBus.subscribe(window.OO.EVENTS.ADS_PLAYED, 'tracking', () => {
				this.track('ad-finish');
			});
		}
	}
}

/// <reference path="../../../baseline/mercury.d.ts" />
/// <reference path="./Base.ts" />

interface YouTubePlayer {
	new(id: string, params: any): any;
}

interface Window {
	YT: {
		Player: YouTubePlayer
	};
	onYouTubeIframeAPIReady: () => void;
}

interface YouTubeEvent {
	data: number;
	target: any;
}

module Mercury.Modules.VideoPlayers {
	export class YouTubePlayer extends BasePlayer {
		started: boolean;
		ended: boolean;

		constructor (provider: string, params: any) {
			super(provider, params);
			this.started = false;
			this.ended = false;
			this.bindPlayerEvents();
		}

		resourceURI = 'https://www.youtube.com/iframe_api';
		containerId = this.createUniqueId('youtubeVideoPlayer');

		bindPlayerEvents (): void {
			this.params.events = {
				'onReady': () => { return this.onPlayerReady.apply(this, arguments); },
				'onStateChange': () => { return this.onPlayerStateChange.apply(this, arguments); }
			};

			if (window.YT) {
				this.createPlayer();
			} else {
				window.onYouTubeIframeAPIReady = () => {
					this.createPlayer();
				};
				this.loadPlayer();
			}
		}

		createPlayer (): void {
			this.player = new window.YT.Player(this.containerId, this.params);
		}

		onPlayerReady (): void {
			this.onResize();
			this.track('player-loaded');
		}

		onPlayerStateChange (event: YouTubeEvent): void {
			if (!this.started && event.data === 1) {
				this.track('content-begin');
				this.started = true;
			}
			if (!this.ended && event.data === 0) {
				this.track('content-end');
				this.ended = true;
			}
		}
	}
}

