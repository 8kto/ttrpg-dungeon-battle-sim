// Number of a form field as typed: "12.5" stays 12.5 (unlike parseInt) and an empty field is NaN (unlike Number)
export const parseNumber = (value: string): number => (value.trim() === '' ? NaN : Number(value))

// A bonus with its sign: 2 → "+2", -2 → "-2", 0 → "0"
export const signed = (n: number): string => (n > 0 ? `+${n}` : String(n))
