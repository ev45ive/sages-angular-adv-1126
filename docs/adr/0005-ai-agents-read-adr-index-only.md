# AI agents read the ADR index by default

- Status: accepted
- Date: 2026-11-05

## Context and Problem Statement

ADR files can be long. Loading all of them into the agent context wastes space and adds noise to unrelated tasks.

## Decision Drivers

- Keep agent context small
- Still let the agent find relevant past decisions
- The user controls which ADR files are read

## Considered Options

- Load all ADR files into context
- Read only `docs/adr/index.md` by default; read individual ADRs only after the user approves
- No ADRs for agents

## Decision Outcome

Chosen option: "Read `docs/adr/index.md` by default; read individual ADRs only after the user approves", because the index gives enough context to pick relevant ADRs, and the user decides when to spend context on them.

### Consequences

- Good, because the default context stays small.
- Good, because the user sees which ADRs the agent wants to read before it reads them.
- Bad, because the rule depends on the agent following `AGENTS.md`; nothing enforces it mechanically.
