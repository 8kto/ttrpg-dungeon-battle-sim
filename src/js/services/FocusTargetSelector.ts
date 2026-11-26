import { getRandomArrayItem } from 'ttrpg-lib-dice'

import type { ITargetSelector } from './ITargetSelector'
import type { Participant } from './Participant'

// An attacker sticks to one target until one of them dies or is petrified; holds the state of a single battle
export class FocusTargetSelector implements ITargetSelector {
  private readonly focus: Map<Participant, Participant> = new Map()

  selectTarget(attacker: Participant, enemies: Participant[]): Participant {
    const current = this.focus.get(attacker)
    if (current && enemies.includes(current)) {
      return current
    }
    // a living target that can't be attacked this round (attack limit) keeps the focus
    const target = getRandomArrayItem(enemies)
    if (!current || !current.isActive) {
      this.focus.set(attacker, target)
    }

    return target
  }
}
