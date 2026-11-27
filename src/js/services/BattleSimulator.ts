import { shuffleArray } from 'ttrpg-lib-dice'

import type { SimulationSettings } from '../types'
import { Side } from '../types'
import { AttackOptionsCache } from './attacks/AttackOptionsCache'
import { DamageFormula } from './attacks/DamageFormula'
import { DamageSerializer } from './attacks/DamageSerializer'
import type { IAttackOptionsCache } from './attacks/IAttackOptionsCache'
import type { IDamageFormula } from './attacks/IDamageFormula'
import type { IDamageSerializer } from './attacks/IDamageSerializer'
import type { EffectCounters } from './attacks/types'
import type { IBattleSimulator } from './IBattleSimulator'
import type { ITargetSelector } from './ITargetSelector'
import type { ILogger } from './logger/ILogger'
import { messages } from './messages/MessageService'
import { Participant } from './Participant'
import { getStrategy } from './strategies/getStrategy'
import type { ICombatStrategy } from './strategies/ICombatStrategy'
import { getTargetSelector } from './TargetSelector'
import type { ICharacter, IMonster, IPlayerCharacter } from './types'
import { Initiative } from './types'

// Guards against endless battles (nobody can hit, everybody skips turns, etc.)
export const MAX_ROUNDS = 1000

export type BattleResult = {
  winner: Side | null // null is a draw: round limit reached, or nobody left to fight
  rounds: number
  survivors: Array<Participant>
  effects: EffectCounters
}

// Subset of simulation settings that affects a single battle
export type BattleSettings = Pick<
  SimulationSettings,
  'strategy' | 'rounding' | 'targeting' | 'initiative' | 'biasPlayers' | 'biasMonsters' | 'maxAttacksPerTarget'
>

export class BattleSimulator implements IBattleSimulator {
  private readonly targetSelector: ITargetSelector
  private readonly strategy: ICombatStrategy
  private roundsCount: number = 0
  private readonly sidePlayers: Participant[]
  private readonly sideMonsters: Participant[]
  private readonly effectCounters: EffectCounters = {}
  private readonly initiative: Initiative
  private fixedOrder: Participant[][] | null = null

  constructor(
    players: IPlayerCharacter[],
    monsters: IMonster[],
    private readonly logger: ILogger,
    { biasMonsters, biasPlayers, initiative, maxAttacksPerTarget, rounding, strategy, targeting }: BattleSettings,
    // the parsed damage of the characters, shared by the battles of a simulation
    attackOptions: IAttackOptionsCache = new AttackOptionsCache(),
    // stateless services, shared by the participants of the battle
    damageFormula: IDamageFormula = new DamageFormula(),
    damageSerializer: IDamageSerializer = new DamageSerializer(),
  ) {
    this.initiative = initiative
    this.targetSelector = getTargetSelector(targeting)
    this.strategy = getStrategy(strategy, rounding)

    const join = (char: ICharacter, side: Side, bias: number): Participant =>
      new Participant(
        char,
        side,
        this.strategy,
        bias,
        maxAttacksPerTarget,
        this.logger,
        this.effectCounters,
        attackOptions,
        damageFormula,
        damageSerializer,
      )
    this.sidePlayers = players.map((c) => join(c, Side.Players, biasPlayers))
    this.sideMonsters = monsters.map((c) => join(c, Side.Monsters, biasMonsters))
  }

  get participants(): Participant[] {
    return this.sidePlayers.concat(this.sideMonsters)
  }

  renderDetails(): this {
    if (!this.logger.isVerbose()) {
      return this
    }

    this.participants.forEach((p) => {
      const key = p.side === Side.Monsters ? 'battle.hp.monster' : 'battle.hp.player'
      this.logger.log(messages.t(key, { hp: p.currentHp, name: p.char.name }))
    })

    return this
  }

  getSortedByInitiative(): Participant[][] {
    if (this.initiative === Initiative.Random) {
      return shuffleArray([this.sidePlayers, this.sideMonsters])
    }

    // Fixed: rolled in the first round, kept until the end of the battle
    this.fixedOrder ??= shuffleArray([this.sidePlayers, this.sideMonsters])

    return this.fixedOrder
  }

  // a side whose fighters are all dead or petrified, even for a while, loses to a side that can fight
  hasSurvivors(side: Side): boolean {
    return this.participants.some((p) => p.side === side && p.isActive)
  }

  // Both sides fight; or neither can, but a statue comes back to life later: the rounds go on until a side has
  // fighters again, it wins unless the other one gets them in the same round
  private isOngoing(): boolean {
    const players = this.hasSurvivors(Side.Players)
    const monsters = this.hasSurvivors(Side.Monsters)
    if (players !== monsters) {
      return false
    }

    return players || this.participants.some((p) => p.willRevive)
  }

  // the side that can fight; null when nobody can: all dead or petrified for good
  private getWinner(): Side | null {
    if (this.hasSurvivors(Side.Players)) {
      return Side.Players
    }

    return this.hasSurvivors(Side.Monsters) ? Side.Monsters : null
  }

  private initiativeMessage(sides: Participant[][]): string {
    return messages.t(sides[0] === this.sidePlayers ? 'battle.initiative.players' : 'battle.initiative.monsters')
  }

  simulate(): BattleResult {
    if (this.initiative === Initiative.Fixed && this.logger.isVerbose()) {
      this.logger.log(
        messages.t('battle.initiative.fixed', { initiative: this.initiativeMessage(this.getSortedByInitiative()) }),
      )
    }

    while (this.isOngoing()) {
      if (this.roundsCount >= MAX_ROUNDS) {
        this.logger.log(messages.t('battle.roundLimit', { max: MAX_ROUNDS }))

        return {
          effects: this.effectCounters,
          rounds: this.roundsCount,
          survivors: this.participants.filter((p) => p.isActive),
          winner: null,
        }
      }

      this.roundsCount++
      this.participants.forEach((p) => p.resetAttackLimit())

      const sides = this.getSortedByInitiative()
      const combatants = shuffleArray(sides[0]).concat(shuffleArray(sides[1]))

      if (this.logger.isVerbose()) {
        // Fixed initiative is logged once before the battle
        this.logger.log(
          this.initiative === Initiative.Random
            ? messages.t('battle.roundWithInitiative', {
                initiative: this.initiativeMessage(sides),
                round: this.roundsCount,
              })
            : messages.t('battle.round', { round: this.roundsCount }),
        )
      }

      // Each combatant does its attacks
      for (const combatant of combatants) {
        if (combatant.currentHp <= 0 || !combatant.startTurn()) {
          continue
        }

        const enemies = combatant.side === Side.Players ? this.sideMonsters : this.sidePlayers
        combatant.attack(enemies, this.targetSelector)
      }

      this.participants.forEach((p) => p.endRound())
    }

    const winner = this.getWinner()
    if (winner === null) {
      this.logger.log(messages.t('battle.noFighters'))
    }
    const survivors = this.participants.filter((p) => p.isActive)

    return {
      effects: this.effectCounters,
      rounds: this.roundsCount,
      survivors,
      winner,
    }
  }
}
