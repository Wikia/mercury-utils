/// <reference path="../../baseline/mercury.d.ts" />
'use strict';
var Mercury;
(function (Mercury) {
    var Utils;
    (function (Utils) {
        function getLinkInfo(basePath, title, hash, uri) {
            var localPathMatch = uri.match('^' + window.location.origin + '(.*)$');
            if (localPathMatch) {
                var local = localPathMatch[1], namespaces = Mercury.wiki.namespaces;
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
                    var regex = '^(\/wiki)?\/' + namespaces[ns] + ':.*$';
                    if (local.match(regex)) {
                        return {
                            article: null,
                            url: basePath + local
                        };
                    }
                }
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
