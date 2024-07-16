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

  it('should throw an error for an invalid dice formula', () => {
    expect(() => rollDiceFormula('invalid')).toThrow('Invalid dice formula')
  })

  it('should return the correct total for another valid dice formula', () => {
    const result = rollDiceFormula('5d4')
    expect(result).toBe(5) // Since the mock always returns 1, 5 rolls of 1 result in 5
  })

  it('should correctly handle single die roll', () => {
    const result = rollDiceFormula('1d10')
    expect(result).toBe(1) // Since the mock always returns 1, 1 roll of 1 results in 1
  })
})
