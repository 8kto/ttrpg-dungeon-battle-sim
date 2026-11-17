import { applyFeatureFlagClasses, parseFeatureFlags } from '../featureFlags'

const known = ['demo', 'other']

describe('parseFeatureFlags', () => {
  it('returns nothing without the ff param', () => {
    expect(parseFeatureFlags('', known)).toEqual([])
    expect(parseFeatureFlags('?bg=demo', known)).toEqual([])
  })

  it('reads comma separated flags and drops unknown ones', () => {
    expect(parseFeatureFlags('?ff=demo', known)).toEqual(['demo'])
    expect(parseFeatureFlags('?ff=unknown, other,demo', known)).toEqual(['other', 'demo'])
  })

  it('ignores flags that are not registered', () => {
    expect(parseFeatureFlags('?ff=demo')).toEqual([])
  })
})

describe('applyFeatureFlagClasses', () => {
  it('adds a class per flag', () => {
    const target = document.createElement('body')

    applyFeatureFlagClasses('?ff=demo,other', target, known)

    expect(Array.from(target.classList)).toEqual(['ff--demo', 'ff--other'])
  })
})
