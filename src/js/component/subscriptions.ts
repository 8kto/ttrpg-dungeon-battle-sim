import { getState } from '../state/State'
import { assert } from '../utils/assert'
import { handleNewRandomCharacterInit, renderCharacterSection, renderNewCharControlsSection } from './character.ui'
import { markSelectedInventory, renderInventories } from './inventory.ui'

/**
 * Run once
 */
export const subscribeToEvents = (): void => {
  document.addEventListener('SerializeState', () => {
    getState().serializeInventories()
  })

  /**
   ** Inventory
   **/

  document.addEventListener('RenderInventories', () => {
    renderInventories()
  })

  document.addEventListener('SelectInventory', (event: CustomEvent) => {
    assert(event.detail.id, 'No inventory ID passed')

    getState().setCurrentInventoryId(event.detail.id)
    markSelectedInventory(event.detail.id)
  })

  /**
   ** Character
   **/

  document.addEventListener('RenderNewRandomCharacter', (event: CustomEvent) => {
    assert(event.detail.inventoryId, 'No inventory ID passed')
    handleNewRandomCharacterInit(event.detail.inventoryId)
    renderNewCharControlsSection(event.detail.inventoryId)
  })

  document.addEventListener('RenderCharacterSection', (event: CustomEvent) => {
    assert(event.detail.inventoryId, 'No inventory ID passed')

    const inventoryId = event.detail.inventoryId
    const inventory = getState().getInventory(inventoryId)

    if (inventory.character?.classDef && inventory.character?.stats) {
      renderCharacterSection(inventoryId, inventory.character.classDef, inventory.character.stats)
      // document.querySelector(`#${inventory.id}-inventory-controls-top-section`).classList.add('hidden')
    }
  })
}

// FIXME any logic/condition should be put in the called funcs
