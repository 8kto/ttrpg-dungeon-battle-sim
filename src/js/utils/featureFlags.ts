// Experimental features, toggled via the URL: ?ff=desk-bg or several at once: ?ff=desk-bg,other
// Register a flag here to use it; unknown values are ignored
export const FeatureFlags = ['desk-bg'] as const
export type FeatureFlag = (typeof FeatureFlags)[number]

const isFeatureFlag = (value: string): value is FeatureFlag => (FeatureFlags as readonly string[]).includes(value)

export const parseFeatureFlags = (search: string): FeatureFlag[] =>
  (new URLSearchParams(search).get('ff') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(isFeatureFlag)

export const isFeatureEnabled = (flag: FeatureFlag, search: string = window.location.search): boolean =>
  parseFeatureFlags(search).includes(flag)

// Exposes the flags to CSS as `ff--<flag>` classes, so purely visual features need no JS
export const applyFeatureFlagClasses = (search: string, target: HTMLElement): void => {
  parseFeatureFlags(search).forEach((flag) => target.classList.add(`ff--${flag}`))
}
