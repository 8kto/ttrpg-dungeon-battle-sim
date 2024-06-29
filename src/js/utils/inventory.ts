export const getInventoryIdFromName = (name: string): string => {
  return name.toLowerCase().replace(/\s+/g, '-') + new Date().getTime()
}
