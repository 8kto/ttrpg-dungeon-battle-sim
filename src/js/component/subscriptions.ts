import { getState } from '../state/State'
import { assert } from '../utils/assert'
import { dispatchEvent, subscribe } from '../utils/event'
import {
  handleRemoveCharacter,
  handleRenderCharacterSection,
  handleRenderNewCharControlsSection,
  handleRenderNewRandomCharacter,
} from './character.ui'
import { handleRenderInventories, handleRenderInventory, handleSelectInventory } from './inventory.ui'

/**
 * Run once
 */
export const subscribeToEvents = (): void => {
  subscribe('SerializeState', () => {
    getState().serialize()
  })

  //---------------------------------------------------------------------------
  // Inventory
  //---------------------------------------------------------------------------

  subscribe('RenderInventory', (event: CustomEvent<{ inventoryId: string; inventoryName?: string }>) => {
    assert(event.detail.inventoryId, 'No inventory ID passed')
    handleRenderInventory(event.detail.inventoryId, event.detail?.inventoryName)
  })

  subscribe('RenderInventories', () => {
    handleRenderInventories()
  })

  subscribe('SelectInventory', (event: CustomEvent<{ inventoryId: string }>) => {
    assert(event.detail.inventoryId, 'No inventory ID passed')
    handleSelectInventory(event.detail.inventoryId)
  })

  //---------------------------------------------------------------------------
  // Character
  //---------------------------------------------------------------------------

  subscribe('RenderNewCharacterControlsSection', (event: CustomEvent<{ inventoryId: string }>) => {
    assert(event.detail.inventoryId, 'No inventory ID passed')
    handleRenderNewCharControlsSection(event.detail.inventoryId)
  })

  subscribe('RenderNewRandomCharacter', (event: CustomEvent<{ inventoryId: string }>) => {
    assert(event.detail.inventoryId, 'No inventory ID passed')
    handleRenderNewRandomCharacter(event.detail.inventoryId)
    dispatchEvent('RenderNewCharacterControlsSection', { inventoryId: event.detail.inventoryId })
  })

  subscribe('RenderCharacterSection', (event: CustomEvent<{ inventoryId: string }>) => {
    assert(event.detail.inventoryId, 'No inventory ID passed')
    handleRenderCharacterSection(event.detail.inventoryId)
  })

  subscribe('RemoveCharacter', (event: CustomEvent<{ inventoryId: string }>) => {
    assert(event.detail.inventoryId, 'No inventory ID passed')
    handleRemoveCharacter(event.detail.inventoryId)
    dispatchEvent('RenderNewCharacterControlsSection', { inventoryId: event.detail.inventoryId })
  })
}
