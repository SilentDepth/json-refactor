'use strict';

import parser from './parser.js';

function getter(source, sourceKey) {
  let key = sourceKey;
  let needIteration = false;

  if (/\[]$/.test(key)) {
    needIteration = true;
    key = key.slice(0, -2);
  }

  let pathObj = parser(source, key);

  if (pathObj) {
    return {
      needIteration,
      value: pathObj.parent[pathObj.key],
    };
  }
}

export default getter;