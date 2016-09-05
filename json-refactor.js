const jsonRefactor = function (source, target, map) {
  if (arguments.length == 2)[target, map] = [{}, arguments[1]];

  const CONFIG_KEY = '__json-refactor__';

  let {setUndefined = false} = map[CONFIG_KEY] || {};

  for (let sourceKey in map) {
    if (!map.hasOwnProperty(sourceKey) || sourceKey == CONFIG_KEY) continue;

    let got = getter(source, sourceKey);
    if (got === undefined) {
      if (setUndefined) got = { value: undefined };
      else continue;
    }
    if (got.needIteration) {
      got.value.forEach(source => {
        let refactored = jsonRefactor(source, map[sourceKey].map);
        setter(target, map[sourceKey].key, refactored, setUndefined);
      });
    } else {
      setter(target, map[sourceKey], got.value, setUndefined);
    }
  }

  return target;
};

let parser = function (object, path, makeCrumbs) {
  let [parent, key] = [object, ''];
  let tokens = path.split('.'), len = tokens.length;

  tokens.forEach((token, idx) => {
    let groups = /(\w+)(\[(\d+)?])?$/.exec(token), isArray = !!groups[2], arrIdx = groups[3];
    key = groups[1];

    if (isArray) {
      if (makeCrumbs && !(parent[key] instanceof Array)) parent[key] = [];
      [parent, key] = [parent[key], arrIdx || parent.length];
    }

    if (idx < len - 1) {
      if (makeCrumbs && !parent[key]) parent[key] = {};
      parent = parent[key];
    }
  });

  if (parent) {
    return { parent, key };
  }
};

let getter = function (source, sourceKey) {
  let needIteration = false;
  if (/\[]$/.test(sourceKey)) {
    needIteration = true;
    sourceKey = sourceKey.slice(0, -2);
  }

  let pathObj = parser(source, sourceKey);

  if (pathObj) {
    return {
      needIteration,
      value: pathObj.parent[pathObj.key]
    };
  }
};

let setter = function (target, targetKey, value, setUndefined) {
  if (value === undefined) {
    if (setUndefined) {
      value = null;
    } else return;
  } else {
    if (typeof targetKey === 'function') {
      let result = targetKey(value);
      if (result === undefined) return;
      ({ key: targetKey, value } = result);
    } else if (/^!/.test(targetKey)) {
      value = ['1', 'true', 'yes', 't', 'y'].indexOf(('' + value).toLowerCase()) >= 0;
      if (/^!!/.test(targetKey)) {
        targetKey = targetKey.slice(2);
      } else {
        [targetKey, value] = [targetKey.slice(1), !value];
      }
    } else if (/^\+/.test(targetKey)) {
      [targetKey, value] = [targetKey.slice(1), +value];
    }
  }

  let pathObj = parser(target, targetKey, true);
  pathObj.parent[pathObj.key] = value instanceof Object ? JSON.parse(JSON.stringify(value)) : value;
};

export default jsonRefactor;
export {parser, getter, setter};