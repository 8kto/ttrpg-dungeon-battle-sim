// Experimental features, toggled via the URL: ?ff=some-flag or several at once: ?ff=some-flag,other
// Register a flag here to use it; unknown values are ignored
export const FeatureFlags = [] as const
export type FeatureFlag = (typeof FeatureFlags)[number]

export const parseFeatureFlags = (search: string, known: readonly string[] = FeatureFlags): string[] =>
  (new URLSearchParams(search).get('ff') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter((value) => known.includes(value))

export const isFeatureEnabled = (flag: FeatureFlag, search: string = window.location.search): boolean =>
  parseFeatureFlags(search).includes(flag)

// Exposes the flags to CSS as `ff--<flag>` classes, so purely visual features need no JS
export const applyFeatureFlagClasses = (
  search: string,
  target: HTMLElement,
  known: readonly string[] = FeatureFlags,
): void => {
  parseFeatureFlags(search, known).forEach((flag) => target.classList.add(`ff--${flag}`))
}
