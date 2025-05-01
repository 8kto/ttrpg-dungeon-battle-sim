/* eslint-disable no-console */

// TODO mercenaries
import { Dice } from '../../domain/Dice'
import { BattleSimulator } from './BattleSimulator'
import type { IMonster, IPlayerCharacter } from './types'
import { Strategy } from './types'

const createPlayerChars = (num: number): IPlayerCharacter[] => {
  const res: IPlayerCharacter[] = []

  for (let i = 0; i < num; i++) {
    res.push({
      armorClass: 14,
      damage: 'd6',
      hitDice: [4, Dice.d6],
      name: `Player ${i}`,
      toHit: 1,
    })
  }

  return res
}

const $1HD_Monster: IMonster = {
  armorClass: 12,
  damage: 'd6',
  hitDice: [1, Dice.d6],
  name: 'Monster with 1HD',
  toHit: 1,
}

const $4HD_Monster: IMonster = {
  armorClass: 12,
  damage: 'd6, d6',
  hitDice: [4, Dice.d6],
  name: 'Monster with 4HD',
  toHit: 4,
}

export const battleSimulator = (): void => {
  const players = createPlayerChars(3)
  // const monsters = [$1HD_Monster, $1HD_Monster, $1HD_Monster, $1HD_Monster, $1HD_Monster]
  const monsters = [$4HD_Monster, $4HD_Monster, $4HD_Monster]
  const runs = 100

  // Функция для прогонки N боёв по заданной стратегии
  const collectWinStats = (strategy: Strategy): void => {
    let winsA = 0
    let winsB = 0

    for (let i = 0; i < runs; i++) {
      const sim = new BattleSimulator(players, monsters, strategy)
      const result = sim.simulate()
      if (result.winner === 'Players') {
        winsA++
      } else {
        winsB++
      }
    }

    console.log(
      `Strategy ${Strategy[strategy]} — Players win: ${((winsA / runs) * 100).toFixed(1)}%, ` +
        `Monsters win: ${((winsB / runs) * 100).toFixed(1)}%`,
    )
  }

  // Прогоняем для обеих стратегий
  // collectWinStats(Strategy.Average)
  collectWinStats(Strategy.Random)

  // Симуляция с рандомной стратегией:
  // const simRnd = new BattleSimulator(players, monsters, Strategy.Random, new RandomTargetSelector())
  // console.log('Random strategy:', simRnd.simulate())
}
