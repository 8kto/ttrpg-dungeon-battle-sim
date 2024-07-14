const { getAllClassesInventory } = require('./mocks.js')

module.exports = async (page) => {
  // Listen for console errors and log them
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error(`Browser console error: ${msg.text()}`)
    }
  })

  const state = getAllClassesInventory()
  state['character-name1720287054445'].isCompact = true
  state['character-name1720287096634'].isCompact = true
  state['MainCharacter'].isCompact = true

  // Restore all 9 classes from serialized string
  await page.evaluateOnNewDocument((allClassesInventory) => {
    localStorage.setItem('s&w-generator', JSON.stringify(allClassesInventory))
  }, state)

  await page.goto('http://localhost:3000', { waitUntil: 'load' })
}
