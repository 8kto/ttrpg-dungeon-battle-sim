import { getState } from '../state/State'
import { handleNewRandomCharInit, renderCharSection } from './character.ui'
import { markSelectedInventory, renderInventories } from './inventory.ui'

export const subscribeToEvents = (): void => {
  document.addEventListener('RenderInventories', () => {
    renderInventories()
  })

  document.addEventListener('RenderNewRandomCharacter', (event: CustomEvent) => {
    if (!event.detail.inventoryId) {
      throw new Error('No inventory ID passed')
    }

    handleNewRandomCharInit(event.detail.inventoryId)
  })

  document.addEventListener('SerializeState', () => {
    getState().serializeInventories()
  })

  document.addEventListener('SelectInventory', (event: CustomEvent) => {
    if (!event.detail.id) {
      throw new Error('No inventory ID passed')
    }

    getState().setCurrentInventoryId(event.detail.id)
    markSelectedInventory(event.detail.id)
  })

  document.addEventListener('RenderCharacterSection', (event: CustomEvent) => {
    if (!event.detail.inventoryId) {
      throw new Error('No inventory ID passed')
    }

    const inventoryId = event.detail.inventoryId
    const inventory = getState().getInventory(inventoryId)

    if (inventory.character?.classDef && inventory.character?.stats) {
      renderCharSection(inventoryId, inventory.character.classDef, inventory.character.stats)
      document.querySelector(`#${inventory.id}-inventory-controls-top-section`).classList.add('hidden')
    }
  })
}
