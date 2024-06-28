import { AllEquipment } from '../Equip'

describe('Equip', () => {
  it('should match the snapshot', () => {
    expect(AllEquipment).toMatchSnapshot()
  })
})
