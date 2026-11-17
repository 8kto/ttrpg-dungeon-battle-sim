import type { BattleResult } from './BattleSimulator'

// A single battle between the players and the monsters
export interface IBattleSimulator {
  // logs participants' stats before the battle
  renderDetails(): this
  simulate(): BattleResult
}
