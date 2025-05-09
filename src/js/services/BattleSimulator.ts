import { shuffleArray } from 'ttrpg-lib-dice'

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
  private readonly targetSelector: ITargetSelector
  private readonly strategy: ICombatStrategy
  private roundsCount: number = 0
  private readonly sidePlayers: Participant[]
  private readonly sideMonsters: Participant[]

  constructor(
    players: IPlayerCharacter[],
    monsters: IMonster[],
    strategyMode: Strategy,
    biasPlayers: number,
    biasMonsters: number,
    maxAttacksPerChar: number,
    private readonly logger: Logger,
  ) {
    this.targetSelector = new RandomTargetSelector()
    this.strategy = getStrategy(strategyMode)

    this.sidePlayers = players.map(
      (c) => new Participant(c, Side.Players, this.strategy, biasPlayers, maxAttacksPerChar, this.logger),
    )
    this.sideMonsters = monsters.map(
      (c) => new Participant(c, Side.Monsters, this.strategy, biasMonsters, maxAttacksPerChar, this.logger),
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
      this.roundsCount++
      this.participants.forEach((p) => p.resetAttackLimit())

      let anyAction = false
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
        if (!enemies.length) {
          continue
        }

        anyAction = true
        combatant.attack(enemies, this.targetSelector)
      }

      // if nobody attacked or was attacked this round, end battle
      if (!anyAction) {
        this.logger.warn('⏸️ No more valid attacks — ending simulation')
        break
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
