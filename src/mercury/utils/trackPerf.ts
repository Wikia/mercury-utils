/// <reference path="../../../typings/mercury-utils/baseline.d.ts" />
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
		// used for automation test
		M.prop('pagePerformanceSent', true);
	}
}
