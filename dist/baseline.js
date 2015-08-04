'use strict';
document.documentElement.className += ' client-js';

var Mercury;
(function (Mercury) {
    var Utils;
    (function (Utils) {
        function isPrimitive(val) {
            var typeOf = typeof val;
            return (val === null) ||
                (typeOf === 'string') ||
                (typeOf === 'number') ||
                (typeOf === 'boolean') ||
                (typeOf === 'undefined');
        }
        Utils.isPrimitive = isPrimitive;
    })(Utils = Mercury.Utils || (Mercury.Utils = {}));
})(Mercury || (Mercury = {}));

var mw = {
    loader: {
        state: function () { }
    }
}, Wikia = Wikia || {};

/// <reference path='./isPrimitive.ts' />
/// <reference path='../../mercury.ts' />
/// <reference path='../../mw.ts' />
var Mercury;
(function (Mercury) {
    var Utils;
    (function (Utils) {
        function namespacer(str, ns, val, mutable) {
            var parts, i, properties;
            if (!str) {
                parts = [];
            }
            else {
                parts = str.split('.');
            }
            if (parts.length === 1 && !ns) {
                throw new Error('Uneccessary assignment, please specify more ' +
                    'items in arg1 or a namespace in arg2');
            }
            if (!ns) {
                ns = window;
            }
            if (typeof ns === 'string') {
                ns = window[ns] = window[ns] || {};
            }
            properties = {
                value: !mutable && !M.isPrimitive(val) ? Object.freeze(val) : val
            };
            if (mutable) {
                properties.configurable = true;
                properties.enumerable = true;
                properties.writable = true;
            }
            for (i = 0; i < parts.length; i++) {
                // if a obj is passed in and loop is assigning last variable in namespace
                if (i === parts.length - 1) {
                    Object.defineProperty(ns, parts[i], properties);
                    ns = ns[parts[i]];
                }
                else {
                    // if namespace doesn't exist, instantiate as empty object
                    ns = ns[parts[i]] = ns[parts[i]] || {};
                }
            }
            return ns;
        }
        var __props__ = {};
        /**
         * _getProp
         * @private
         * @description Accessor for private __props__ object
         * @param key: string A key representing the namespace to set. eg 'foo.bar.baz'
         * @return any
         */
        function _getProp(key) {
            var parts = key.split('.'), value, i;
            if (parts.length > 1) {
                i = 0;
                value = __props__;
                while (i < parts.length) {
                    if (!value.hasOwnProperty(parts[i])) {
                        return;
                    }
                    value = value[parts[i]];
                    i++;
                }
                return value;
            }
            return __props__[key];
        }
        ;
        /**
         * _setProp
         * @private
         * @description Setter for single properties on the private __props__ object
         * @param key: string A key representing the namespace to set. eg 'foo.bar.baz'
         * @param value: any Any non-undefined value
         * @param mutable: boolean When set to true, the parameters given to Object.defineProperty are relaxed
         * @return any
         */
        function _setProp(key, value, mutable) {
            if (mutable === void 0) { mutable = false; }
            if (typeof value === 'undefined') {
                throw 'Cannot set property ' + key + ' to ' + value;
            }
            return namespacer(key, __props__, value, mutable);
        }
        /**
         * M.prop
         * @description Combined getter/setter for private __props__
         * @param key: string
         * @param value?: any
         * @param mutable = false
         * @return any
         */
        function prop(key, value, mutable) {
            if (mutable === void 0) { mutable = false; }
            if (typeof value !== 'undefined') {
                return _setProp(key, value, mutable);
            }
            return _getProp(key);
        }
        Utils.prop = prop;
        /**
         * M.props
         * @description Set multiple properties of __props__ at once
         * @param value: any
         * @param mutable = false
         * @return {Object} __props__
         */
        function props(value, mutable) {
            if (mutable === void 0) { mutable = false; }
            var props = {};
            var keys = Object.keys(value);
            var l = keys.length - 1;
            var curVal;
            if (typeof mutable !== 'boolean') {
                throw 'Argument 2, mutable, must be a boolean value';
            }
            if (typeof value === 'string' || !keys.length) {
                throw 'Unable to set properties with the supplied value: ' + value + '(' + typeof value + ')';
            }
            while (l > -1) {
                curVal = value[keys[l]];
                props[keys[l]] = {
                    value: !mutable && !Utils.isPrimitive(curVal) ? Object.freeze(curVal) : curVal,
                    configurable: mutable,
                    enumerable: mutable,
                    writable: mutable
                };
                l--;
            }
            Object.defineProperties(__props__, props);
            return value;
        }
        Utils.props = props;
        function provide(str, obj) {
            if (typeof str !== 'string') {
                throw Error('Invalid string supplied to namespacer');
            }
            return namespacer(str, 'Mercury', obj, true);
        }
        Utils.provide = provide;
    })(Utils = Mercury.Utils || (Mercury.Utils = {}));
})(Mercury || (Mercury = {}));

