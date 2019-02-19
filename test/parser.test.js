import json from './json'

import parser from '../src/parser'

let obj

describe('Parser', () => {
  beforeEach(() => {
    obj = JSON.parse(json)
  })

  test.only('json test', () => {
    expect(obj['plain-number']).toBe(233)
  })

  test('case 1', () => {
    let output = parser(obj, 'plain-number')
    expect(output.parent).toBe(obj)
    expect(output.key).toBe('plain-number')
  })
})