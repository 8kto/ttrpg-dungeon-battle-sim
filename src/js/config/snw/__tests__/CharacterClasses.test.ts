import { CharacterClasses } from '../CharacterClasses'

describe('characterClasses', () => {
  it('should match the snapshot', () => {
    expect(CharacterClasses).toMatchSnapshot()
  })
})
