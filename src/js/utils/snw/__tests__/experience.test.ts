import { CharacterClasses } from '../../../config/snw/CharacterClasses'
import { Attributes } from '../../../domain/snw/Attributes'
import { getExperienceBonus } from '../experience'

describe('experience utils', () => {
  describe('getExperienceBonus', () => {
    it('should count WIS bonuses', () => {
      expect(
        getExperienceBonus(CharacterClasses.Fighter, {
          Charisma: { Score: 11 },
          Wisdom: { Score: 13 },
        } as Attributes),
      ).toEqual(5)
    })

    it('should count CHA bonuses', () => {
      expect(
        getExperienceBonus(CharacterClasses.Fighter, {
          Charisma: { Score: 16 },
          Wisdom: { Score: 3 },
        } as Attributes),
      ).toEqual(5)
    })

    it('should count WIS and CHA bonuses', () => {
      expect(
        getExperienceBonus(CharacterClasses.Fighter, {
          Charisma: { Score: 13 },
          Wisdom: { Score: 13 },
        } as Attributes),
      ).toEqual(10)
    })

    it('should count primary attrs bonuses / Fighter', () => {
      expect(
        getExperienceBonus(CharacterClasses.Fighter, {
          Charisma: { Score: 11 },
          Strength: { Score: 14 },
          Wisdom: { Score: 12 },
        } as Attributes),
      ).toEqual(5)
    })

    it('should count primary attrs bonuses / Assassin', () => {
      expect(
        getExperienceBonus(CharacterClasses.Assassin, {
          Charisma: { Score: 11 },
          Dexterity: { Score: 14 },
          Intelligence: { Score: 13 },
          Strength: { Score: 14 },
          Wisdom: { Score: 12 },
        } as Attributes),
      ).toEqual(5)
    })

    it('should count primary attrs bonuses / Cleric', () => {
      expect(
        getExperienceBonus(CharacterClasses.Cleric, {
          Charisma: { Score: 11 },
          Dexterity: { Score: 14 },
          Intelligence: { Score: 13 },
          Strength: { Score: 14 },
          Wisdom: { Score: 15 },
        } as Attributes),
      ).toEqual(10)
    })

    it('should all bonuses / Cleric', () => {
      expect(
        getExperienceBonus(CharacterClasses.Cleric, {
          Charisma: { Score: 15 },
          Dexterity: { Score: 14 },
          Intelligence: { Score: 13 },
          Strength: { Score: 14 },
          Wisdom: { Score: 15 },
        } as Attributes),
      ).toEqual(15)
    })

    it('should count primary attrs bonuses / Druid', () => {
      expect(
        getExperienceBonus(CharacterClasses.Druid, {
          Charisma: { Score: 15 },
          Dexterity: { Score: 14 },
          Intelligence: { Score: 13 },
          Strength: { Score: 14 },
          Wisdom: { Score: 15 },
        } as Attributes),
      ).toEqual(15)
    })

    it('should count primary attrs bonuses / MagicUser', () => {
      expect(
        getExperienceBonus(CharacterClasses.MagicUser, {
          Charisma: { Score: 11 },
          Dexterity: { Score: 14 },
          Intelligence: { Score: 16 },
          Strength: { Score: 14 },
          Wisdom: { Score: 12 },
        } as Attributes),
      ).toEqual(5)
    })

    it('should count primary attrs bonuses / Monk', () => {
      expect(
        getExperienceBonus(CharacterClasses.Monk, {
          Charisma: { Score: 11 },
          Dexterity: { Score: 14 },
          Intelligence: { Score: 16 },
          Strength: { Score: 14 },
          Wisdom: { Score: 14 },
        } as Attributes),
      ).toEqual(10)
    })

    it('should count primary attrs bonuses / Paladin', () => {
      expect(
        getExperienceBonus(CharacterClasses.Paladin, {
          Charisma: { Score: 11 },
          Dexterity: { Score: 14 },
          Intelligence: { Score: 16 },
          Strength: { Score: 14 },
          Wisdom: { Score: 12 },
        } as Attributes),
      ).toEqual(5)
    })

    it('should count primary attrs bonuses / Ranger', () => {
      expect(
        getExperienceBonus(CharacterClasses.Ranger, {
          Charisma: { Score: 11 },
          Dexterity: { Score: 14 },
          Intelligence: { Score: 16 },
          Strength: { Score: 14 },
          Wisdom: { Score: 12 },
        } as Attributes),
      ).toEqual(5)
    })

    it('should count primary attrs bonuses / Thief', () => {
      expect(
        getExperienceBonus(CharacterClasses.Thief, {
          Charisma: { Score: 11 },
          Dexterity: { Score: 14 },
          Intelligence: { Score: 16 },
          Strength: { Score: 14 },
          Wisdom: { Score: 12 },
        } as Attributes),
      ).toEqual(5)
    })

    it('should count all bonuses / Thief', () => {
      expect(
        getExperienceBonus(CharacterClasses.Thief, {
          Charisma: { Score: 13 },
          Constitution: { Score: 16 },
          Dexterity: { Score: 14 },
          Intelligence: { Score: 16 },
          Strength: { Score: 14 },
          Wisdom: { Score: 16 },
        } as Attributes),
      ).toEqual(15)
    })
  })
})
