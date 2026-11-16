import { Rounding, Strategy } from '../types'
import { AverageStrategy } from './AverageStrategy'
import type { ICombatStrategy } from './ICombatStrategy'
import { MaxStrategy } from './MaxStrategy'
import { RandomStrategy } from './RandomStrategy'

// Rounding matters only for the Average strategy, the others always produce whole numbers
export const getStrategy = (strategyMode: Strategy, rounding: Rounding = Rounding.Up): ICombatStrategy => {
  switch (strategyMode) {
    case Strategy.Average:
      return new AverageStrategy(rounding)

    case Strategy.Random:
      return new RandomStrategy()

    case Strategy.Max:
      return new MaxStrategy()

    default:
      throw new Error(`Unknown strategyMode: ${strategyMode}`)
  }
}
