---
description: "Use when generating Angular files with ng g schematics, finishing Angular or template changes, verifying a feature, running prettier, tsc, eslint, the ng serve dev server, or browser checks. Covers schematic generation, verification order, scope of fixes, and asking before browser tools."
applyTo: "src/**"
---

# Workflow Rules

## Code Generation

- Never create files by hand that an `ng g` schematic can generate.
- Do not change schematic flags unless the user asks. Let defaults come from `angular.json`.
- Prefer batch generation: prepare all needed `ng g` commands first, then run them together in one terminal call.

## Verification Order

- Format changed files with prettier: `npx prettier --write <files>`. Config is in `.prettierrc`.
- Type-check with `npx tsc --noEmit -p tsconfig.app.json`.
- Lint changed files only: `npx eslint <files>`.
- Use the running `ng serve` session to check the build. Do not run `ng build` unless asked. If no session is running, ask before starting one.
- Fix only problems in changed files, or problems that stop `ng serve` from rebuilding.
- The editor's CSS linter reports `@theme` and `@apply` as errors. These are false positives from Tailwind at-rules.

## Browser Checks

- Ask before using `open_browser_page`, `click_element`, or any other browser tool to verify, debug, or fix.

## Scope

- Template-only requests: do not add logic beyond the `imports` array unless the user approves.
- Do not create markdown files to document changes unless requested.
