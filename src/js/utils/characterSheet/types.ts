import { CharacterClass } from '../../domain/snw/CharacterClass'

export const CasterClasses = [CharacterClass.Cleric, CharacterClass.MagicUser, CharacterClass.Druid] as const

export type CasterClass = (typeof CasterClasses)[number]
