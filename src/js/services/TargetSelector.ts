import { getRandomArrayItem } from 'ttrpg-lib-dice'

import type { Participant } from './Participant'
import { Targeting } from './types'

export interface ITargetSelector {
  // enemies are the valid targets only: alive and not exhausted by the attack limit
  selectTarget(attacker: Participant, enemies: Participant[]): Participant
}

// Every attack picks a random target
export class RandomTargetSelector implements ITargetSelector {
  selectTarget(_attacker: Participant, enemies: Participant[]): Participant {
    return getRandomArrayItem(enemies)
  }
}

// An attacker sticks to one target until one of them dies; holds the state of a single battle
export class FocusTargetSelector implements ITargetSelector {
  private readonly focus: Map<Participant, Participant> = new Map()

  selectTarget(attacker: Participant, enemies: Participant[]): Participant {
    const current = this.focus.get(attacker)
    if (current && enemies.includes(current)) {
      return current
    }
    // a living target that can't be attacked this round (attack limit) keeps the focus
    const target = getRandomArrayItem(enemies)
    if (!current || current.currentHp <= 0) {
      this.focus.set(attacker, target)
    }

    return target
  }
}

export const getTargetSelector = (targeting: Targeting): ITargetSelector => {
  switch (targeting) {
    case Targeting.Focus:
      return new FocusTargetSelector()
    case Targeting.Random:
      return new RandomTargetSelector()
  }
}
