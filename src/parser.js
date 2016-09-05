'use strict';

function parser(obj, path, makeCrumbs = false) {
  let parent = obj;
  let key = '';
  let tokens = path.split('.');
  let len = tokens.length;
  let isArray;
  let arrIdx;

  tokens.forEach((token, idx) => {
    [, key, isArray, arrIdx] = /(.+?)(\[(\d+)?])?$/.exec(token);

    if (isArray) {
      if (makeCrumbs && !(parent[key] instanceof Array)) {
        parent[key] = [];
      }
      parent = parent[key];
      key = arrIdx || parent.length;
    }

    if (idx < len - 1) {
      if (makeCrumbs && !parent[key]) {
        parent[key] = {};
      }
      parent = parent[key];
    }
  });

  if (parent) {
    return {parent, key};
  }
};

export default parser;