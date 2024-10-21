import { rollDiceFormula } from '../dice'
import * as diceModule from '../dice'

describe('rollDiceFormula', () => {
  // Mock the roll function
  beforeEach(() => {
    // @ts-ignore
    jest.spyOn(diceModule, 'roll').mockImplementation((_: number) => {
      // Mock implementation: always return 1 for simplicity
      return 1
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should return the correct total for a valid dice formula', () => {
    const result = rollDiceFormula('3d6')
    expect(result).toBe(3) // Since the mock always returns 1, 3 rolls of 1 result in 3
  })

  it('should support simplified format', () => {
    const result = rollDiceFormula('d6')
    expect(result).toBe(1) // Since the mock always returns 1, 3 rolls of 1 result in 3
  })

  it.each(['invalid', '(d6+10)', 'd6/1', 'd6*2', '2*d6'])(
    'should throw an error for an invalid dice formula %s',
    (input) => {
      expect(() => rollDiceFormula(input)).toThrow(
        'Invalid dice formula, allowed characters are +-, numbers and dices (d6 etc.)',
      )
    },
  )

  it('should return the correct total for another valid dice formula', () => {
    const result = rollDiceFormula('5d4')
    expect(result).toBe(5) // Since the mock always returns 1, 5 rolls of 1 result in 5
  })

  it('should correctly handle single die roll', () => {
    const result = rollDiceFormula('1d10')
    expect(result).toBe(1) // Since the mock always returns 1, 1 roll of 1 results in 1
  })

  it.each([
    ['d6+1', 2],
    ['d6 + 1', 2],
    ['d6 +1', 2],
    ['d6-1', 0],
    ['d6 - 1', 0],
    ['d6 -1', 0],
    ['0d6', 0],
  ])('should support simple formulas %s', (input, expected) => {
    const result = rollDiceFormula(input)
    expect(result).toBe(expected)
  })

  it.each([
    ['2d6+1', 3],
    ['3d6 + 1', 4],
    ['4d6 +1', 5],
    ['2d6-1', 1],
    ['3d6 - 1', 2],
    ['6d6 -1', 5],
  ])('should support simple formulas with nums %s', (input, expected) => {
    const result = rollDiceFormula(input)
    expect(result).toBe(expected)
  })

  it.each([
    ['d6+1+2', 4],
    ['d6 + 1', 2],
    ['d6 +1', 2],
    ['d6-1', 0],
    ['d6 - 1', 0],
    ['d6 -1', 0],
  ])('should support multiple operands %s', (input, expected) => {
    const result = rollDiceFormula(input)
    expect(result).toBe(expected)
  })

  it.each([
    ['d6+d6', 2],
    ['d6 + d6 + 1', 3],
    ['d6 + d6 + d10 -2', 1],
  ])('should support multiple dice rolls %s', (input, expected) => {
    const result = rollDiceFormula(input)
    expect(result).toBe(expected)
  })
})
