import { shuffleArray } from 'ttrpg-lib-dice'

import { Side } from '../types'
import type { ILogger } from './ILogger'
import { Participant } from './Participant'
import { getStrategy } from './strategies/getStrategy'
import type { ICombatStrategy } from './strategies/ICombatStrategy'
import type { ITargetSelector } from './TargetSelector'
import { RandomTargetSelector } from './TargetSelector'
import type { IMonster, IPlayerCharacter, Rounding, Strategy } from './types'

// Guards against endless battles (nobody can hit, everybody skips turns, etc.)
export const MAX_ROUNDS = 1000

type BattleResult = {
  winner: Side | null // null is a draw: round limit reached
  rounds: number
  survivors: Array<Participant>
}

export class BattleSimulator {
  private readonly targetSelector: ITargetSelector
  private readonly strategy: ICombatStrategy
  private roundsCount: number = 0
  private readonly sidePlayers: Participant[]
  private readonly sideMonsters: Participant[]

  constructor(
    players: IPlayerCharacter[],
    monsters: IMonster[],
    strategyMode: Strategy,
    rounding: Rounding,
    biasPlayers: number,
    biasMonsters: number,
    maxAttacksPerTarget: number,
    private readonly logger: ILogger,
  ) {
    this.targetSelector = new RandomTargetSelector()
    this.strategy = getStrategy(strategyMode, rounding)

    this.sidePlayers = players.map(
      (c) => new Participant(c, Side.Players, this.strategy, biasPlayers, maxAttacksPerTarget, this.logger),
    )
    this.sideMonsters = monsters.map(
      (c) => new Participant(c, Side.Monsters, this.strategy, biasMonsters, maxAttacksPerTarget, this.logger),
    )
  }

  get participants(): Participant[] {
    return this.sidePlayers.concat(this.sideMonsters)
  }

  renderDetails(): this {
    this.participants.forEach((p) => {
      this.logger.log(`${p.side === Side.Monsters ? '🧌' : '🥷'}${p.char.name} HP: ${p.currentHp}`)
    })

    return this
  }

  getSortedByInitiative(): Participant[][] {
    return shuffleArray([this.sidePlayers, this.sideMonsters])
  }

  hasSurvivors(side: Side): boolean {
    return this.participants.some((p) => p.side === side && p.currentHp > 0)
  }

  simulate(): BattleResult {
    // Round: goes while there are two sides
    while (this.hasSurvivors(Side.Players) && this.hasSurvivors(Side.Monsters)) {
      if (this.roundsCount >= MAX_ROUNDS) {
        this.logger.log(`⏸️ Round limit (${MAX_ROUNDS}) reached — draw`)

        return {
          rounds: this.roundsCount,
          survivors: this.participants.filter((p) => p.currentHp > 0),
          winner: null,
        }
      }

      this.roundsCount++
      this.participants.forEach((p) => p.resetAttackLimit())

      const sides = this.getSortedByInitiative()
      const combatants = shuffleArray(sides[0]).concat(shuffleArray(sides[1]))
      const initiativeSfx = combatants[0].side === Side.Players ? 'players won initiative' : 'monsters won initiative'

      this.logger.log(`>>> round ${this.roundsCount}, ${initiativeSfx}`)

      // Each combatant does its attacks
      for (const combatant of combatants) {
        if (combatant.currentHp <= 0) {
          continue
        }

        // The target will be chosen randomly
        const enemies = combatant.side === Side.Players ? this.sideMonsters : this.sidePlayers
        combatant.attack(enemies, this.targetSelector)
      }
    }

    const winner: Side = this.hasSurvivors(Side.Players) ? Side.Players : Side.Monsters
    const survivors = this.participants.filter((p) => p.currentHp > 0)

    return {
      rounds: this.roundsCount,
      survivors,
      winner,
    }
  }
}
