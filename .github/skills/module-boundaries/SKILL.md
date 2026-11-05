---
name: module-boundaries
description: 'Check changed TypeScript files under src/app against module boundaries and fix violations. Use when the user asks to verify architecture, check imports, fix a boundary or deep-import error, or run Sheriff. Runs ESLint with Sheriff rules on changed files only.'
---

# Module Boundaries

Procedure for checking and fixing module boundary violations. The dependency rules are defined in [architecture.instructions.md](../../instructions/architecture.instructions.md) and [sheriff.config.ts](../../../sheriff.config.ts). Do not restate them here.

## Steps

1. List changed files under `src/app`: `git diff --name-only HEAD -- src/app` (include staged and unstaged changes).
2. Run ESLint on those files only: `npx eslint <files>`. Sheriff reports two rules:
   - `@softarc/sheriff/encapsulation`: deep import into a module.
   - `@softarc/sheriff/dependency-rule`: import direction is not allowed.
3. Fix each violation:
   - Encapsulation: import the module's `index.ts` instead. If the symbol is not exported there, export it from `index.ts`. Do not import internal files directly.
   - Dependency rule: move the shared code to `shared/`, or remove the import. Do not add a rule to `sheriff.config.ts` without the user's approval.
4. Fix only violations in changed files. Report pre-existing errors in unchanged files without fixing them.
5. Re-run `npx eslint <files>` on the same files, then run `npx tsc --noEmit -p tsconfig.app.json`.
6. Report each fixed violation with its file and line.

## When to Stop and Ask

- The fix needs a change to `sheriff.config.ts` or to an ADR.
- The violation comes from a design decision, not from a wrong import.
