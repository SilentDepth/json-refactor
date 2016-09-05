import {expect} from 'chai';
import json from './json.js';

import parser from '../src/parser.js';

let obj;

describe('Parser', function () {
  beforeEach(function () {
    obj = JSON.parse(json);
  });

  it.only('json test', function () {
    expect(obj['plain-number']).equal(233);
  });

  it('case 1', function () {
    let output = parser(obj, 'plain-number');
    expect(output.parent).to.be.equal(obj);
    expect(output.key).to.be.equal('plain-number');s
  });
});