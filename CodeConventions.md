# Code Conventions

## Common

- Code is written in TypeScript. Each function/method has typed arguments and a return type.
- No JSDoc is needed for parameters; types serve this purpose.
- JSDoc is used only for logic descriptions.
- No linter warning suppressions in the codebase, except in tests.

## Components

- No cross-referencing of exported parts from different modules.
  For example, no function from `inventory.ui.ts` should be imported into `character.ui.ts` or any other `*.ui.ts` module.
- Instead, `*.ui.ts` modules interact through `CustomEvents` and subscriptions in `subscriptions.ts`.
- No direct calls to functions used in subscription callbacks.
  For example, do not directly call `handleRenderInventories`. Instead, dispatch the `RenderInventories` action.
- No conditional logic in `subscriptions.ts`; only calls to event handlers that encapsulate all logic within them.

## Naming

- "Equipment" is shortened to "Equip" everywhere.
- "Character" is shortened to "Char" in HTML layouts.
- Subscription event handlers should have the `handle` prefix.
