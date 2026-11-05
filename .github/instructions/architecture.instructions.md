---
description: 'Use when adding or changing imports, routes, or files under src/app. Covers module layers (app, core, shared, features), allowed dependency directions, the index.ts public-API rule, and Sheriff enforcement.'
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

- Import a module only through its `index.ts`. Do not import deep files such as `features/deals/pages/...` from outside the module.
- Inside one feature, files may import each other directly.
- Routes of a feature are lazy-loaded with `loadChildren` through `features/<name>/index.ts` (ADR-0004).

## Placement

- Business code goes to `features/<name>/`.
- App-wide infrastructure and app-level pages go to `core/`.
- Domain-independent reusable code goes to `shared/`.

## Enforcement

- Boundaries are enforced by Sheriff through `sheriff.config.ts` and ESLint (ADR-0003). Do not disable these rules.
- Do not change `sheriff.config.ts` without the user's approval.
- Before changing these rules, read [docs/adr/index.md](../../docs/adr/index.md). Read an individual ADR only after the user approves it.
