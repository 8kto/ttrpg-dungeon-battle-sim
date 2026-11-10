// sums and differences of dice and integers: "d6+d4", "2d6 - 1", "5"
const FORMULA_RE = /^(\d*d\d+|\d+)(\s*[+-]\s*(\d*d\d+|\d+))*$/i
const TERM_RE = /([+-]?)\s*(?:(\d*)d(\d+)|(\d+))/gi

// Maximum value of any formula the Random strategy accepts, e.g. "d6+d4" → 10
// TODO migrate to dice lib
export const getMaxDamage = (formula: string): number => {
  const text = formula.trim()
  if (!FORMULA_RE.test(text)) {
    throw new Error(`Invalid damage formula: "${formula}"`)
  }

  let total = 0
  for (const [, sign, count, sides, constant] of text.matchAll(TERM_RE)) {
    const value = sides ? (count ? parseInt(count, 10) : 1) * parseInt(sides, 10) : parseInt(constant, 10)
    total += sign === '-' ? -value : value
  }

  return total
}
