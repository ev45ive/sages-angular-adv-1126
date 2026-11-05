---
description: 'Use when adding or changing imports, routes, or files under src/app. Covers module layers (app, core, shared, features), allowed dependency directions, path aliases (@core, @shared, @feature/<name>), the index.ts public-API rule, new-feature setup, and Sheriff enforcement.'
applyTo: 'src/app/**/*.ts'
---

# Architecture Rules

## Dependency Directions

- `app` may import from `core`, `shared`, and `features`.
- `core` may import from `shared` only.
- `features/<name>` may import from `shared` only, and from another feature only through that feature's `index.ts`.
- `shared` imports from no other layer in `src/app`.
- Forbidden: `features` to `core`, `core` to `features`, `shared` to `core` or `features`.

## Public API

- Import a module only through its `index.ts`, using its alias. Never import a deep file such as `features/deals/pages/...`.
- Inside one module, relative imports are allowed.
- Lazy routes load a feature through its alias, for example `import('@feature/deals')` (ADR-0004).

## Path Aliases

Defined in the `paths` of `tsconfig.json`.

| Alias             | Target                             |
| ----------------- | ---------------------------------- |
| `@core`           | `src/app/core/index.ts`            |
| `@shared`         | `src/app/shared/index.ts`          |
| `@feature/<name>` | `src/app/features/<name>/index.ts` |

- Alias names are fixed: `@core`, `@shared`, and `@feature/<name>`, where `<name>` is the feature folder name in kebab-case. Do not invent other aliases without the user's approval.
- Do not use wildcard mappings such as `@feature/*`. Sheriff reports them as SH-001 errors, so each feature has its own explicit entry.
- Across a module boundary, use the alias. Do not use `../` paths. For example, from `features/deals/` to shared code, use `@shared`, not `../../../shared`.
- Relative imports are allowed only inside the same module: the same `core`, the same `shared`, or the same `features/<name>` folder.

## Code Generation

- When creating a feature `<name>`, make all three changes in the same edit:
  - Create `src/app/features/<name>/index.ts` as the public API.
  - Add `"@feature/<name>": ["./src/app/features/<name>/index.ts"]` to `paths` in `tsconfig.json`.
  - Add `'src/app/features/<name>': 'feature:<name>'` to `modules` in `sheriff.config.ts`. Do not change `depRules`.
- Generated imports use the aliases above. Do not write relative paths across modules.

## Placement

- Business code goes to `features/<name>/`.
- App-wide infrastructure and app-level pages go to `core/`.
- Domain-independent reusable code goes to `shared/`.

## Enforcement

- Boundaries are enforced by Sheriff through `sheriff.config.ts` and ESLint (ADR-0003). Do not disable these rules.
- Do not change `sheriff.config.ts` without the user's approval, except for the `modules` entry of a new feature (see Code Generation).
- Before changing these rules, read [docs/adr/index.md](../../docs/adr/index.md). Read an individual ADR only after the user approves it.
