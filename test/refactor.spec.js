import {expect} from 'chai';

import jsonRefactor from '../src/index.js';

const testcases = [
  // 0
  {
    source: {
      'old_name': 'Hello world',
      'should_be_number': '3.14159',
      'inverse_it': true,
      'make_it_boolean': 1
    },
    map: {
      'old_name': 'new_name',
      'should_be_number': '+it_is_number',
      'inverse_it': '!inversed',
      'make_it_boolean': '!!it_is_boolean'
    },
    answer: {
      'new_name': 'Hello world',
      'it_is_number': 3.14159,
      'inversed': false,
      'it_is_boolean': true
    }
  },
  // 1
  {
    source: {
      'foo': 'hello world'
    },
    map: {
      'foo': function (value) {
        return {
          key: 'bar',
          value: value.toUpperCase()
        };
      }
    },
    answer: {
      'bar': 'HELLO WORLD'
    }
  },
  // 2
  {
    source: {
      'foo': ['hello', 'world'],
      'bar': {
        'baz': 'goodbye',
        'qux': 'yesterday'
      }
    },
    map: {
      'foo[0]': 'foo.first',
      'foo[1]': 'foo.second',
      'bar.baz': 'arr[0]',
      'bar.qux': 'arr[1]'
    },
    answer: {
      'foo': {
        'first': 'hello',
        'second': 'world'
      },
      'arr': ['goodbye', 'yesterday']
    }
  },
  // 3
  {
    source: {
      'to_recur': [
        {
          'name': 'foo',
          'age': 3
        }, {
          'name': 'bar',
          'age': 4
        }
      ]
    },
    map: {
      'to_recur[]': {
        key: 'recurred[]',
        map: {
          'name': 'items.name',
          'age': 'items.age'
        }
      }
    },
    answer: {
      'recurred': [
        {
          'items': {
            'name': 'foo',
            'age': 3
          }
        },
        {
          'items': {
            'name': 'bar',
            'age': 4
          }
        }
      ]
    }
  },
  // 4
  {
    source: {
      'true1': 1,
      'true2': '1',
      'true3': true,
      'true4': 'true',
      'true5': 't',
      'true6': 'yes',
      'true7': 'y',
      'true8': 'TRUE',
      'true9': 'T',
      'true10': 'YES',
      'true11': 'Y',
      'false1': 0,
      'false2': '0',
      'false3': false,
      'false4': 'false',
      'false5': 'f',
      'false6': 'no',
      'false7': 'n',
      'false8': 'FALSE',
      'false9': 'F',
      'false10': 'NO',
      'false11': 'N',
      'false12': '',
      'false13': null,
      'false14': 'null',
      'false15': 'whatever'
    },
    map: {
      'true1': '!!true1',
      'true2': '!!true2',
      'true3': '!!true3',
      'true4': '!!true4',
      'true5': '!!true5',
      'true6': '!!true6',
      'true7': '!!true7',
      'true8': '!!true8',
      'true9': '!!true9',
      'true10': '!!true10',
      'true11': '!!true11',
      'false1': '!!false1',
      'false2': '!!false2',
      'false3': '!!false3',
      'false4': '!!false4',
      'false5': '!!false5',
      'false6': '!!false6',
      'false7': '!!false7',
      'false8': '!!false8',
      'false9': '!!false9',
      'false10': '!!false10',
      'false11': '!!false11',
      'false12': '!!false12',
      'false13': '!!false13',
      'false14': '!!false14',
      'false15': '!!false15'
    },
    answer: {
      'true1': true,
      'true2': true,
      'true3': true,
      'true4': true,
      'true5': true,
      'true6': true,
      'true7': true,
      'true8': true,
      'true9': true,
      'true10': true,
      'true11': true,
      'false1': false,
      'false2': false,
      'false3': false,
      'false4': false,
      'false5': false,
      'false6': false,
      'false7': false,
      'false8': false,
      'false9': false,
      'false10': false,
      'false11': false,
      'false12': false,
      'false13': false,
      'false14': false,
      'false15': false
    }
  },
  // 5
  {
    source: {
      'foo': [
        { 'bar': 1 },
        { 'baz': 2 }
      ]
    },
    map: {
      'foo[]': {
        key: 'new_foo[]',
        map: {
          'bar': 'bar',
          'baz': 'baz'
        }
      }
    },
    answer: {
      'new_foo': [
        { 'bar': 1 },
        { 'baz': 2 }
      ]
    }
  },
  // 6
  {
    source: {},
    map: {
      '__json-refactor__': { setUndefined: true },
      'foo': 'foo'
    },
    answer: {
      'foo': null
    }
  },
  // 7
  {
    source: [1, 'two', true, ['f', 'o', 'u', 'r'], { no: 5 }],
    map: {
      '': ''
    },
    answer: [1, 'two', true, ['f', 'o', 'u', 'r'], { no: 5 }]
  }
];

describe('JSON Refactor Test', function () {
  testcases.forEach((testcase, idx) => {
    it(`Testcase ${idx}`, function () {
      expect(jsonRefactor(testcase.source, testcase.map)).deep.equal(testcase.answer);
    });
  });
});