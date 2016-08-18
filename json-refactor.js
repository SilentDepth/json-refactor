"use strict";

var jsonRefactor = function (source, target, map) {
    if (arguments.length == 2) {
        map = arguments[1];
        target = {};
    }
    var setUndefined = (map['__json-refactor__'] && map['__json-refactor__'].setUndefined) || false;

    var parser = function (object, path, makeCrumbs) {
        var parent = object, key = '';
        var tokens = path.split('.'), len = tokens.length;
        tokens.forEach(function (token, idx) {
            var groups = /(\w+)(\[(\d+)?])?$/.exec(token), isArray = !!groups[2], arrIdx = groups[3];
            key = groups[1];

            if (isArray) {
                if (makeCrumbs && !(parent[key] instanceof Array)) parent[key] = [];
                parent = parent[key];
                key = arrIdx || parent.length;
            }

            if (idx < len - 1) {
                if (makeCrumbs && !parent[key]) parent[key] = {};
                parent = parent[key];
            }
        });

        if (parent) {
            return {
                parent: parent,
                key: key
            };
        }
    };

    var getter = function (sourceKey) {
        var needIteration = false;
        if (/\[]$/.test(sourceKey)) {
            needIteration = true;
            sourceKey = sourceKey.slice(0, -2);
        }

        var pathObj = parser(source, sourceKey);

        if (pathObj) {
            return {
                needIteration: needIteration,
                value: pathObj.parent[pathObj.key]
            };
        }
    };

    var setter = function (targetKey, value) {
        if (value === undefined) {
            if (setUndefined) {
                value = null;
            } else return;
        } else {
            if (typeof targetKey == 'function') {
                var result = targetKey(value);
                if (result === undefined) return;
                targetKey = result.key;
                value = result.value;
            } else if (/^!/.test(targetKey)) {
                value = ['1', 'true', 'yes', 't', 'y'].indexOf(('' + value).toLowerCase()) >= 0;
                if (/^!!/.test(targetKey)) {
                    targetKey = targetKey.slice(2);
                } else {
                    value = !value;
                    targetKey = targetKey.slice(1);
                }
            } else if (/^\+/.test(targetKey)) {
                value = +value;
                targetKey = targetKey.slice(1);
            }
        }

        var pathObj = parser(target, targetKey, true);
        pathObj.parent[pathObj.key] = value instanceof Object ? JSON.parse(JSON.stringify(value)) : value;
    };

    for (var sourceKey in map) {
        if (!map.hasOwnProperty(sourceKey) || sourceKey == '__json-refactor__') continue;

        var got = getter(sourceKey);
        if (got === undefined) {
            if (setUndefined) got = {value: undefined};
            else continue;
        }
        if (got.needIteration) {
            got.value.forEach(function (source) {
                var refactored = jsonRefactor(source, map[sourceKey].map);
                setter(map[sourceKey].key, refactored);
            }, this);
        } else {
            setter(map[sourceKey], got.value);
        }
    }

    return target;
};
