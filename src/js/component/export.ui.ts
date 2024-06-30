import { AllEquipment } from '../config/snw/Equip'
import { getState } from '../state/State'
import { renderInventory } from './inventory.ui'

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

    // FIXME event
    renderInventory(currentInventoryId)
  })
}

export const bindDumpingControls = (): void => {
  const container = document.getElementById('dump-domain-container--json-container')

  document.getElementById('dump-json-button').addEventListener('click', () => {
    container.textContent = getState().getSerializeInventories()
  })

  document.getElementById('copy-json-button').addEventListener('click', function () {
    const textToCopy = container.textContent

    // Create a temporary textarea element to hold the text
    const tempTextArea = document.createElement('textarea')
    tempTextArea.value = textToCopy
    document.body.appendChild(tempTextArea)

    // Select the text and copy it to the clipboard
    tempTextArea.select()
    document.execCommand('copy')

    // Remove the temporary textarea element
    document.body.removeChild(tempTextArea)

    alert('Copied to clipboard!')
  })
}

export const initExportImportUi = (): void => {
  bindConversionControls()
  bindDumpingControls()
}
