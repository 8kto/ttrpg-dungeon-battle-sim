import type { Participant } from './Participant'

export interface ITargetSelector {
  selectTarget(attacker: Participant, enemies: Participant[]): Participant
}

export class RandomTargetSelector implements ITargetSelector {
  selectTarget(_attacker: Participant, enemies: Participant[]): Participant {
    const idx = Math.floor(Math.random() * enemies.length)

    return enemies[idx]
  }
}
