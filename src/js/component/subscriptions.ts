import { getState } from '../state/State'
import { assert } from '../utils/assert'
import { dispatchEvent } from '../utils/event'
import {
  handleRemoveCharacter,
  handleRenderCharacterSection,
  handleRenderNewCharControlsSection,
  handleRenderNewRandomCharacter,
} from './character.ui'
import { handleRenderInventories, handleSelectInventory } from './inventory.ui'

/**
 * Run once
 */
export const subscribeToEvents = (): void => {
  document.addEventListener('SerializeState', () => {
    getState().serialize()
  })

  //---------------------------------------------------------------------------
  // Inventory
  //---------------------------------------------------------------------------

  document.addEventListener('RenderInventories', () => {
    handleRenderInventories()
  })

  document.addEventListener('SelectInventory', (event: CustomEvent) => {
    assert(event.detail.id, 'No inventory ID passed')
    handleSelectInventory(event.detail.id)
  })

  //---------------------------------------------------------------------------
  // Character
  //---------------------------------------------------------------------------

  document.addEventListener('RenderNewCharacterControlsSection', (event: CustomEvent) => {
    assert(event.detail.inventoryId, 'No inventory ID passed')
    handleRenderNewCharControlsSection(event.detail.inventoryId)
  })

  document.addEventListener('RenderNewRandomCharacter', (event: CustomEvent) => {
    assert(event.detail.inventoryId, 'No inventory ID passed')
    handleRenderNewRandomCharacter(event.detail.inventoryId)
    dispatchEvent('RenderNewCharacterControlsSection', { inventoryId: event.detail.inventoryId })
  })

  document.addEventListener('RenderCharacterSection', (event: CustomEvent) => {
    assert(event.detail.inventoryId, 'No inventory ID passed')
    handleRenderCharacterSection(event.detail.inventoryId)
  })

  document.addEventListener('RemoveCharacter', (event: CustomEvent) => {
    assert(event.detail.inventoryId, 'No inventory ID passed')
    handleRemoveCharacter(event.detail.inventoryId)
    dispatchEvent('RenderNewCharacterControlsSection', { inventoryId: event.detail.inventoryId })
  })
}
