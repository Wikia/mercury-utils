/// <reference path='../../mercury.ts' />
/// <reference path="../../mercury.d.ts" />
var Mercury;
(function (Mercury) {
    var Utils;
    (function (Utils) {
        function buildUrl(urlParams = {}, context = window) {
            var mediawikiDomain = M.prop('mediawikiDomain'), host = context.location.host, url;
            if (!urlParams.protocol) {
                urlParams.protocol = 'http';
            }
            url = urlParams.protocol + '://';
            if (urlParams.wiki) {
                url += Mercury.Utils.replaceWikiInHost(host, urlParams.wiki);
            }
            else {
                if (typeof mediawikiDomain !== 'undefined') {
                    url += mediawikiDomain;
                }
                else {
                    url += host;
                }
            }
            if (urlParams.title) {
                url += Mercury.wiki.articlePath + (urlParams.namespace ? urlParams.namespace + ':' : '') + urlParams.title;
            }
            if (urlParams.path) {
                url += urlParams.path;
            }
            if (urlParams.query) {
                url += '?';
                url += Object.keys(urlParams.query).map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(urlParams.query[key])}`).join('&');
            }
            return url;
        }
        Utils.buildUrl = buildUrl;
        function replaceWikiInHost(host, wiki) {
            var match;
            if ((match = host.match(/^(sandbox-.+?|preview|verify)\.(.+?)\.wikia\.com($|\/|:)/)) !== null) {
                host = host.replace(match[1] + '.' + match[2], match[1] + '.' + wiki);
            }
            else if ((match = host.match(/^(.+?)\.wikia\.com($|\/|:)/)) !== null) {
                host = host.replace(match[1] + '.wikia.com', wiki + '.wikia.com');
            }
            else if ((match = host.match(/^(.+)\.(.+?)\.wikia-dev.\w{2,3}($|\/|:)/)) !== null) {
                host = host.replace(match[1] + '.' + match[2], wiki + '.' + match[2]);
            }
            else if ((match = host.match(/^(.+)\.(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\.xip\.io($|\/|:)/)) !== null) {
                host = host.replace(match[1] + '.' + match[2] + '.xip.io', wiki + '.' + match[2] + '.xip.io');
            }
            return host;
        }
        Utils.replaceWikiInHost = replaceWikiInHost;
    })(Utils = Mercury.Utils || (Mercury.Utils = {}));
})(Mercury || (Mercury = {}));
