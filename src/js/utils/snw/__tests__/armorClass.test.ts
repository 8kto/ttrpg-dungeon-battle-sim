import { CharacterStats } from '../../../domain/snw/CharacterStats'
import { getCharArmorClass, getDescArmorClass } from '../armorClass'

describe('armorClass utils', () => {
  describe('getDescArmorClass', () => {
    it.each([
      [11, 8],
      [12, 7],
      [13, 6],
      [14, 5],
      [15, 4],
      [16, 3],
      [17, 2],
      [18, 1],
      [19, 0],
    ])('should return valid desc AC [%d]', (ascArmorClass, expectedDescArmorClass) => {
      expect(getDescArmorClass(ascArmorClass)).toEqual(expectedDescArmorClass)
    })
  })

  describe('getCharArmorClass', () => {
    it('should calc AC / 0-bonus, Leather', () => {
      expect(
        getCharArmorClass({ Dexterity: { ArmorClass: 0 } } as CharacterStats, [
          {
            armorClass: '+2 [-2]',
            cost: 5,
            name: 'Leather',
            weight: 25,
          },
        ]),
      ).toEqual({ aac: 12, armor: 'Leather', dac: 7 })
    })

    it('should calc AC / 0-bonus, Ring mail', () => {
      expect(
        getCharArmorClass({ Dexterity: { ArmorClass: 0 } } as CharacterStats, [
          {
            armorClass: '+3 [-3]',
            cost: 30,
            name: 'Ring',
            weight: 40,
          },
        ]),
      ).toEqual({ aac: 13, armor: 'Ring', dac: 6 })
    })

    it('should calc AC / 0-bonus, Plate', () => {
      expect(
        getCharArmorClass({ Dexterity: { ArmorClass: 0 } } as CharacterStats, [
          {
            armorClass: '+6 [-6]',
            cost: 100,
            name: 'Plate',
            weight: 70,
          },
        ]),
      ).toEqual({ aac: 16, armor: 'Plate', dac: 3 })
    })

    it('should calc AC / 0-bonus, Chain', () => {
      expect(
        getCharArmorClass({ Dexterity: { ArmorClass: 0 } } as CharacterStats, [
          {
            armorClass: '+4 [-4]',
            cost: 75,
            name: 'Chain',
            weight: 50,
          },
        ]),
      ).toEqual({ aac: 14, armor: 'Chain', dac: 5 })
    })

    it('should calc AC / 0-bonus, shield', () => {
      expect(
        getCharArmorClass({ Dexterity: { ArmorClass: 0 } } as CharacterStats, [
          { armorClass: '+1 [-1]', cost: 15, name: 'Shield', weight: 10 },
        ]),
      ).toEqual({ aac: 11, armor: 'Shield', dac: 8 })
    })

    it('should calc AC / 0-bonus, Chain + shield', () => {
      expect(
        getCharArmorClass({ Dexterity: { ArmorClass: 0 } } as CharacterStats, [
          {
            armorClass: '+4 [-4]',
            cost: 75,
            name: 'Chain',
            weight: 50,
          },
          { armorClass: '+1 [-1]', cost: 15, name: 'Shield', weight: 10 },
        ]),
      ).toEqual({ aac: 15, armor: 'Chain, shield', dac: 4 })
    })

    it('should calc AC / 0-bonus, Plate, shield', () => {
      expect(
        getCharArmorClass({ Dexterity: { ArmorClass: 0 } } as CharacterStats, [
          {
            armorClass: '+6 [-6]',
            cost: 100,
            name: 'Plate',
            weight: 70,
          },
          { armorClass: '+1 [-1]', cost: 15, name: 'Shield', weight: 10 },
        ]),
      ).toEqual({ aac: 17, armor: 'Plate, shield', dac: 2 })
    })
  })
})
