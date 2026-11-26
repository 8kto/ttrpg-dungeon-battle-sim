import { getRandomArrayItem } from 'ttrpg-lib-dice'

import { FocusTargetSelector } from '../FocusTargetSelector'
import type { Participant } from '../Participant'
import { RandomTargetSelector } from '../RandomTargetSelector'
import { getTargetSelector } from '../TargetSelector'
import { Targeting } from '../types'

jest.mock('ttrpg-lib-dice', () => ({
  ...jest.requireActual('ttrpg-lib-dice'),
  getRandomArrayItem: jest.fn(),
}))

// isActive as in Participant: alive and not petrified
const makeParticipant = (name: string, currentHp = 5): Participant =>
  ({
    char: { name },
    currentHp,
    get isActive(): boolean {
      return this.currentHp > 0 && !this.isPetrified
    },
    isPetrified: false,
  }) as Participant

describe('TargetSelector', () => {
  const randomItem = getRandomArrayItem as jest.Mock
  const attacker = makeParticipant('Fighter')
  const goblin = makeParticipant('Goblin')
  const orc = makeParticipant('Orc')

  beforeEach(() => {
    randomItem.mockReset()
  })

  describe('RandomTargetSelector', () => {
    it('picks a random target on every attack', () => {
      randomItem.mockReturnValueOnce(goblin).mockReturnValueOnce(orc)
      const selector = new RandomTargetSelector()

      expect(selector.selectTarget(attacker, [goblin, orc])).toBe(goblin)
      expect(selector.selectTarget(attacker, [goblin, orc])).toBe(orc)
    })
  })

  describe('FocusTargetSelector', () => {
    it('sticks to the first target while it is valid', () => {
      randomItem.mockReturnValueOnce(goblin).mockReturnValue(orc)
      const selector = new FocusTargetSelector()

      expect(selector.selectTarget(attacker, [goblin, orc])).toBe(goblin)
      expect(selector.selectTarget(attacker, [goblin, orc])).toBe(goblin)
      expect(selector.selectTarget(attacker, [orc, goblin])).toBe(goblin)
      expect(randomItem).toHaveBeenCalledTimes(1)
    })

    it('keeps a separate focus for every attacker', () => {
      randomItem.mockReturnValueOnce(goblin).mockReturnValueOnce(orc)
      const selector = new FocusTargetSelector()
      const cleric = makeParticipant('Cleric')

      selector.selectTarget(attacker, [goblin, orc])
      selector.selectTarget(cleric, [goblin, orc])

      expect(selector.selectTarget(attacker, [goblin, orc])).toBe(goblin)
      expect(selector.selectTarget(cleric, [goblin, orc])).toBe(orc)
    })

    it('picks a new target when the focused one dies', () => {
      const victim = makeParticipant('Kobold')
      randomItem.mockReturnValueOnce(victim).mockReturnValue(orc)
      const selector = new FocusTargetSelector()

      selector.selectTarget(attacker, [victim, orc])
      victim.currentHp = 0

      expect(selector.selectTarget(attacker, [orc])).toBe(orc)
      expect(selector.selectTarget(attacker, [goblin, orc])).toBe(orc)
    })

    it('picks a new target when the focused one is petrified', () => {
      const victim = makeParticipant('Kobold') as Participant & { isPetrified: boolean }
      randomItem.mockReturnValueOnce(victim).mockReturnValue(orc)
      const selector = new FocusTargetSelector()

      selector.selectTarget(attacker, [victim, orc])
      victim.isPetrified = true

      expect(selector.selectTarget(attacker, [orc])).toBe(orc)
      expect(selector.selectTarget(attacker, [goblin, orc])).toBe(orc)
    })

    it('attacks someone else but keeps the focus while the target is out of attack slots', () => {
      randomItem.mockReturnValueOnce(goblin).mockReturnValue(orc)
      const selector = new FocusTargetSelector()

      selector.selectTarget(attacker, [goblin, orc])

      // goblin is alive but not among valid targets this round
      expect(selector.selectTarget(attacker, [orc])).toBe(orc)
      expect(selector.selectTarget(attacker, [goblin, orc])).toBe(goblin)
    })
  })

  it.each([
    [Targeting.Random, RandomTargetSelector],
    [Targeting.Focus, FocusTargetSelector],
  ])('creates a selector for targeting %s', (targeting, type) => {
    expect(getTargetSelector(targeting)).toBeInstanceOf(type)
  })
})
