/// <reference path="../../baseline/mercury.d.ts" />
var Mercury;
(function (Mercury) {
    var Utils;
    (function (Utils) {
        var DateTime;
        (function (DateTime) {
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
            function timeAgo(from, to = new Date()) {
                var timeDiff = Math.floor((to.getTime() - from.getTime()) / 1000);
                if (timeDiff == 0) {
                    return {
                        type: Interval.Now,
                        value: 0
                    };
                }
                if (timeDiff < 60) {
                    return {
                        type: Interval.Second,
                        value: timeDiff
                    };
                }
                timeDiff = Math.floor(timeDiff / 60);
                if (timeDiff < 60) {
                    return {
                        type: Interval.Minute,
                        value: timeDiff
                    };
                }
                timeDiff = Math.floor(timeDiff / 60);
                if (timeDiff < 24) {
                    return {
                        type: Interval.Hour,
                        value: timeDiff
                    };
                }
                timeDiff = Math.floor(timeDiff / 24);
                if (timeDiff < 30) {
                    return {
                        type: Interval.Day,
                        value: timeDiff
                    };
                }
                timeDiff = Math.floor(timeDiff / 30);
                if (timeDiff < 12) {
                    return {
                        type: Interval.Month,
                        value: timeDiff
                    };
                }
                timeDiff = Math.floor(timeDiff / 12);
                return {
                    type: Interval.Year,
                    value: timeDiff
                };
            }
            DateTime.timeAgo = timeAgo;
        })(DateTime = Utils.DateTime || (Utils.DateTime = {}));
    })(Utils = Mercury.Utils || (Mercury.Utils = {}));
})(Mercury || (Mercury = {}));
