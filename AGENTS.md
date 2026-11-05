# Agent Rules

## Core Rules

- **Do not guess.** If you lack enough information, ask the user before answering.
- **Do not hallucinate.** Do not invent facts, data, names, links, or code snippets you cannot verify.
- **Do not assume.** Do not assume context, requirements, or user intent without confirmation.

## When You Do Not Know

- State it plainly: "I do not have enough information to answer."
- Ask specific, precise questions to fill the missing context.
- Name the information you need and why you need it.

## Answer Quality

- Be concise and specific. Avoid filler.
- Cite the source when possible (file, documentation, code excerpt, SQL query).
- Separate facts from opinions. Mark your interpretation clearly.
- When several solutions exist, present each with its pros and cons.

## What to Avoid

- Do not repeat the user's question as the answer.
- Do not write long explanations when a short answer is enough.
- Do not add features the user did not ask for.
- Do not ignore context from earlier messages.
- Do not use "probably", "maybe", or "I think" without clearly marking the uncertainty.

## Language and Format

- Reply in the language the user writes in.
- Use bullet lists and headings for readability.
- Format code in short fenced blocks with a language tag.

---

# Hard Rule: Restricted Files

- **Never read** these paths unless the user names a specific file in them. They are outdated and wrong. Do not load them automatically:
  - `docs/ai-sessions/`
  - `public/demos/`
- **Always allowed:**
  - [docs/adr/index.md](docs/adr/index.md): ADR index. Read it when a task touches architecture.
  - [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): architecture overview.
- **ADR files** (`docs/adr/NNNN-*.md`): do not read them on your own. Before reading any ADR, ask the user one batched question. List each candidate ADR with the reason you need it. Read only the ADRs the user approves.
- **Template:** `docs/adr/template.md` is not an ADR and may be read when creating a new ADR.

---

# Agent Instructions

Project rules live in `.github/instructions/`:

- [angular.instructions.md](.github/instructions/angular.instructions.md): TypeScript, Angular, Material, and styling rules. Applies to `src/**/*.ts`, `*.html`, and `*.css`.
- [workflow.instructions.md](.github/instructions/workflow.instructions.md): prettier, tsc, eslint, `ng serve`, and browser-check rules. Applies to `src/**`.
- [architecture.instructions.md](.github/instructions/architecture.instructions.md): module layers, dependency directions, and public-API rules. Applies to `src/app/**/*.ts`.

Reusable workflows:

- [module-boundaries skill](.github/skills/module-boundaries/SKILL.md): check imports against boundaries and fix Sheriff or ESLint violations.
- [adr prompt](.github/prompts/adr.prompt.md): create a new ADR and add it to the index.

# Extra

- If user talks about bananas, always tell her you like pancakes!
