/// <reference path="../../baseline/mercury.d.ts" />
'use strict';
var Mercury;
(function (Mercury) {
    var Utils;
    (function (Utils) {
        var VariantTesting;
        (function (VariantTesting) {
            function activate() {
                var optimizely = window.optimizely;
                if (optimizely) {
                    optimizely.push(['activate']);
                }
            }
            VariantTesting.activate = activate;
            function trackEvent(eventName) {
                var optimizely = window.optimizely;
                if (optimizely) {
                    optimizely.push(['trackEvent', eventName]);
                }
            }
            VariantTesting.trackEvent = trackEvent;
            function integrateOptimizelyWithUA(dimensions) {
                var optimizely = window.optimizely, activeExperiments = this.getActiveExperimentsList(), dimension, experimentName, variationName;
                if (activeExperiments) {
                    activeExperiments.forEach((experimentId) => {
                        if (optimizely.allExperiments.hasOwnProperty(experimentId) &&
                            typeof optimizely.allExperiments[experimentId].universal_analytics === 'object') {
                            dimension = optimizely.allExperiments[experimentId].universal_analytics.slot;
                            experimentName = optimizely.allExperiments[experimentId].name;
                            variationName = optimizely.variationNamesMap[experimentId];
                            dimensions[dimension] = `Optimizely ${experimentName} (${experimentId}): ${variationName}`;
                        }
                    });
                }
                return dimensions;
            }
            VariantTesting.integrateOptimizelyWithUA = integrateOptimizelyWithUA;
            function getActiveExperimentsList() {
                var optimizely = window.optimizely;
                return (optimizely && optimizely.activeExperiments) ? optimizely.activeExperiments : null;
            }
            VariantTesting.getActiveExperimentsList = getActiveExperimentsList;
            function getExperimentVariationNumberBySingleId(experimentId) {
                var optimizely = window.optimizely;
                return (optimizely && optimizely.variationMap && typeof optimizely.variationMap[experimentId] === 'number') ?
                    optimizely.variationMap[experimentId] : null;
            }
            VariantTesting.getExperimentVariationNumberBySingleId = getExperimentVariationNumberBySingleId;
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