/// <reference path='./mercury/utils/state.ts' />
// alias M for quick access to utility functions
var M = Mercury.Utils;

/// <reference path='../../mercury.ts' />
/// <reference path="../../mercury.d.ts" />
var Mercury;
(function (Mercury) {
    var Utils;
    (function (Utils) {
        /**
         * This function constructs a URL given pieces of a typical Wikia URL. All URL
         * parts are optional. Passing in empty params will output the root index URL
         * of the current host.
         *
         * Some example parameters and results:
         *
         *   {wiki: 'www', path: '/login', query: {redirect: '/somepage'}}
         *   ...returns 'http://www.wikia.com/login?redirect=%2Fsomepage'
         *
         *   {wiki: 'glee', title: 'Jeff'}
         *   ...returns 'http://glee.wikia.com/wiki/Jeff'
         *
         *   {wiki: 'community', namespace: 'User', title: 'JaneDoe', path: '/preferences'}
         *   ...returns 'http://community.wikia.com/wiki/User:JaneDoe/preferences'
         *
         * @param {object} urlParams
         * @config {string} [namespace] MediaWiki article namespace
         * @config {string} [path] Additional URL path appended to the end of the URL before the querystring
         * @config {string} [protocol] Protocol
         * @config {object} [query] Querystring data, which is converted to a string and properly escaped
         * @config {string} [title] Article title
         * @config {string} [wiki] Wiki name, as it would be used as a subdomain
         * @param {object} context Window context
         * @returns {string}
         */
        function buildUrl(urlParams, context) {
            if (urlParams === void 0) { urlParams = {}; }
            if (context === void 0) { context = window; }
            var mediawikiDomain = M.prop('mediawikiDomain'), host = context.location.host, url;
            if (!urlParams.protocol) {
                urlParams.protocol = 'http';
            }
            url = urlParams.protocol + '://';
            if (urlParams.wiki) {
                url += Mercury.Utils.replaceWikiInHost(host, urlParams.wiki);
            }
            else {
                // Use Mediawiki domain if available
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
                url += Object.keys(urlParams.query).map(function (key) {
                    return (encodeURIComponent(key) + "=" + encodeURIComponent(urlParams.query[key]));
                }).join('&');
            }
            return url;
        }
        Utils.buildUrl = buildUrl;
        /**
         * Substitutes the wiki name in a host string with a new wiki name
         *
         * @param {string} host A host string (may include port number) from any Wikia environment
         * @param {string} wiki The new wiki, which may contain a language prefix; for example, "glee" or "es.walkingdead"
         * @returns {string} New host
         */
        function replaceWikiInHost(host, wiki) {
            var match;
            // (1) Sandbox, preview, or verify hosts on wikia.com
            if ((match = host.match(/^(sandbox-.+?|preview|verify)\.(.+?)\.wikia\.com($|\/|:)/)) !== null) {
                host = host.replace(match[1] + '.' + match[2], match[1] + '.' + wiki);
            }
            else if ((match = host.match(/^(.+?)\.wikia\.com($|\/|:)/)) !== null) {
                // Domain is specified here in case subdomain is actually "wiki", "com", etc.
                host = host.replace(match[1] + '.wikia.com', wiki + '.wikia.com');
            }
            else if ((match = host.match(/^(.+)\.(.+?)\.wikia-dev.\w{2,3}($|\/|:)/)) !== null) {
                host = host.replace(match[1] + '.' + match[2], wiki + '.' + match[2]);
            }
            else if ((match = host.match(/^(.+)\.(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\.xip\.io($|\/|:)/)) !== null) {
                host = host.replace(match[1] + '.' + match[2] + '.xip.io', wiki + '.' + match[2] + '.xip.io');
            }
            // At this point, in the case of an unknown local host where the wiki is not in the
            // host string (ie. "mercury:8000"), it will be left unmodified and returned as-is.
            return host;
        }
        Utils.replaceWikiInHost = replaceWikiInHost;
    })(Utils = Mercury.Utils || (Mercury.Utils = {}));
})(Mercury || (Mercury = {}));