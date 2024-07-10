import { CharacterClasses } from '../../../config/snw/CharacterClasses'
import { CharacterClass, CharacterClassDef } from '../../../domain/snw/CharacterClass'
import { CharacterStats } from '../../../domain/snw/CharacterStats'
import { getToHitMelee, getToHitMissiles } from '../combat'

// Mock data for CharacterStats
describe('getToHitMelee', () => {
  it.each([
    [CharacterClass.Assassin, 0],
    [CharacterClass.Cleric, 0],
    [CharacterClass.Druid, 0],
    [CharacterClass.Fighter, 1],
    [CharacterClass.MagicUser, 0],
    [CharacterClass.Monk, 0],
    [CharacterClass.Paladin, 0],
    [CharacterClass.Ranger, 0],
    [CharacterClass.Thief, 0],
  ])('should return the correct 0-1 to-hit value for %s', (characterClass, expectedValue) => {
    const result = getToHitMelee(CharacterClasses[characterClass], {
      Dexterity: { ArmorClass: 0, MissilesToHit: 1, Score: 14 },
      Strength: { Carry: 0, Damage: 0, Doors: '1-2', Score: 15, ToHit: 1 },
    } as CharacterStats)
    expect(result).toBe(expectedValue)
  })

  it.each([
    [CharacterClass.Assassin, -2],
    [CharacterClass.Cleric, -2],
    [CharacterClass.Druid, -2],
    [CharacterClass.Fighter, -2],
    [CharacterClass.MagicUser, -2],
    [CharacterClass.Monk, -2],
    [CharacterClass.Paladin, -2],
    [CharacterClass.Ranger, -2],
    [CharacterClass.Thief, -2],
  ])('should return the correct negative to-hit value for %s', (characterClass, expectedValue) => {
    const result = getToHitMelee(CharacterClasses[characterClass], {
      Dexterity: { ArmorClass: 0, MissilesToHit: 1, Score: 14 },
      Strength: { Carry: 0, Damage: 0, Doors: '1-2', Score: 15, ToHit: -2 },
    } as CharacterStats)
    expect(result).toBe(expectedValue)
  })

  it('should return the correct positive to-hit value for Fighters', () => {
    const result = getToHitMelee(CharacterClasses.Fighter, {
      Dexterity: { ArmorClass: 0, MissilesToHit: 1, Score: 14 },
      Strength: { Carry: 0, Damage: 0, Doors: '1-2', Score: 15, ToHit: 2 },
    } as CharacterStats)
    expect(result).toBe(2)
  })

  it('should throw an error if baseToHit is not a number', () => {
    expect(() => {
      getToHitMelee(
        { name: 'InvalidClass' } as unknown as CharacterClassDef,
        {
          Dexterity: { ArmorClass: 0, MissilesToHit: 1, Score: 14 },
          Strength: { Carry: 0, Damage: 0, Doors: '1-2', Score: 15, ToHit: 1 },
        } as CharacterStats,
      )
    }).toThrow('Cannot get Base To-Hit for class: InvalidClass')
  })
})

describe('getToHitMissiles', () => {
  it.each([
    [CharacterClass.Assassin, 1],
    [CharacterClass.Cleric, 1],
    [CharacterClass.Druid, 1],
    [CharacterClass.Fighter, 2],
    [CharacterClass.MagicUser, 1],
    [CharacterClass.Monk, 1],
    [CharacterClass.Paladin, 1],
    [CharacterClass.Ranger, 1],
    [CharacterClass.Thief, 1],
  ])('should return the correct positive to-hit value for %s', (characterClass, expectedValue) => {
    const result = getToHitMissiles(CharacterClasses[characterClass], {
      Dexterity: { ArmorClass: 0, MissilesToHit: 1, Score: 14 },
      Strength: { Carry: 0, Damage: 0, Doors: '1-2', Score: 15, ToHit: 1 },
    } as CharacterStats)
    expect(result).toBe(expectedValue)
  })

  it('should throw an error if baseToHit is not a number', () => {
    expect(() => {
      getToHitMissiles(
        { name: 'InvalidClass' } as unknown as CharacterClassDef,
        {
          Dexterity: { ArmorClass: 0, MissilesToHit: 1, Score: 14 },
          Strength: { Carry: 0, Damage: 0, Doors: '1-2', Score: 15, ToHit: 1 },
        } as CharacterStats,
      )
    }).toThrow('Cannot get Base To-Hit for class: InvalidClass')
  })

  it('should return the correct positive to-hit value for Fighters', () => {
    const result = getToHitMissiles(CharacterClasses.Fighter, {
      Dexterity: { ArmorClass: 0, MissilesToHit: 1, Score: 14 },
      Strength: { Carry: 0, Damage: 0, Doors: '1-2', Score: 15, ToHit: 2 },
    } as CharacterStats)
    expect(result).toBe(3)
  })
})
