// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable sort-keys-fix/sort-keys-fix,no-console,@typescript-eslint/no-var-requires */
const fs = require('fs')
const { PDFDocument } = require('pdf-lib')
const { exportedStats } = require('./__tests__/mocks.js')

/** @type {import('js/domain/Inventory').Inventory} */
const testInventory = Object.values(exportedStats)[0]

/**
 * @type {Record<string, string>}
 */
const MAP_FIELDS_TO_CHAR_ATTRS = {
  // Header Left
  'Class 2': 'character.classDef.name',
  'Alignment 2': 'character.alignment',
  'Ancestry 2': 'character.ancestry',
  'LEVEL 2': 'character.level',
  'Experience Points (XP) 2': 'character.experiencePoints',
  'Prime Attribute 2': 'character.classDef.PrimeAttr', // array
  'XP Bonus 2': 'character.experiencePointsBonus',

  // Header right
  'Hit Points 2': 'character.hitPoints',
  'Saving Throw 2': 'character.classDef.SavingThrow',
  'Armor Class 2': 'character.armorClass', // struct

  // Attributes
  'Strength 2': 'character.stats.Strength.Score',
  'Dexterity 2': 'character.stats.Dexterity.Score',
  'Constitution 2': 'character.stats.Constitution.Score',
  'Intelligence 2': 'character.stats.Intelligence.Score',
  'Wisdom 2': 'character.stats.Wisdom.Score',
  'Charisma 2': 'character.stats.Charisma.Score',

  // Attribute Bonuses
  'Bonus to Hit (STR) 2': 'character.stats.Strength.ToHit',
  'Open Doors (STR) 2': 'character.stats.Strength.Doors',
  'Damage Bonus (STR) 2': 'character.stats.Strength.Damage',
  'Carry Modifier (STR) 2': 'character.stats.Strength.Carry',
  'Bonus to Missiles (DEX) 2': 'character.stats.Dexterity.MissilesToHit',
  'Armor Bonus (DEX) 2': 'character.stats.Dexterity.ArmorClass',
  'Hit Point Bonus (CON) 2': 'character.stats.Constitution.HitPoints',
  'Raise Dead Survival (CON) 2': 'character.stats.Constitution.RaiseDeadSurvivalChance',
  'Additional Languages 2': 'character.stats.Intelligence.MaxAdditionalLanguages',
  'Max and # of Special Hirelings 2': 'character.stats.Charisma.MaxNumberOfSpecialHirelings',

  // Gold & Treasure
  'Coins 2': 'character.gold',
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

  'character.classDef.PrimeAttr':
    /**
     * @param {import('js/domain/snw/CharacterClass').PrimeAttribute[]} val
     * @returns {string}
     */
    (val) => val.map(([k]) => k.toUpperCase().slice(0, 3)).join(', '),

  'character.experiencePointsBonus': (val) => `${val}%`,

  'character.classDef.name': (name) => {
    return name.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase())
  },
  default: (val) => {
    if (Array.isArray(val)) {
      return val.join(',')
    } else if (typeof val === 'object') {
      val = JSON.stringify(val)
    }

    return val?.toString()
  },
}

/**
 * @param {import('js/domain/Inventory').Inventory} inventory
 * @param {string} fieldName
 */
const getAttrValue = (inventory, fieldName) => {
  const path = MAP_FIELDS_TO_CHAR_ATTRS[fieldName]

  if (!path) {
    0 && console.error(`Unhandled field: "${fieldName}"`)

    return null
  }

  const formatter = Formatter[path] ?? Formatter.default
  const chunks = path.split('.')
  let max = chunks.length
  let res = inventory

  while (max--) {
    res = res[chunks.shift()]
  }

  return formatter(res)
}

/**
 * @param {PDFForm} form
 * @param {import('js/domain/Inventory').Inventory} inventory
 */
const processFields = (form, inventory) => {
  form.getFields().forEach((field) => {
    const fieldName = field.getName()
    const value = getAttrValue(inventory, fieldName)

    if (value) {
      field.setText(value.toString())
    } else {
      field.setText(fieldName)
    }
  })
}

const sortEquipmentItems = (a, b) => {
  // 0 — ascArmorClass
  // 1 — damage
  // 2 — other
  const priority = (item) => {
    if (item.ascArmorClass != null) {
      return 0
    }
    if (item.damage != null) {
      return 1
    }

    return 2
  }

  const pA = priority(a)
  const pB = priority(b)

  if (pA !== pB) {
    return pA - pB
  }

  if (pA === 0) {
    return b.ascArmorClass - a.ascArmorClass || a.name.localeCompare(b.name)
  }

  return a.name.localeCompare(b.name)
}

/**
 * @param {PDFForm} form
 * @param {Record<string, import('js/domain/Inventory').InventoryItem>} itemsMap
 */
const processEquipment = (form, itemsMap) => {
  // These are set in the PDF file
  const base = 'Items and Equipment '
  const minId = 2
  const maxId = 9

  const items = Object.values(itemsMap).sort(sortEquipmentItems)
  const labels = items.map((item) => {
    let sfx = ''
    if (item.ascArmorClass) {
      sfx = '**'
    }
    if (item.damage) {
      sfx = '*'
    }

    return item.quantity > 1 ? `${item.name}${sfx} (${item.quantity})` : `${item.name}${sfx}`
  })

  const numFields = maxId - minId + 1
  const totalItems = labels.length

  let itemIndex = 0

  for (let fieldIndex = 0; fieldIndex < numFields; fieldIndex++) {
    const remainingFields = numFields - fieldIndex
    const remainingItems = totalItems - itemIndex

    if (remainingItems <= 0) {
      break
    }

    const itemsInField = Math.ceil(remainingItems / remainingFields)
    const group = labels.slice(itemIndex, itemIndex + itemsInField).join('; ')

    const fieldName = base + (minId + fieldIndex)
    form.getField(fieldName).setText(group)

    itemIndex += itemsInField
  }
}

/**
 * @param params {object}
 * @param {string} params.inputPath
 * @param {string} params.outputPath
 * @param {import('js/domain/Inventory').Inventory} params.inventory
 * @returns {Promise<void>}
 */
const main = async (params) => {
  const { inputPath, inventory, outputPath } = params

  try {
    const existingPdfBytes = fs.readFileSync(inputPath)
    const pdfDoc = await PDFDocument.load(existingPdfBytes)
    const form = pdfDoc.getForm()

    processFields(form, inventory)
    processEquipment(form, inventory.items)

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
  inventory: testInventory,
})
