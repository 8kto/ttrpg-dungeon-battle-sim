// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable sort-keys-fix/sort-keys-fix,no-console,@typescript-eslint/no-var-requires */
const fs = require('fs')
const { PDFDocument } = require('pdf-lib')
const { exportedStats } = require('./__tests__/mocks.js')
// const { CharacterClasses } = require('../config/snw/CharacterClasses')

/** @type {import('js/domain/Inventory').Inventory} */
const char = exportedStats.MainCharacter

// /** @type {import('js/domain/snw/CharacterClass').CharacterClassDef} */
// const classDef = CharacterClasses[char.character.characterClass]

/**
 * @type {Record<string, string>}
 */
const MAP_FIELDS_TO_CHAR_ATTRS = {
  'Class 2': 'character.characterClass',
  'Hit Points 2': 'character.hitPoints',
  'Strength 2': 'character.stats.Strength.Score',
  'Dexterity 2': 'character.stats.Dexterity.Score',
  'Constitution 2': 'character.stats.Constitution.Score',
  'Intelligence 2': 'character.stats.Intelligence.Score',
  'Wisdom 2': 'character.stats.Wisdom.Score',
  'Charisma 2': 'character.stats.Charisma.Score',

  // 'ancestry': 'Ancestry 2'
  // 'level': 'LEVEL 2'
  //   'Experience Points (XP) 2',
  //   'Prime Attribute'
  //   'XP Bonus 2'
  //   'classDef.SavingThrow': 'Saving Throw 2',
  // 'Armor Class 2',
}

/**
 * @param {import('js/domain/Inventory').Character} char
 * @param {string} path
 */
const getAttrValue = (char, path) => {
  if (path?.startsWith('character.')) {
    const chunks = path.split('.')
    let max = chunks.length
    let res = char

    while (max--) {
      res = res[chunks.shift()]
    }

    return res
  }

  return null
}

/**
 * @param params {object}
 * @param {string} params.inputPath
 * @param {string} params.outputPath
 * @param {import('js/domain/Inventory').Character} params.char
 * @returns {Promise<void>}
 */
const main = async (params) => {
  const { char, inputPath, outputPath } = params
  try {
    // Read input PDF without modifying it
    const existingPdfBytes = fs.readFileSync(inputPath)
    const pdfDoc = await PDFDocument.load(existingPdfBytes)

    const form = pdfDoc.getForm()

    form.getFields().forEach((f) => {
      const fieldName = f.getName()
      const value = getAttrValue(char, MAP_FIELDS_TO_CHAR_ATTRS[fieldName])

      if (value) {
        const nameField = form.getTextField(fieldName)
        nameField.setText(value.toString())
      }
    })

    // Optional: make the form non-editable
    form.flatten()

    // Save to output file (original input untouched)
    const pdfBytes = await pdfDoc.save()
    fs.writeFileSync(outputPath, pdfBytes)

    console.log(`✅ Done! New file saved at: ${outputPath}`)
  } catch (err) {
    console.error('❌ Failed to fill PDF:', err)
  }
}

// CLI args
const [, , inputPath, outputPath] = process.argv

if (!inputPath || !outputPath) {
  console.error('❌ Usage: node fill.js <input.pdf> <output.pdf>')
  process.exit(1)
}

void main({
  inputPath,
  outputPath,
  char,
})
