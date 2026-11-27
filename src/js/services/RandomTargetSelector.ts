import { getRandomArrayItem } from 'ttrpg-lib-dice'

import type { ITargetSelector } from './ITargetSelector'
import type { Participant } from './Participant'

// Every attack picks a random target
export class RandomTargetSelector implements ITargetSelector {
  selectTarget(_attacker: Participant, enemies: Participant[]): Participant {
    return getRandomArrayItem(enemies)
  }
}
