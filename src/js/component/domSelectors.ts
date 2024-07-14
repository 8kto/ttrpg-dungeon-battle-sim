export const getInventoryContainer = (inventoryId: string): HTMLElement => {
  return document.getElementById(`${inventoryId}-container`)
}

export const getCompactModeAffectedElements = (inventoryId: string): NodeListOf<HTMLElement> => {
  return getInventoryContainer(inventoryId).querySelectorAll<HTMLElement>('[data-compact-hidden]')
}

export const getInventoryTablesContainer = (): HTMLElement => {
  return document.getElementById('inventories-container')
}
