// Throws on null/undefined and on a failed condition (false); other falsy values (0, '') are valid
export const assert: <T>(variable: T | undefined | null, msg?: string) => asserts variable is T = <T>(
  variable: T | undefined | null,
  msg: string = 'Not defined',
): asserts variable is T => {
  // eslint-disable-next-line no-undefined
  if (variable === undefined || variable === null || variable === false) {
    throw new Error(msg)
  }
}
