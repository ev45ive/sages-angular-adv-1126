# Feature-based folder structure

- Status: accepted
- Date: 2026-11-05

## Context and Problem Statement

The app is growing beyond flat folders in `src/app/`. Business code, shared UI, and app-wide infrastructure need separate homes with clear ownership.

## Decision Drivers

- Clear ownership of each folder
- Limit the blast radius of changes
- Keep room for lazy loading per feature

## Considered Options

- Flat `src/app/<page>/` folders
- Layer-first folders (`components/`, `services/`)
- Feature-first folders with `core/`, `features/`, `shared/`

## Decision Outcome

Chosen option: "Feature-first folders with `core/`, `features/`, `shared/`", because it groups code by business capability and keeps app-wide and reusable code separate.

- `features/<name>/` holds one business capability, with `pages/`, `ui/`, `data/`, `model/` subfolders as needed.
- `core/` holds app-wide infrastructure and app-level pages (`core/pages/`).
- `shared/` holds domain-independent reusable code.

### Consequences

- Good, because each folder has one owner and one purpose.
- Good, because features can be lazy loaded (see ADR-0004).
- Bad, because existing flat pages must be moved, which touches imports and routes.
