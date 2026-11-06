# E2E scenarios (manual / candidates for automation)

Checked in a browser (Playwright MCP) on 2026-11-06 against the signal-store implementation of deals and contacts.
Status: **OK** = verified, **FIXED** = bug found and fixed during this run, **NOTE** = behaviour to know about.

## Setup

- `ng serve` on `http://localhost:4200` and the API (`server/`, `npm start`) on port 3000.
- API data is in memory; restart the API to reset it. Seed: deals `d1`-`d4`, contacts `c1`-`c4`; `d1` has 2 tasks, `d3` has none.
- The API answers after a random 0.2-2.2 s, so loading states and optimistic updates are visible.

## Test harness notes (for automation)

- After `goto`, wait for a rendered element (for example `input[type=search]`), not for `load`: the dev server bootstraps for 2-5 s.
- Use real typing (`fill`/`pressSequentially`). Setting `input.value` and dispatching a synthetic `input` event does not mark a Signal Form dirty, so the unsaved-changes guard does not fire.
- The unsaved-changes guard uses `window.confirm`; handle the dialog (accept/dismiss).
- Forcing an API failure: stub `window.fetch` for `PUT` (HttpClient uses `fetch` here, not XHR).
- Do not run dependent tool calls in parallel; they interleave and report "execution context destroyed".

## Deals list and routing

| ID   | Scenario                | Steps                                  | Expected                                                                         | Status |
| ---- | ----------------------- | -------------------------------------- | -------------------------------------------------------------------------------- | ------ |
| D-01 | Deep link to a deal     | Open `/deals/d3`                       | URL stays `/deals/d3`; details of d3 shown; d3 highlighted in the list           | FIXED  |
| D-02 | Deep link to `new`      | Open `/deals/new`                      | URL stays; empty "New Deal" form; no list item highlighted                       | FIXED  |
| D-03 | Select from list        | Click a deal in the list               | URL becomes `/deals/<id>`; details + tasks render; clicked item highlighted      | OK     |
| D-04 | Filter                  | Type `pilot` in "Filter deals"         | After ~300 ms URL gets `?dealFilter=pilot`; list shows 1 deal; open deal stays   | OK     |
| D-05 | Unknown deal            | Open `/deals/nope`                     | One "Deal not found" alert (plus snackbar); no details card                      | FIXED  |
| D-06 | Tasks open first        | Open `/deals/d1`                       | Open task first, completed task after; tasks appear ~1 s after the card          | OK     |
| D-07 | Toggle task             | Tick "Send revised proposal" on d1     | Checkbox changes at once; one `PATCH /deals/d1/tasks/t1`                         | OK     |
| D-08 | Add task                | Type a title, press Add                | After the response the task is listed first; composer is cleared                 | OK     |
| D-09 | NOTE: tasks loading     | Open a deal whose tasks are not cached | The tasks card shows "No tasks yet" until the response arrives (no loading hint) | NOTE   |
| D-10 | NOTE: re-click selected | Click the already selected list item   | Listbox deselects its highlight, URL does not change (explicit selection mode)   | NOTE   |

## Create, edit, guard

| ID   | Scenario                | Steps                                                             | Expected                                                                                        | Status |
| ---- | ----------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------ |
| E-01 | Create validation       | `/deals/new`, press Save with an empty form                       | "Title is required" and "Contact is required"; no `POST`                                        | OK     |
| E-02 | Contact picker          | Focus Contact; type `mar`                                         | On focus all contacts are offered; after typing only "Marek Nowak"                              | OK     |
| E-03 | Create + double click   | Title, value, pick a contact, double-click Save                   | Exactly one `POST /deals`; navigates to `/deals/<new id>`; deal in list; correct contact name   | OK     |
| E-04 | Related deals           | Open the created deal's contact (`/contacts/<id>`)                | "Related deals" lists the new deal without waiting for a refetch                                | OK     |
| E-05 | Edit prefilled          | Open `/deals/<id>/edit`                                           | Form filled; Contact shows the contact name, not the id                                         | OK     |
| E-06 | Edit + double click     | Change the title, double-click Save                               | Exactly one `PUT`; back on details; new title in details card, list and contact's related deals | OK     |
| E-07 | Guard: dismiss          | Edit page, change a field with real typing, press Cancel, dismiss | Stays on `/edit`, value kept                                                                    | OK     |
| E-08 | Guard: accept           | Same, accept the dialog                                           | Goes to `/deals/<id>`; change discarded                                                         | OK     |
| E-09 | Save failure rolls back | Make `PUT` fail (stub `fetch`), change the title, Save            | Title reverts in list and form; alerts and snackbar show the error; Save enabled again          | OK     |
| E-10 | NOTE: tasks in editor   | Add/remove tasks in the edit form, Save                           | Task edits are not persisted (deal fields only); the create page hides tasks                    | NOTE   |

## Caching (TTL 60 s, stale-while-revalidate)

| ID   | Scenario                | Steps                                                           | Expected                                                              | Status |
| ---- | ----------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------- | ------ |
| C-01 | Fresh data, no request  | Open a deal, go elsewhere in the app, return within 60 s        | No new `GET` for deal, tasks or contact                               | OK     |
| C-02 | Stale data, quiet reval | Open `/deals`, go to `/contacts`, wait 62 s, return to `/deals` | List renders instantly, no "Loading ..."; one background `GET /deals` | OK     |
| C-03 | One contact request     | Reload `/deals/d1`                                              | Exactly one `GET /contacts/c1` (was two before the fix)               | FIXED  |

## Contacts

| ID   | Scenario          | Steps                         | Expected                                                       | Status |
| ---- | ----------------- | ----------------------------- | -------------------------------------------------------------- | ------ |
| K-01 | Search prefill    | Open `/contacts/search?q=ann` | Input shows `ann`; 1 card; no "No contacts found"              | OK     |
| K-02 | Empty search      | Open `/contacts/search?q=zzz` | "No contacts found."; no cards                                 | OK     |
| K-03 | Contact details   | Open `/contacts/c3`           | Details card + related deals of c3 (d3 and any created for c3) | OK     |
| K-04 | Unknown contact   | Open `/contacts/zzz`          | "Contact not found" alert; no card, no related deals           | OK     |
| K-05 | Related deal link | Click a related deal          | Opens `/deals/<id>` with that deal selected                    | OK     |

## Not covered yet

- Keyboard use of the deals list (explicit selection: arrows move focus, Enter/Space select).
- Edit with a changed contact (related deals of the old and new contact).
- Browser back/forward after save and after the guard.
- Mobile layout of the contact picker panel.
- Pre-existing console warning NG0505 (hydration requested without SSR).
