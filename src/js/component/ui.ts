import { initCharacterSectionUi } from './character.ui'
import { initEquipUi } from './equip.ui'
import { initEquipSetsUi } from './equipSets.ui'
import { initExportImportUi } from './export.ui'
import { initInventoryUi } from './inventory.ui'
import { subscribeToEvents } from './subscriptions'
import { initTabs } from './tabs'
import { renderErrorMessage } from './utils'

const main = (): void => {
  initTabs()
  subscribeToEvents()
  initEquipUi()
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
