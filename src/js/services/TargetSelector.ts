import { getRandomArrayItem } from 'ttrpg-lib-dice'

import type { Participant } from './Participant'

export interface ITargetSelector {
  selectTarget(enemies: Participant[]): Participant
}

export class RandomTargetSelector implements ITargetSelector {
  selectTarget(enemies: Participant[]): Participant {
    return getRandomArrayItem(enemies)
  }
}
