"use strict";

var jsonTranspiler = function (source, target, map) {
    if (arguments.length == 2) {
        map = arguments[1];
        target = {};
    }

    var parser = function (object, path, makeCrumbs) {
        var parent = object, key = '';
        var tokens = path.split('.'), len = tokens.length;
        tokens.forEach(function (token, idx) {
            // TODO: push
            var groups = /(\w+)(?:\[(\d+)])?$/.exec(token), arrIdx = groups[2], isArray = !!arrIdx;
            key = groups[1];

            if (isArray) {
                if (makeCrumbs && !(parent[key] instanceof Array)) parent[key] = [];
                parent = parent[key];
                key = arrIdx;
            }

            if (idx < len - 1) {
                if (makeCrumbs && !parent[key]) parent[key] = {};
                parent = parent[key];
            }
        });

        return {
            parent: parent,
            key: key
        };
    };

    var getter = function (sourceKey) {
        var needIteration = false;
        if (/\[]$/.test(sourceKey)) {
            needIteration = true;
            sourceKey = sourceKey.slice(0, -2);
        }

        var pathObj = parser(source, sourceKey);

        return {
            needIteration: needIteration,
            value: pathObj.parent[pathObj.key]
        };
    };

    var setter = function (targetKey, value) {
        if (typeof targetKey == 'function') {
            var result = targetKey(value);
            targetKey = result.key;
            value = result.value;
        } else if (/^!!/.test(targetKey)) {
            value = !!value;
            targetKey = targetKey.slice(2);
        } else if (/^!/.test(targetKey)) {
            value = !value;
            targetKey = targetKey.slice(1);
        } else if (/^\+/.test(targetKey)) {
            value = +value;
            targetKey = targetKey.slice(1);
        }

        var pathObj = parser(target, targetKey, true);
        pathObj.parent[pathObj.key] = value;
    };

    for (var sourceKey in map) {
        if (!map.hasOwnProperty(sourceKey)) continue;

        var got = getter(sourceKey);
        if (got.needIteration) {
            got.value.forEach(function (source) {
                var transpiled = jsonTranspiler(source, map[sourceKey].map);
                setter(map[sourceKey].key, transpiled);
            }, this);
        } else {
            setter(map[sourceKey], got.value);
        }
    }

    return target;
};