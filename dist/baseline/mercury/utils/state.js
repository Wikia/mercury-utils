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
                if (i === parts.length - 1) {
                    Object.defineProperty(ns, parts[i], properties);
                    ns = ns[parts[i]];
                }
                else {
                    ns = ns[parts[i]] = ns[parts[i]] || {};
                }
            }
            return ns;
        }
        var __props__ = {};
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
        function _setProp(key, value, mutable = false) {
            if (typeof value === 'undefined') {
                throw 'Cannot set property ' + key + ' to ' + value;
            }
            return namespacer(key, __props__, value, mutable);
        }
        function prop(key, value, mutable = false) {
            if (typeof value !== 'undefined') {
                return _setProp(key, value, mutable);
            }
            return _getProp(key);
        }
        Utils.prop = prop;
        function props(value, mutable = false) {
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
