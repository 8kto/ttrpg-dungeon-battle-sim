import { EquipSets } from '../EquipSets'

describe('EquipSets', () => {
  it('should match the snapshot', () => {
    expect(EquipSets).toMatchSnapshot()
  })
})
