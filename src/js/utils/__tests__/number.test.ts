import { parseNumber } from '../number'

describe('parseNumber', () => {
  it.each<[string, number]>([
    ['12', 12],
    ['-5', -5],
    ['12.5', 12.5],
    [' 7 ', 7],
    ['', NaN],
    ['  ', NaN],
    ['abc', NaN],
  ])('parses "%s"', (value, expected) => {
    expect(parseNumber(value)).toBe(expected)
  })
})
