import type { Attributes } from '../../../domain/snw/Attributes'
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
    describe('No DEX bonus', () => {
      it('should calc AC / Leather', () => {
        expect(
          getCharArmorClass({ Dexterity: { ArmorClass: 0 } } as Attributes, {
            Leather: {
              ascArmorClass: 2,
              cost: 5,
              name: 'Leather',
              quantity: 1,
              weight: 25,
            },
          }),
        ).toEqual({ aac: 12, armor: 'Leather', dac: 7 })
      })

      it('should calc AC / Ring mail', () => {
        expect(
          getCharArmorClass({ Dexterity: { ArmorClass: 0 } } as Attributes, {
            Ring: {
              ascArmorClass: 3,
              cost: 30,
              name: 'Ring',
              quantity: 1,
              weight: 40,
            },
          }),
        ).toEqual({ aac: 13, armor: 'Ring', dac: 6 })
      })

      it('should calc AC / Plate', () => {
        expect(
          getCharArmorClass({ Dexterity: { ArmorClass: 0 } } as Attributes, {
            Plate: {
              ascArmorClass: 6,
              cost: 100,
              name: 'Plate',
              quantity: 1,
              weight: 70,
            },
          }),
        ).toEqual({ aac: 16, armor: 'Plate', dac: 3 })
      })

      it('should calc AC / Chain', () => {
        expect(
          getCharArmorClass({ Dexterity: { ArmorClass: 0 } } as Attributes, {
            Chain: {
              ascArmorClass: 4,
              cost: 75,
              name: 'Chain',
              quantity: 1,
              weight: 50,
            },
          }),
        ).toEqual({ aac: 14, armor: 'Chain', dac: 5 })
      })

      it('should calc AC / shield', () => {
        expect(
          getCharArmorClass({ Dexterity: { ArmorClass: 0 } } as Attributes, {
            Shield: { ascArmorClass: 1, cost: 15, name: 'Shield', quantity: 1, weight: 10 },
          }),
        ).toEqual({ aac: 11, armor: 'Shield', dac: 8 })
      })

      it('should calc AC / Chain + shield', () => {
        expect(
          getCharArmorClass({ Dexterity: { ArmorClass: 0 } } as Attributes, {
            Chain: {
              ascArmorClass: 4,
              cost: 75,
              name: 'Chain',
              quantity: 1,
              weight: 50,
            },
            Shield: { ascArmorClass: 1, cost: 15, name: 'Shield', quantity: 1, weight: 10 },
          }),
        ).toEqual({ aac: 15, armor: 'Chain, shield', dac: 4 })
      })

      it('should calc AC / Plate, shield', () => {
        expect(
          getCharArmorClass({ Dexterity: { ArmorClass: 0 } } as Attributes, {
            Plate: {
              ascArmorClass: 6,
              cost: 100,
              name: 'Plate',
              quantity: 1,
              weight: 70,
            },
            Shield: { ascArmorClass: 1, cost: 15, name: 'Shield', quantity: 1, weight: 10 },
          }),
        ).toEqual({ aac: 17, armor: 'Plate, shield', dac: 2 })
      })
    })

    describe('DEX bonus', () => {
      it('should calc AC / Leather', () => {
        expect(
          getCharArmorClass({ Dexterity: { ArmorClass: 1 } } as Attributes, {
            Leather: {
              ascArmorClass: 2,
              cost: 5,
              name: 'Leather',
              quantity: 1,
              weight: 25,
            },
          }),
        ).toEqual({ aac: 13, armor: 'Leather', dac: 6 })
      })

      it('should calc AC / Plate', () => {
        expect(
          getCharArmorClass({ Dexterity: { ArmorClass: -1 } } as Attributes, {
            Plate: {
              ascArmorClass: 6,
              cost: 100,
              name: 'Plate',
              quantity: 1,
              weight: 70,
            },
          }),
        ).toEqual({ aac: 15, armor: 'Plate', dac: 4 })
      })

      it('should calc AC / shield', () => {
        expect(
          getCharArmorClass({ Dexterity: { ArmorClass: -1 } } as Attributes, {
            Shield: {
              ascArmorClass: 1,
              cost: 15,
              name: 'Shield',
              quantity: 1,
              weight: 10,
            },
          }),
        ).toEqual({ aac: 10, armor: 'Shield', dac: 9 })
      })

      it('should calc AC / Chain + shield', () => {
        expect(
          getCharArmorClass({ Dexterity: { ArmorClass: 1 } } as Attributes, {
            Chain: {
              ascArmorClass: 4,
              cost: 75,
              name: 'Chain',
              quantity: 1,
              weight: 50,
            },
            Shield: {
              ascArmorClass: 1,
              cost: 15,
              name: 'Shield',
              quantity: 1,
              weight: 10,
            },
          }),
        ).toEqual({ aac: 16, armor: 'Chain, shield', dac: 3 })
      })

      it('should calc AC / Plate, shield', () => {
        expect(
          getCharArmorClass({ Dexterity: { ArmorClass: -1 } } as Attributes, {
            Plate: {
              ascArmorClass: 6,
              cost: 100,
              name: 'Plate',
              quantity: 1,
              weight: 70,
            },
            Shield: {
              ascArmorClass: 1,
              cost: 15,
              name: 'Shield',
              quantity: 1,
              weight: 10,
            },
          }),
        ).toEqual({ aac: 16, armor: 'Plate, shield', dac: 3 })
      })

      it('calcs the highest AC / Plate, Leather', () => {
        expect(
          getCharArmorClass({ Dexterity: { ArmorClass: 0 } } as Attributes, {
            Leather: {
              ascArmorClass: 2,
              cost: 15,
              name: 'Leather',
              quantity: 1,
              weight: 10,
            },
            Plate: {
              ascArmorClass: 6,
              cost: 100,
              name: 'Plate',
              quantity: 1,
              weight: 70,
            },
          }),
        ).toEqual({ aac: 16, armor: 'Plate', dac: 3 })
      })

      it('calcs the highest AC / Plate, Leather, shield', () => {
        expect(
          getCharArmorClass({ Dexterity: { ArmorClass: 1 } } as Attributes, {
            Leather: {
              ascArmorClass: 2,
              cost: 15,
              name: 'Leather',
              quantity: 1,
              weight: 10,
            },
            Plate: {
              ascArmorClass: 6,
              cost: 100,
              name: 'Plate',
              quantity: 1,
              weight: 70,
            },
            Shield: {
              ascArmorClass: 1,
              cost: 15,
              name: 'Shield',
              quantity: 1,
              weight: 10,
            },
          }),
        ).toEqual({ aac: 18, armor: 'Plate, shield', dac: 1 })
      })
    })
  })
})
