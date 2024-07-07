export const assert: <T>(variable: T | undefined | null, msg?: string) => asserts variable is T =
  <T>(variable: T | undefined | null, msg: string = 'Not defined'): asserts variable is T => {
    if (!variable) {
      throw new Error(msg)
    }
  }
