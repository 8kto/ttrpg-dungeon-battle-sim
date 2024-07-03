import { BaseMovementRate, UndergroundMovement } from '../../../domain/snw/Movement'
import { getBaseMovementRate, getUndergroundSpeed } from '../movement'


describe('getBaseMovementRate', () => {
  it('should return 12 when adjusted weight is less than or equal to 75', () => {
    expect(getBaseMovementRate(50, 0)).toBe(12)
    expect(getBaseMovementRate(75, 0)).toBe(12)
  })

  it('should return 9 when adjusted weight is between 76 and 100', () => {
    expect(getBaseMovementRate(76, 0)).toBe(9)
    expect(getBaseMovementRate(100, 0)).toBe(9)
  })

  it('should return 6 when adjusted weight is between 101 and 150', () => {
    expect(getBaseMovementRate(101, 0)).toBe(6)
    expect(getBaseMovementRate(150, 0)).toBe(6)
  })

  it('should return 3 when adjusted weight is between 151 and 300', () => {
    expect(getBaseMovementRate(151, 0)).toBe(3)
    expect(getBaseMovementRate(300, 0)).toBe(3)
  })

  it('should return 0 when adjusted weight is greater than 300', () => {
    expect(getBaseMovementRate(301, 0)).toBe(0)
    expect(getBaseMovementRate(500, 0)).toBe(0)
  })

  it('should adjust weight by carryModifier', () => {
    expect(getBaseMovementRate(100, 50)).toBe(12) // Adjusted weight = 50
    expect(getBaseMovementRate(150, 50)).toBe(9) // Adjusted weight = 100
    expect(getBaseMovementRate(200, 50)).toBe(6) // Adjusted weight = 150
    expect(getBaseMovementRate(350, 50)).toBe(3) // Adjusted weight = 300
  })

  it('should not allow negative adjusted weight', () => {
    expect(getBaseMovementRate(50, 100)).toBe(12) // Adjusted weight = 0 (not negative)
  })
})

describe('getUndergroundSpeed', () => {
  it('should return correct underground speeds for given base movement rate', () => {
    const baseMovementRate: BaseMovementRate = 12
    const expected: UndergroundMovement = {
      combat: 40, // 12 / 3 * 10
      running: 480, // 12 * 40
      walking: 240, // 12 * 20
    }

    expect(getUndergroundSpeed(baseMovementRate)).toEqual(expected)
  })

  it('should return zero speeds for a base movement rate of 0', () => {
    const baseMovementRate: BaseMovementRate = 0
    const expected: UndergroundMovement = {
      combat: 0,
      running: 0,
      walking: 0,
    }

    expect(getUndergroundSpeed(baseMovementRate)).toEqual(expected)
  })
})
