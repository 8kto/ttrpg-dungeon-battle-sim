import { Side } from '../types'
import type { Logger } from './Logger'
import { Participant } from './Participant'
import { getStrategy } from './strategies/getStrategy'
import type { ICombatStrategy } from './strategies/ICombatStrategy'
import type { ITargetSelector } from './TargetSelector'
import { RandomTargetSelector } from './TargetSelector'
import type { IMonster, IPlayerCharacter, Strategy } from './types'

type BattleResult = {
  winner: Side
  rounds: number
  survivors: Array<Participant>
}

export class BattleSimulator {
  private readonly participants: Participant[]
  private readonly targetSelector: ITargetSelector
  private readonly strategy: ICombatStrategy
  private roundsCount: number = 0

  constructor(
    sideA: IPlayerCharacter[],
    sideB: IMonster[],
    strategyMode: Strategy,
    biasPlayers: number,
    biasMonsters: number,
    maxAttacksPerChar: number,
    private readonly logger: Logger,
  ) {
    this.targetSelector = new RandomTargetSelector()
    this.strategy = getStrategy(strategyMode)

    this.participants = [
      ...sideA.map((c) => new Participant(c, Side.Players, this.strategy, biasPlayers, maxAttacksPerChar, this.logger)),
      ...sideB.map(
        (c) => new Participant(c, Side.Monsters, this.strategy, biasMonsters, maxAttacksPerChar, this.logger),
      ),
    ]
  }

  renderDetails(): this {
    this.participants.forEach((p) => {
      this.logger.log(`${p.side === Side.Monsters ? '🧌' : '🥷'}${p.char.name} HP: ${p.currentHp}`)
    })

    return this
  }

  hasSurvivors(side: Side): boolean {
    return this.participants.some((p) => p.side === side && p.currentHp > 0)
  }

  simulate(): BattleResult {
    // Round: goes while there are two sides
    while (this.hasSurvivors(Side.Players) && this.hasSurvivors(Side.Monsters)) {
      this.roundsCount++
      this.participants.forEach((p) => p.resetAttackLimit())

      this.logger.log(`>>> round ${this.roundsCount}`)

      // Each combatant does its attacks
      for (const combatant of this.participants) {
        if (combatant.currentHp <= 0) {
          continue
        }

        const enemies = this.participants.filter((e) => e.side !== combatant.side && e.isValidTarget())
        if (!enemies.length) {
          continue
        }

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
