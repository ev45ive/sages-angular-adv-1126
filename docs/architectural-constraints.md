# Architectural Constraints and Tradeoffs

Constraints are the forces that limit a design. Naming the constraint and its dimension makes the tradeoff explicit and the decision easier to justify.

## Core Principles

- A constraint is a forcing function: it pushes the design in one direction.
- Each dimension asks one question. The answer points to a design choice.
- Every choice has a cost. Record the cost, not only the choice.
- Constraints conflict. Resolve the conflict by the strongest constraint and the cost that is hardest to undo.

## Dimensions at a Glance

| Dimension      | Question                                                   | Forcing function                           | Quality attribute      |
| -------------- | ---------------------------------------------------------- | ------------------------------------------ | ---------------------- |
| Reusability    | Is this needed by several callers now?                     | Rule of three, YAGNI before that           | Maintainability        |
| Responsibility | What is the reason this code changes?                      | SRP: what changes together stays together  | Changeability, testability |
| Extensibility  | Will new variants arrive without editing this code?        | Open/Closed through extension points       | Changeability          |
| Ownership      | Who can change this, and who depends on it?                | Upstream owns the contract                 | Predictability         |
| Scope          | If this changes, what else breaks?                         | Impact radius                              | Change risk            |
| Lifecycle      | When is it created, changed, destroyed, and how stale can it be? | Rate of change and staleness budget  | Performance, freshness |

## Dimensions

### 1. Reusability

Question: Is this code needed by more than one caller today?

- Rule of three: duplicate until the third real use, then extract.
- YAGNI: do not build a shared abstraction for a caller that does not exist.
- Drives: feature-local code vs. `shared/`.
- Cost of extracting too early: wrong abstraction, flags and options added per caller.
- Cost of extracting too late: copies drift apart and fixes land in only one place.

### 2. Responsibility

Question: What is the single reason this code would change?

- SRP: one reason to change per unit (component, service, function).
- What changes together stays together.
- What changes separately gets separated.
- Drives: splitting into `pages/`, `ui/`, `data/`, `model/`.
- Cost of splitting too much: indirection and many files for one change.
- Cost of splitting too little: unrelated edits collide in one file and tests become harder.

### 3. Extensibility

Question: Will a new variant arrive, and can it be added without modifying existing code?

- Open/Closed: open for extension, closed for modification.
- When the variation is a different responsibility (not just a different value), expose an extension mechanism:
  - input: configuration values
  - content projection (slot): markup supplied by the caller
  - DI token (port): behavior supplied by a provider
  - route params: navigation variants
- Cost: every extension point is an indirection and a contract to maintain.
- Rule: add an extension point after the second real variant appears, not before.

### 4. Ownership

Question: Who is allowed to change this, and who depends on it?

- Dependencies point upstream: consumers depend on the provider, not the reverse.
- The owner defines the public contract. Everything else is internal and free to change.
- Drives: public API (`index.ts`), stable types, versioning, review rules.
- Cost: a stable contract slows changes, and the owner must keep it compatible.
- Without a clear owner: contracts drift and no one is responsible for breaking changes.

### 5. Scope

Question: If this changes, what is the impact radius?

- Count direct and transitive dependents.
- Shared code and shared types have the widest radius.
- Drives: narrow public APIs, private internals, module boundaries enforced by tooling (see [ADR-0003](adr/index.md)).
- Cost: narrow scope limits reuse and can cause duplication.
- Rule: the more dependents, the more stable and documented the contract must be.

### 6. Lifecycle

Question: When is this created, how often does its state change, and how long can its data be stale?

- Creation and destruction: when does it start, and what needs cleanup (subscriptions, timers, listeners)?
- Rate of change: how often does state change, and what else changes with it?
- Staleness budget: how old may data be before it is wrong for the user?
- Invalidation: which event makes cached data stale, and who triggers the refresh?
- Drives: eager vs. lazy loading (see [ADR-0004](adr/index.md)), state location (component, store, route), caching, change detection strategy.
- Cost: caching trades freshness for speed; eager loading trades startup time for simplicity.

## Cross-Dimension Tradeoffs

| Tension                          | Pushes toward                                  | Pushes against                              | Common resolution                                                       |
| -------------------------------- | ---------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------- |
| Reusability vs. Scope            | Shared code serves many callers                | Shared code widens the blast radius         | Keep `shared/` domain-independent with a small API                      |
| Reusability vs. Responsibility   | One generic component for many features        | Generic code mixes reasons to change        | Extract only the generic part; keep feature logic in the feature        |
| Extensibility vs. Reusability    | Extension points for anticipated variants      | YAGNI: variants may never arrive            | Add the extension point after a second real variant exists              |
| Extensibility vs. Ownership      | Hooks that let consumers customize behavior    | Consumers couple to internals               | Expose extension points through the public API only                     |
| Responsibility vs. Scope         | More units with narrow jobs                    | More units mean more boundaries to manage   | Split where change rates differ, not by default                         |
| Lifecycle vs. Scope              | Long-lived cache for speed                     | Stale data spreads to every reader          | Invalidate at the owner's boundary                                      |

## Quality Decision Checklist

- [ ] Which dimension is the strongest constraint here?
- [ ] Who changes this, and who depends on it?
- [ ] How many callers exist today, and how many are realistic next?
- [ ] What changes together with this code?
- [ ] What is the staleness budget, and what triggers invalidation?
- [ ] What does the choice cost, and who pays that cost?
- [ ] Is the decision lasting? If yes, record it as an ADR.

## Good and Bad Examples

Examples describe the situation. They use this project's domain (deals, contacts, tasks).

### Reusability

Good:

- The currency formatter is used in deals, contacts, and tasks. It moved to `shared/utils/` when the third copy appeared.

Bad:

- A `shared/` table component has a boolean flag for each feature (contacts, tasks, compact deals). It was extracted after a single use.

### Responsibility

Good:

- The `deals-list` page loads deals through `data/` and passes them to `ui/deal-card` through inputs. A layout change touches only the card.

Bad:

- A `ui/` component calls the API, applies sorting rules, and formats currency. A change to the sort rule, the API shape, or the layout edits the same file.

### Extensibility

Good:

- Notifications are sent through a DI token. Adding an email channel means providing a new implementation in app config. No existing sender changes.

Bad:

- A shared component switches on a `type` string. Each new type adds a branch, and every existing type must be retested.

### Ownership

Good:

- The `deals` feature exposes only its `index.ts`. The owner can rename internal stores freely, and `contacts` is unaffected.

Bad:

- `contacts` imports the deals store file directly. The deals owner cannot rename it without breaking contacts, and no one knows who to ask.

### Scope

Good:

- A fix in a mapper inside `deals/data/` affects only the deals feature. Its tests cover the change.

Bad:

- A field rename on the shared `Deal` type, used by six features and two utilities. The change looks small but touches all of them.

### Lifecycle

Good:

- The deals route is lazy loaded, because most users never open it at startup.
- The deals list has a 30-second staleness budget. A create or update action invalidates it at the store.

Bad:

- A global store keeps all deals indefinitely with no invalidation. Users see deleted deals after returning to the list.
- A component subscribes in its constructor and never unsubscribes. Each visit leaves another active subscription.

## Recording a Decision

- Name the dimension or dimensions that drove the choice.
- List the options considered, with the cost of each.
- State the accepted cost and the condition for revisiting the decision.
- If the decision is lasting, create an ADR (see the [ADR index](adr/index.md)).

## Related

- [Architecture overview](ARCHITECTURE.md)
- [ADR index](adr/index.md)
