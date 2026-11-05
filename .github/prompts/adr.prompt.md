---
description: 'Create a new Architecture Decision Record (ADR) in MADR format from docs/adr/template.md and add it to the ADR index.'
argument-hint: 'ADR title, for example: Use signals for deals state'
---

Create a new ADR for the title given in the chat message.

## Steps

1. Read [docs/adr/index.md](../../docs/adr/index.md). Take the highest ADR number in the table and add 1. Format it with four digits, for example `0006`.
2. Read [docs/adr/template.md](../../docs/adr/template.md). It is the template, not an ADR, so it may be read without asking.
3. Create `docs/adr/NNNN-<slug>.md` from the template:
   - Title: the given title.
   - Status: `proposed`.
   - Date: today's date.
   - Slug: lowercase kebab-case of the title.
4. Add a row to the table in `docs/adr/index.md` with the number, a link to the new file, status `proposed`, and a one-line summary.
5. If the context, drivers, or options are not provided, ask the user. Do not guess. Leave the unknown sections as placeholders.
6. Run `npx prettier --write` on the new and changed files.
