'use strict';

import parser from './parser.js';

function setter(target, targetKey, value = null, setUndefined = false) {
  if (value === undefined) {
    if (!setUndefined) {
      return;
    }
  } else {
    if (typeof targetKey === 'function') {
      let result = targetKey(value);
      if (result === undefined) {
        return
      }
      ({key: targetKey, value} = result);
    } else if (/^!/.test(targetKey)) {
      value = ['1', 'true', 'yes', 't', 'y'].indexOf(('' + value).toLowerCase()) >= 0;
      if (/^!!/.test(targetKey)) {
        targetKey = targetKey.slice(2);
      } else {
        targetKey = targetKey.slice(1);
        value = !value;
      }
    } else if (/^\+/.test(targetKey)) {
      targetKey = targetKey.slice(1);
      value = +value;
    }
  }

  let pathObj = parser(target, targetKey, true);
  pathObj.parent[pathObj.key] = value instanceof Object ? JSON.parse(JSON.stringify(value)) : value;
}

export default setter;