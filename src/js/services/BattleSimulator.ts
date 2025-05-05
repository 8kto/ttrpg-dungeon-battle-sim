import { Side } from '../types'
import type { Logger } from './Logger'
import { Participant } from './Participant'
import { AverageStrategy } from './strategies/AverageStrategy'
import type { ICombatStrategy } from './strategies/ICombatStrategy'
import { RandomStrategy } from './strategies/RandomStrategy'
import type { ITargetSelector } from './TargetSelector'
import { RandomTargetSelector } from './TargetSelector'
import type { IMonster, IPlayerCharacter } from './types'
import { Strategy } from './types'

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
    private readonly logger: Logger,
  ) {
    this.targetSelector = new RandomTargetSelector()
    this.strategy = strategyMode === Strategy.Average ? new AverageStrategy() : new RandomStrategy()

    this.participants = [
      ...sideA.map((c) => new Participant(c, Side.Players, this.strategy, this.logger)),
      ...sideB.map((c) => new Participant(c, Side.Monsters, this.strategy, this.logger)),
    ]
  }

  renderDetails(): this {
    this.participants.forEach((p) => {
      this.logger.log(`${p.side === Side.Monsters ? '🧌' : '🥷'}${p.char.name} HP: ${p.currentHp}`)
    })

    return this
  }

  simulate(): BattleResult {
    const isAlive = (side: Side): boolean => this.participants.some((p) => p.side === side && p.currentHp > 0)

    while (isAlive(Side.Players) && isAlive(Side.Monsters)) {
      this.roundsCount++
      this.logger.log(`>>> round ${this.roundsCount}`)
      let battleOver = false

      for (const p of this.participants) {
        if (p.currentHp <= 0) {
          continue
        }
        const enemies = this.participants.filter((e) => e.side !== p.side && e.currentHp > 0)
        p.attack(enemies, this.strategy, this.targetSelector)

        if (!isAlive(Side.Players) || !isAlive(Side.Monsters)) {
          battleOver = true
          break
        }
      }
      if (battleOver) {
        break
      }
    }

    const winner: Side = isAlive(Side.Players) ? Side.Players : Side.Monsters
    const survivors = this.participants.filter((p) => p.currentHp > 0)

    return {
      rounds: this.roundsCount,
      survivors,
      winner,
    }
  }
}
