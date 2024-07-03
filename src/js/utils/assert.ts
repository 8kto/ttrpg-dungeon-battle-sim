export const assert = (variable: unknown, msg: string = 'Not defined'): void => {
  if (!variable) {
    throw new Error(msg)
  }
}
