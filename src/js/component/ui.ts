import { initCharacterSectionUi } from './character.ui'
import { initEquipSetsUi } from './equipSets.ui'
import { initExportImportUi } from './export.ui'
import { initInventoryUi } from './inventory.ui'
import { subscribeToEvents } from './subscriptions'
import { renderErrorMessage } from './utils'

const main = (): void => {
  subscribeToEvents()
  initInventoryUi()
  initCharacterSectionUi()
  initEquipSetsUi()
  initExportImportUi()
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    main()
  } catch (err) {
    console.error(err)

    renderErrorMessage(
      'Error during page initialization. Try refreshing, clearing the cache, or using a different browser.',
    )
  }
})
