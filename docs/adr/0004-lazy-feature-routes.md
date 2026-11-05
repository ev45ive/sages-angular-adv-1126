# Lazy-load features with `loadChildren`

- Status: accepted
- Date: 2026-11-05

## Context and Problem Statement

`app.routes.ts` currently lazy-loads a single page directly. Features with several routes need their routes defined in one place.

## Decision Drivers

- Routes of a feature live with the feature
- Root routing stays short
- Lazy loading per feature

## Considered Options

- `loadComponent` in `app.routes.ts` pointing at a page file
- `loadChildren` in `app.routes.ts` pointing at `features/<name>/<name>.routes.ts` directly
- `loadChildren` in `app.routes.ts` pointing at `features/<name>/index.ts`, which re-exports the routes

## Decision Outcome

Chosen option: "`loadChildren` through `features/<name>/index.ts`", because the feature owns its routes, the root file only lists features, and `app` imports stay within the public API (ADR-0002).

### Consequences

- Good, because each feature defines its own routes and providers.
- Good, because the root routing file stays short.
- Bad, because a feature with one page needs one extra routes file.
