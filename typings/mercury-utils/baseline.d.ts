/// <reference path="../../typings/jquery/jquery.d.ts" />

declare var $: JQueryStatic;
declare var require: (deps: string[], func: Function) => void;

declare module Mercury {
	var article: any;
	var error: any;
	var wiki: any;
	var apiBase: string;
	var tracking: any;
	var adsUrl: string;
	var curatedContent: {
		items: any;
		offset?: string;
	}
}

declare var M: typeof Mercury.Utils;

interface Location {
	origin: string;
}