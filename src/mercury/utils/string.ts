/// <reference path="../../../typings/mercury-utils/baseline.d.ts" />
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
