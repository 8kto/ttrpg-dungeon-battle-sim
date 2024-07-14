const { getAllClassesInventory } = require('./mocks.js')

module.exports = async (page) => {
  // Listen for console errors and log them
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error(`Browser console error: ${msg.text()}`)
    }
  })

  // Restore all 9 classes from serialized string
  await page.evaluateOnNewDocument((allClassesInventory) => {
    localStorage.setItem('s&w-generator', JSON.stringify(allClassesInventory))
  }, getAllClassesInventory())

  await page.goto('http://localhost:3000', { waitUntil: 'load' })
}
