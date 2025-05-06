import { Strategy } from '../types'
import { AverageStrategy } from './AverageStrategy'
import type { ICombatStrategy } from './ICombatStrategy'
import { MaxStrategy } from './MaxStrategy'
import { RandomStrategy } from './RandomStrategy'

export const getStrategy = (strategyMode: Strategy): ICombatStrategy => {
  switch (strategyMode) {
    case Strategy.Average:
      return new AverageStrategy()

    case Strategy.Random:
      return new RandomStrategy()

    case Strategy.Max:
      return new MaxStrategy()

    default:
      throw new Error(`Unknown strategyMode: ${strategyMode}`)
  }
}
