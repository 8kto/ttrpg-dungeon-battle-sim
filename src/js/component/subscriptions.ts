import { getState } from '../state/State'
import { handleNewRandomCharInit } from './character.ui'
import { markSelectedInventory, renderInventories } from './inventory.ui'

export const subscribeToEvents = (): void => {
  document.addEventListener('SelectInventory', (event: CustomEvent) => {
    if (!event.detail.id) {
      throw new Error('No inventory ID passed')
    }

    getState().setCurrentInventoryId(event.detail.id)
    markSelectedInventory(event.detail.id)
  })

  document.addEventListener('RenderInventories', () => {
    renderInventories()
  })

  document.addEventListener('RenderNewRandomCharacter', () => {
    handleNewRandomCharInit()
  })

  document.addEventListener('SerializeState', () => {
    getState().serializeInventories()
  })
}
