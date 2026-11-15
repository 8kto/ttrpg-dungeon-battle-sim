import { applyFeatureFlagClasses, isFeatureEnabled, parseFeatureFlags } from '../featureFlags'

describe('parseFeatureFlags', () => {
  it('returns nothing without the ff param', () => {
    expect(parseFeatureFlags('')).toEqual([])
    expect(parseFeatureFlags('?bg=desk')).toEqual([])
  })

  it('reads comma separated flags and drops unknown ones', () => {
    expect(parseFeatureFlags('?ff=desk-bg')).toEqual(['desk-bg'])
    expect(parseFeatureFlags('?ff=unknown, desk-bg')).toEqual(['desk-bg'])
  })
})

describe('isFeatureEnabled', () => {
  it('checks a single flag', () => {
    expect(isFeatureEnabled('desk-bg', '?ff=desk-bg')).toBe(true)
    expect(isFeatureEnabled('desk-bg', '?ff=other')).toBe(false)
  })
})

describe('applyFeatureFlagClasses', () => {
  it('adds a class per flag', () => {
    const target = document.createElement('body')

    applyFeatureFlagClasses('?ff=desk-bg', target)

    expect(Array.from(target.classList)).toEqual(['ff--desk-bg'])
  })
})
