import { Dice } from '../../domain/Dice'
import { roll, rollDiceFormula } from '../../utils/dice'
import type { Logger } from './Logger'
import type { ICharacter, ICombatStrategy, IMonster, IPlayerCharacter } from './types'
import { Strategy } from './types'

type BattleResult = {
  winner: 'Players' | 'Monsters'
  rounds: number
  survivors: Array<ICharacter & { currentHp: number }>
}

class AverageStrategy implements ICombatStrategy {
  calculateHp([count, dice]: [number, Dice]): number {
    const avgPerDie = Math.ceil(dice / 2)

    return count * avgPerDie
  }
  calculateDamage(damage: string): number {
    // return Math.ceil(dice / 2)
    return 0 // FIXME
  }
}

class RandomStrategy implements ICombatStrategy {
  calculateHp([count, dice]: [number, Dice]): number {
    let sum = 0
    for (let i = 0; i < count; i++) {
      sum += roll(dice)
    }

    return sum
  }
  calculateDamage(damage: string): number {
    return rollDiceFormula(damage)
  }
}

interface ITargetSelector {
  selectTarget(attacker: Participant, enemies: Participant[]): Participant
}

class RandomTargetSelector implements ITargetSelector {
  selectTarget(_attacker: Participant, enemies: Participant[]): Participant {
    const idx = Math.floor(Math.random() * enemies.length)

    return enemies[idx]
  }
}

class Participant {
  public currentHp: number

  constructor(
    public readonly char: ICharacter,
    public readonly side: 'Players' | 'Monsters',
    strategy: ICombatStrategy,
    private readonly logger: Logger,
  ) {
    this.currentHp = strategy.calculateHp(char.hitDice)
  }

  attack(enemies: Participant[], strategy: ICombatStrategy, targetSelector: ITargetSelector): void {
    for (const dmgDice of this.char.damage) {
      const living = enemies.filter((e) => e.currentHp > 0)
      if (living.length === 0) {
        break
      }

      const target = targetSelector.selectTarget(this, living)
      const attackRoll = roll(Dice.d20) + this.char.toHit
      if (attackRoll >= target.char.armorClass) {
        const dmg = strategy.calculateDamage(dmgDice)
        target.currentHp -= dmg

        this.logger.log(`🗡️ ${this.char.name} attacks ${target.char.name}, damage: ${dmg}`)

        if (target.currentHp <= 0) {
          this.logger.log(`💀️ ${target.char.name} is dead`)
        }
      } else {
        this.logger.log(`🛡️ ${this.char.name} misses ${target.char.name}`)
      }
    }
  }
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
      ...sideA.map((c) => new Participant(c, 'Players', this.strategy, this.logger)),
      ...sideB.map((c) => new Participant(c, 'Monsters', this.strategy, this.logger)),
    ]
  }

  renderDetails(): this {
    this.participants.forEach((p) => {
      this.logger.log(`${p.side === 'Monsters' ? '🧌' : '🥷'}${p.char.name} HP: ${p.currentHp}`)
    })

    return this
  }

  simulate(): BattleResult {
    const isAlive = (side: 'Players' | 'Monsters'): boolean =>
      this.participants.some((p) => p.side === side && p.currentHp > 0)

    while (isAlive('Players') && isAlive('Monsters')) {
      this.roundsCount++
      let battleOver = false

      for (const p of this.participants) {
        if (p.currentHp <= 0) {
          continue
        }
        const enemies = this.participants.filter((e) => e.side !== p.side && e.currentHp > 0)
        p.attack(enemies, this.strategy, this.targetSelector)

        if (!isAlive('Players') || !isAlive('Monsters')) {
          battleOver = true
          break
        }
      }
      if (battleOver) {
        break
      }
    }

    const winner: 'Players' | 'Monsters' = isAlive('Players') ? 'Players' : 'Monsters'
    const survivors = this.participants
      .filter((p) => p.currentHp > 0)
      .map((p) => ({ ...p.char, currentHp: p.currentHp }))

    return {
      rounds: this.roundsCount,
      survivors,
      winner,
    }
  }
}
