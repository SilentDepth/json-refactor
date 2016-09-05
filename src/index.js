'use strict';

import getter from './getter.js';
import setter from './setter.js';

const CONFIG_KEY = '__json-refactor__';

function jsonRefactor(source, map, target = {}) {
  const {setUndefined = false} = map[CONFIG_KEY] || {};

  // TODO: parameters validation

  Reflect.ownKeys(map).filter(key => key !== CONFIG_KEY).forEach(sourceKey => {
    let got = getter(source, sourceKey);
    if (got === undefined) {
      if (setUndefined) {
        got = {value: undefined};
      } else {
        return;
      }
    }
    if (got.needIteration) {
      got.value.forEach(source => {
        let refactored = jsonRefactor(source, map[sourceKey].map);
        setter(target, map[sourceKey].key, refactored, setUndefined);
      });
    } else {
      setter(target, map[sourceKey], got.value, setUndefined);
    }
  });

  return target;
}

export default jsonRefactor;