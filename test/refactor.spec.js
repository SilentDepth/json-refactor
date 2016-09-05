import {expect} from 'chai';

import jsonRefactor from '../src/index.js';

describe('JSON Refactor Test', function () {
  it('case 1', function () {
    let source = {
      'old_name': 'Hello world',
      'should_be_number': '3.14159',
      'inverse_it': true,
      'make_it_boolean': 1
    };
    let map = {
      'old_name': 'new_name',
      'should_be_number': '+it_is_number',
      'inverse_it': '!inversed',
      'make_it_boolean': '!!it_is_boolean'
    };
    let answer = {
      'new_name': 'Hello world',
      'it_is_number': 3.14159,
      'inversed': false,
      'it_is_boolean': true
    };
    expect(jsonRefactor(source, map)).deep.equal(answer);
  });
});