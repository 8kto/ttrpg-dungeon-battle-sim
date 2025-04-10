// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable sort-keys-fix/sort-keys-fix,no-console,@typescript-eslint/no-var-requires */
const fs = require('fs')
const { PDFDocument } = require('pdf-lib')
const { exportedStats } = require('./__tests__/mocks.js')

/** @type {import('js/domain/Inventory').Inventory} */
const char = exportedStats.MainCharacter

/**
 * @type {Record<string, string>}
 */
const MAP_FIELDS_TO_CHAR_ATTRS = {
  'Class 2': 'character.classDef.name',
  'Hit Points 2': 'character.hitPoints',

  'Strength 2': 'character.stats.Strength.Score',
  'Dexterity 2': 'character.stats.Dexterity.Score',
  'Constitution 2': 'character.stats.Constitution.Score',
  'Intelligence 2': 'character.stats.Intelligence.Score',
  'Wisdom 2': 'character.stats.Wisdom.Score',
  'Charisma 2': 'character.stats.Charisma.Score',

  'Ancestry 2': 'character.ancestry',
  'Alignment': 'character.alignment',
  'LEVEL 2': 'character.level',
  'Saving Throw 2': 'character.classDef.SavingThrow',
  'Prime Attribute': 'character.classDef.PrimeAttr', // array
  'Armor Class 2': 'character.armorClass', // struct
  'Experience Points (XP) 2': 'character.experiencePoints',
  'XP Bonus 2': 'character.classDef.experiencePointsBonus',
}

const Formatter = {
  'character.classDef.SavingThrow':
    /**
     * @param {import('js/domain/snw/SavingThrow').SavingThrow} val
     * @returns {string}
     */
    (val) => val.snw.value,
  'character.armorClass':
    /**
     * @param {import('js/domain/snw/Character').ArmorClass} val
     * @returns {string}
     */
      (val) => `${val.dac}[${val.aac}]`,
  default: (val) => {
    if (Array.isArray(val)) {
      return val.join(',')
    }
    else if (typeof val === 'object') {
      val = JSON.stringify(val)
    }

    return val?.toString()
  },
}

/**
 * @param {import('js/domain/Inventory').Character} char
 * @param {string} path
 */
const getAttrValue = (char, path) => {
  const formatter = Formatter[path] ?? Formatter.default

  if (path?.startsWith('character.')) {
    const chunks = path.split('.')
    let max = chunks.length
    let res = char

    while (max--) {
      res = res[chunks.shift()]
    }

    return formatter(res)
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

    form.getFields().forEach((field) => {
      const fieldName = field.getName()
      const value = getAttrValue(char, MAP_FIELDS_TO_CHAR_ATTRS[fieldName])

      if (value) {
        field.setText(value.toString())
      } else {
        // f.setText(fieldName)
      }
    })

    // Optional: make the form non-editable
    // form.flatten()

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
