// Freezes an object with everything it holds, so data shared by several users can't be changed by one of them
export const deepFreeze = <T>(value: T): T => {
  if (typeof value === 'object' && value !== null) {
    Object.values(value).forEach(deepFreeze)
    Object.freeze(value)
  }

  return value
}
