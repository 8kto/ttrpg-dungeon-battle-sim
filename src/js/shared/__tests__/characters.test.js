import { getMatchingScore } from '../character.js'

describe('character utils', () => {
  describe('getMatchingScore', () => {
    it.each([
      [3, 4],
      [4, 4],
      [5, 6],
      [6, 6],
      [7, 8],
      [8, 8],
      [9, 12],
      [10, 12],
      [11, 12],
      [12, 12],
      [13, 15],
      [14, 15],
      [15, 15],
      [16, 16],
      [17, 17],
      [18, 18],
    ])('should match the expected scores %d => %d', (score, expected) => {
      expect(getMatchingScore(score)).toEqual(expected)
    })
  })
})
