import {
  CharismaModifiers,
  ConstitutionModifiers,
  DexterityModifiers,
  IntelligenceModifiers,
  StrengthModifiers,
} from '../Modifiers'

describe('Modifiers', () => {
  it('CHA should match the snapshot', () => {
    expect(CharismaModifiers).toMatchSnapshot()
  })
  it('CON should match the snapshot', () => {
    expect(ConstitutionModifiers).toMatchSnapshot()
  })
  it('DEX should match the snapshot', () => {
    expect(DexterityModifiers).toMatchSnapshot()
  })
  it('INT should match the snapshot', () => {
    expect(IntelligenceModifiers).toMatchSnapshot()
  })
  it('STR should match the snapshot', () => {
    expect(StrengthModifiers).toMatchSnapshot()
  })
})
