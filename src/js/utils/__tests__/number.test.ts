import { parseNumber, signed } from '../number'

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

describe('signed', () => {
  it.each<[number, string]>([
    [2, '+2'],
    [-2, '-2'],
    [0, '0'],
  ])('formats %i as "%s"', (n, expected) => {
    expect(signed(n)).toBe(expected)
  })
})
