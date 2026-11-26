import type { Participant } from './Participant'

export interface ITargetSelector {
  // enemies are the valid targets only: alive and not exhausted by the attack limit
  selectTarget(attacker: Participant, enemies: Participant[]): Participant
}
