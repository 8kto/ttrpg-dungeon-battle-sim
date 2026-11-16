export type Range = Readonly<{ min: number; max: number }>

export type CharacterLimits = Readonly<{
  armorClass: Range
  hitDice: Range
  save: Range
  toHit: Range
}>

// Allowed ranges (inclusive) of numeric characteristics
export const DEFAULT_LIMITS: CharacterLimits = Object.freeze({
  armorClass: { max: 20, min: 6 },
  hitDice: { max: 50, min: 1 },
  save: { max: 20, min: 6 },
  toHit: { max: 10, min: -5 },
})

export const isInRange = (value: number, { max, min }: Range): boolean =>
  Number.isInteger(value) && value >= min && value <= max

export const formatRange = ({ max, min }: Range): string => `${min}..${max}`
