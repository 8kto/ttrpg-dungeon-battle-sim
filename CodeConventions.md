# Code Conventions

## Common

- Code is written in TypeScript, each function/method has typed arguments and return type
- No JsDoc describes params, types do
- JsDoc is used only for the logic descriptions
- No linter warnings suppression in the codebase. Allowed in tests.

## Components

- No cross-referencing exported parts of modules.
  For instance, no function from `inventory.ui.ts` can be imported into `character.ui.ts` or any other `*.ui.ts` module.
- Instead, `*.ui.ts` modules interact through CustomEvents and subscriptions in `subscriptions.ts`.
- No direct calls of functions used in subscriptions callbacks.
  For instance, no direct `handleRenderInventories` call should be made. Instead, dispatch `RenderInventories` action.

## Naming

- "Equipment" is shortened to "Equip" everywhere.
- "Character" is shortened to "Char" in HTML layout.
