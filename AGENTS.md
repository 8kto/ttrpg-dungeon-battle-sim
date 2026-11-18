# Agent instructions

Dungeon Battle Simulator: a static TypeScript app (no framework), built with WMR, styled with Tailwind via SCSS,
tested with Jest + jsdom. The simulation runs in a web worker.

## Commands

- `yarn test` — Jest; `yarn lint` — ESLint; `yarn format` — Prettier check; `yarn format:fix` — fix both
- `npx tsc --noEmit -p .` — type check (errors inside `node_modules/wmr` are known and unrelated)
- `yarn styles` — rebuild `src/styles/styles.processed.css` (gitignored) after editing `styles.scss`
- `yarn dev` — dev server on port 3030 (often already running; don't start a second one)

Before reporting work as done: tests, lint, format and the type check pass. For UI changes also check the page in a
browser, on desktop and phone widths.

## Git

- Commit only when explicitly asked in that request. Otherwise leave the changes in the working tree for review.
- Commits are atomic: one logical change per commit (feature, fix, rename, refactor), each passing tests and lint.
- To commit a batch of work, group the changes by logical change, not by file, and commit the groups in dependency
  order (refactors and services before the UI that uses them). A change goes together with its tests, messages and
  styles. When a file holds parts of several groups, split it: commit intermediate versions of the file, so every
  commit builds and passes tests, type check and lint on its own. The last commit must leave the tree exactly as the
  finished work.
- Leave unrelated changes you didn't make (e.g. the user's edits) out of your commits, or commit them separately.
- No attribution lines in commit messages (no `Co-Authored-By`, no "Generated with").

## Code structure

- Never put an interface and its implementation in one file: `IFoo.ts` holds the interface and its public types,
  `Foo.ts` the class (see `IDamageParser.ts` / `DamageParser.ts`).
- A file with a class contains no module-level helper functions: helpers of the class become its private static
  methods and constants, written as regular methods (`private static foo(): T {}`), not arrow properties.
- Generic stateless utilities go into function modules under `src/js/utils/` (no class there). A service class is
  for code with state or dependencies to inject.
- DOM helpers live in `src/js/utils/dom.ts`: `byId`, `query`, `el`, `onClick`, `button`. Use them instead of
  `querySelector(...) as T`, `document.createElement` + `className` + `textContent`, or a click listener calling
  `preventDefault`. Use raw lookups only where a missing element must be checked.
- Services take their dependencies through the constructor with defaults (`parser: IDamageParser = new DamageParser()`),
  so tests can replace them.
- Follow the ESLint config: sorted object keys, explicit return types, `import type` for types, no `undefined`.

## UI

- Every user-facing string built in TS goes through the message catalog (`src/js/services/messages/catalog.ts`,
  `messages.t('key', params)`). Static markup text stays in `src/index.html`.
- Modals are `<dialog>` elements bound with `bindModal` (`src/js/ui/modal.ts`); help modals share `.help-modal`.
- Colors and sizes come from the CSS variables in `:root` of `styles.scss`; layouts must work on phones (≥ 360px).
- Experimental UI goes behind a feature flag, `?ff=<flag>` (`src/js/utils/featureFlags.ts`, body class `ff--<flag>`).
  When a flagged feature is dropped or promoted, remove only its flag entry: never delete the feature flag utility,
  even if no flags are left.

## Domain notes

- Damage formulas the strategies accept: `NdS`, `NdS+M`, `NdS-M` or a plain number. Dice of different types can't be
  mixed (`d6+d4` is invalid). The format is described once, in `DamageFormula` (`services/attacks/`): parsing,
  formatting and click-editing; don't add another formula regex. Validate a damage field with `DamageValidator`.
- Damage field syntax (options `|`, attacks `,`, tags and modifiers in brackets) is documented in `Readme.md` and the
  "Damage syntax" help modal in `src/index.html`; keep both in sync with `DamageParser` when the syntax changes.

## Tests

- Every new module gets tests next to it in `__tests__/`. UI components are tested in jsdom with the markup they need;
  `<dialog>` methods are mocked there (`showModal`, `close`), as jsdom doesn't implement them.
