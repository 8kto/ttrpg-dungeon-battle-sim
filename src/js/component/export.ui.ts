import { AllEquipment } from '../config/snw/Equip'
import { getState } from '../state/State'
import { dispatchEvent } from '../utils/event'
import { getDumpJsonContainer } from './domSelectors'
import { showModal } from './modal'

export const bindConversionControls = (): void => {
  const allowOnlyExistingCheckbox = document.getElementById('equip-import-allow-only-existing') as HTMLInputElement

  document.getElementById('convert-button').addEventListener('click', function () {
    const state = getState()
    const isStrictEquality = !!allowOnlyExistingCheckbox.checked
    const currentInventoryId = state.getCurrentInventoryId()
    const input = (document.getElementById('equipment-input') as HTMLInputElement).value
    const itemList = input.split('\n') // Split input by new lines to get individual items
    const notFoundItems = [] // To store items not found in the lists

    itemList.forEach((itemName) => {
      const cleanedItemName = itemName.trim().toLowerCase()

      const item = AllEquipment.find((i) => i.name.toLowerCase() === cleanedItemName)
      if (item) {
        state.addToInventory(currentInventoryId, item)
      } else if (isStrictEquality) {
        notFoundItems.push(itemName)
      } else {
        // TODO some qty/weight modifiers?
        state.addToInventory(currentInventoryId, {
          cost: 0,
          name: itemName,
          weight: 0,
        })
      }
    })

    // Update the error output
    if (notFoundItems.length > 0) {
      document.getElementById('error-output').textContent = `Items not found: ${notFoundItems.join(', ')}`
    } else {
      document.getElementById('error-output').textContent = ''
    }

    dispatchEvent('RenderInventory', { inventoryId: currentInventoryId })
  })
}

export const bindDumpingControls = (): void => {
  const inputContainer = getDumpJsonContainer()

  document.getElementById('dump-json-button').addEventListener('click', () => {
    inputContainer.textContent = getState().getSerializedInventories()
  })

  document.getElementById('copy-json-button').addEventListener('click', function () {
    const textToCopy = inputContainer.value

    // Create a temporary textarea element to hold the text
    const tempTextArea = document.createElement('textarea')
    tempTextArea.value = textToCopy
    document.body.appendChild(tempTextArea)

    // Select the text and copy it to the clipboard
    tempTextArea.select()
    document.execCommand('copy')

    // Remove the temporary textarea element
    document.body.removeChild(tempTextArea)

    void showModal({
      message: 'Copied to clipboard!',
      title: 'Import',
      type: 'modal',
    })
  })
}

const bindImportControls = (): void => {
  const inputContainer: HTMLTextAreaElement = getDumpJsonContainer()

  document.getElementById('import-json-button').addEventListener('click', async () => {
    const isConfirmed = await showModal({
      message: `Importing JSON will overwrite the existing state`,
      title: 'Import',
      type: 'confirm',
    })

    if (!isConfirmed) {
      return false
    }

    let json = null

    try {
      json = JSON.parse(inputContainer.value)
    } catch (err) {
      console.error(err)
      void showModal({
        message: 'Error: could not parse the serialized data, check JSON syntax',
        title: 'Import',
        type: 'modal',
      })

      return false
    }

    const keys = Object.keys(json)
    const inventoryId = json[keys[0]]?.id
    if (json && inventoryId) {
      getState().setInventories(json)
      void showModal({
        message: 'Success: data imported',
        title: 'Import',
        type: 'modal',
      })
      dispatchEvent('RenderInventories')
      dispatchEvent('SelectInventory', { inventoryId })
    }
  })
}

/**
 * Run once
 */
export const initExportImportUi = (): void => {
  bindConversionControls()
  bindDumpingControls()
  bindImportControls()
}

// TODO add some schema for data validation
// TODO buttons to download file and upload
