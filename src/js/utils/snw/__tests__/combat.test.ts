import { CharacterClasses } from '../../../config/snw/CharacterClasses'
import { Attributes } from '../../../domain/snw/Attributes'
import { CharacterClass, CharacterClassDef } from '../../../domain/snw/CharacterClass'
import { getDamageModifier, getToHitMelee, getToHitMissiles } from '../combat'

describe('combat utils', () => {
  describe('getToHitMelee', () => {
    it.each([
      [CharacterClass.Assassin, '0'],
      [CharacterClass.Cleric, '0'],
      [CharacterClass.Druid, '0'],
      [CharacterClass.Fighter, '+1'],
      [CharacterClass.MagicUser, '0'],
      [CharacterClass.Monk, '0'],
      [CharacterClass.Paladin, '0'],
      [CharacterClass.Ranger, '0'],
      [CharacterClass.Thief, '0'],
    ])('should return the correct 0-1 to-hit value for %s', (characterClass, expectedValue) => {
      const result = getToHitMelee(CharacterClasses[characterClass], {
        Dexterity: { ArmorClass: 0, MissilesToHit: 1, Score: 14 },
        Strength: { Carry: 0, Damage: 0, Doors: '1-2', Score: 15, ToHit: 1 },
      } as Attributes)
      expect(result).toBe(expectedValue)
    })

    it.each([
      [CharacterClass.Assassin, '-2'],
      [CharacterClass.Cleric, '-2'],
      [CharacterClass.Druid, '-2'],
      [CharacterClass.Fighter, '-2'],
      [CharacterClass.MagicUser, '-2'],
      [CharacterClass.Monk, '-2'],
      [CharacterClass.Paladin, '-2'],
      [CharacterClass.Ranger, '-2'],
      [CharacterClass.Thief, '-2'],
    ])('should return the correct negative to-hit value for %s', (characterClass, expectedValue) => {
      const result = getToHitMelee(CharacterClasses[characterClass], {
        Dexterity: { ArmorClass: 0, MissilesToHit: 1, Score: 14 },
        Strength: { Carry: -10, Damage: -1, Doors: '1', Score: 4, ToHit: -2 },
      } as Attributes)
      expect(result).toBe(expectedValue)
    })

    it('should return the correct positive to-hit value for Fighters', () => {
      const result = getToHitMelee(CharacterClasses.Fighter, {
        Dexterity: { ArmorClass: 0, MissilesToHit: 1, Score: 14 },
        Strength: { Carry: 0, Damage: 0, Doors: '1-2', Score: 15, ToHit: 2 },
      } as Attributes)
      expect(result).toBe('+2')
    })

    it('should return the correct to-hit value for Fighter subclass', () => {
      const result = getToHitMelee(CharacterClasses.Paladin, {
        Dexterity: { ArmorClass: 0, MissilesToHit: 1, Score: 14 },
        Strength: { Carry: 0, Damage: 0, Doors: '1-2', Score: 15, ToHit: 2 },
      } as Attributes)
      expect(result).toBe('0')
    })

    it('should return the correct to-hit value for Paladin', () => {
      const result = getToHitMelee(CharacterClasses.Paladin, {
        Charisma: {
          MaxNumberOfSpecialHirelings: 5,
          Score: 13,
        },
        Constitution: { HitPoints: 0, RaiseDeadSurvivalChance: '75%', Score: 9 },
        Dexterity: { ArmorClass: 0, MissilesToHit: 0, Score: 10 },
        Intelligence: {
          MaxAdditionalLanguages: 2,
          MaxSpellLevel: 5,
          NewSpellUnderstandingChance: 50,
          Score: 10,
          SpellsPerLevel: '4/6',
        },
        Strength: {
          Carry: 30,
          Damage: 2,
          Doors: '1-4',
          Score: 17,
          ToHit: 2,
        },
        Wisdom: { Score: 8 },
      })
      expect(result).toBe('0')
    })

    it('should throw an error if baseToHit is not a number', () => {
      expect(() => {
        getToHitMelee(
          { name: 'InvalidClass' } as unknown as CharacterClassDef,
          {
            Dexterity: { ArmorClass: 0, MissilesToHit: 1, Score: 14 },
            Strength: { Carry: 0, Damage: 0, Doors: '1-2', Score: 15, ToHit: 1 },
          } as Attributes,
        )
      }).toThrow('Cannot get Base To-Hit for class: InvalidClass')
    })
  })

  describe('getToHitMissiles', () => {
    it.each([
      [CharacterClass.Assassin, '+1'],
      [CharacterClass.Cleric, '+1'],
      [CharacterClass.Druid, '+1'],
      [CharacterClass.Fighter, '+2'],
      [CharacterClass.MagicUser, '+1'],
      [CharacterClass.Monk, '+1'],
      [CharacterClass.Paladin, '+1'],
      [CharacterClass.Ranger, '+1'],
      [CharacterClass.Thief, '+1'],
    ])('should return the correct positive to-hit value for %s', (characterClass, expectedValue) => {
      const result = getToHitMissiles(CharacterClasses[characterClass], {
        Dexterity: { ArmorClass: 0, MissilesToHit: 1, Score: 14 },
        Strength: { Carry: 0, Damage: 0, Doors: '1-2', Score: 15, ToHit: 1 },
      } as Attributes)
      expect(result).toBe(expectedValue)
    })

    it('should throw an error if baseToHit is not a number', () => {
      expect(() => {
        getToHitMissiles(
          { name: 'InvalidClass' } as unknown as CharacterClassDef,
          {
            Dexterity: { ArmorClass: 0, MissilesToHit: 1, Score: 14 },
            Strength: { Carry: 0, Damage: 0, Doors: '1-2', Score: 15, ToHit: 1 },
          } as Attributes,
        )
      }).toThrow('Cannot get Base To-Hit for class: InvalidClass')
    })

    it('should return the correct positive to-hit value for Fighters', () => {
      const result = getToHitMissiles(CharacterClasses.Fighter, {
        Dexterity: { ArmorClass: 0, MissilesToHit: 1, Score: 14 },
        Strength: { Carry: 0, Damage: 0, Doors: '1-2', Score: 15, ToHit: 2 },
      } as Attributes)
      expect(result).toBe('+3')
    })
  })

  describe('getDamageModifier', () => {
    it('should return + for Fighters', () => {
      const result = getDamageModifier(CharacterClasses.Fighter, {
        Strength: { Carry: 50, Damage: 3, Doors: '1-5', Score: 18, ToHit: 2 },
      } as Attributes)
      expect(result).toBe('+3')
    })

    it.each([
      CharacterClass.Assassin,
      CharacterClass.Cleric,
      CharacterClass.Druid,
      CharacterClass.MagicUser,
      CharacterClass.Monk,
      CharacterClass.Paladin,
      CharacterClass.Ranger,
      CharacterClass.Thief,
    ])('should return 0 for non-Fighters %s', (className) => {
      const result = getDamageModifier(CharacterClasses[className], {
        Strength: { Carry: 50, Damage: 3, Doors: '1-5', Score: 18, ToHit: 2 },
      } as Attributes)
      expect(result).toBe('0')
    })

    it.each([
      CharacterClass.Assassin,
      CharacterClass.Cleric,
      CharacterClass.Druid,
      CharacterClass.MagicUser,
      CharacterClass.Monk,
      CharacterClass.Paladin,
      CharacterClass.Ranger,
      CharacterClass.Thief,
    ])('should return -1 for non-Fighters %s', (className) => {
      const result = getDamageModifier(CharacterClasses[className], {
        Strength: { Carry: -10, Damage: -1, Doors: '1', Score: 4, ToHit: -2 },
      } as Attributes)
      expect(result).toBe('-1')
    })
  })
})
