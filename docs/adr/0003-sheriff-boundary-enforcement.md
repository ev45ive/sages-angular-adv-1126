# Enforce module boundaries with Sheriff

- Status: accepted
- Date: 2026-11-05

## Context and Problem Statement

ADR-0001 and ADR-0002 define dependency rules between `app`, `core`, `shared`, and features. Written rules alone do not stop violations during code review.

## Decision Drivers

- Violations fail in the editor and in ESLint
- Rules are declared in one place
- Minimal custom code to maintain

## Considered Options

- `no-restricted-imports` (built into ESLint, path patterns only)
- `eslint-plugin-boundaries` (element types, extra rule configuration)
- `@softarc/sheriff` (module tags, dependency rules, public-API encapsulation)
- Documentation and code review only

## Decision Outcome

Chosen option: "`@softarc/sheriff`", because it models tags and dependency rules directly and enforces the `index.ts` public-API rule from ADR-0002.

### Consequences

- Good, because boundary violations are reported by ESLint.
- Good, because rules live in `sheriff.config.ts` at the project root.
- Bad, because it adds two dev dependencies that must stay compatible with ESLint and typescript-eslint.
