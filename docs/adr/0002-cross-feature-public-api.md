# Cross-feature access only through the feature index

- Status: accepted
- Date: 2026-11-05

## Context and Problem Statement

A feature sometimes needs a component or type from another feature (for example, a related-deals list shown in contacts). Direct deep imports couple features to each other's internal files.

## Decision Drivers

- Features can change internals without breaking others
- Clear ownership of what is public
- Simple rule that is easy to check

## Considered Options

- Solution A: a `pages/` composition layer above features, which composes features together
- Solution B: each feature exposes a public API in `features/<name>/index.ts`; other features import only from that file

## Decision Outcome

Chosen option: "Solution B", because it keeps ownership inside the feature and needs no extra composition layer.

- A feature imports another feature only through `features/<name>/index.ts`.
- `index.ts` exports only the public API.
- Shared code goes to `shared/`, not to another feature.

### Consequences

- Good, because internal files of a feature stay private.
- Good, because the rule can be checked mechanically (see ADR-0003).
- Bad, because each feature needs an `index.ts` barrel that must be kept up to date.
