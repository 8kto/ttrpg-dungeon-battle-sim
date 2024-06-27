import { EquipSets } from '../equipment'

describe('EquipSets', () => {
  it('should match the snapshot', () => {
    expect(EquipSets).toMatchSnapshot()
  })
})
