# Architecture Decision Records

Read this index first. Open an ADR file only after the user approves it.

| No.  | Title                                                                  | Status   | Summary                                                       |
| ---- | ---------------------------------------------------------------------- | -------- | ------------------------------------------------------------- |
| 0001 | [Feature-based folder structure](0001-feature-based-structure.md)      | accepted | `core/`, `features/`, `shared/` folders with clear ownership  |
| 0002 | [Cross-feature access through index](0002-cross-feature-public-api.md) | accepted | Features import each other only via `index.ts`                |
| 0003 | [Sheriff boundary enforcement](0003-sheriff-boundary-enforcement.md)   | accepted | Module boundaries enforced by Sheriff in ESLint               |
| 0004 | [Lazy feature routes](0004-lazy-feature-routes.md)                     | accepted | Features lazy-loaded via `loadChildren` to `<name>.routes.ts` |
| 0005 | [AI agents read ADR index only](0005-ai-agents-read-adr-index-only.md) | accepted | Agents read this index; ADR files need user approval          |
