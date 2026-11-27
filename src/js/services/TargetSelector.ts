import { FocusTargetSelector } from './FocusTargetSelector'
import type { ITargetSelector } from './ITargetSelector'
import { RandomTargetSelector } from './RandomTargetSelector'
import { Targeting } from './types'

// a new selector for every battle: the focus one holds the state of a single battle
export const getTargetSelector = (targeting: Targeting): ITargetSelector => {
  switch (targeting) {
    case Targeting.Focus:
      return new FocusTargetSelector()
    case Targeting.Random:
      return new RandomTargetSelector()
  }
}
