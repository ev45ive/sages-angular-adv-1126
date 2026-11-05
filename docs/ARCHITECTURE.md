# Architecture

Target structure. Decisions and rationale are in the [ADR index](adr/index.md).

```sh
src/
├── main.ts
├── index.html
├── styles.css                      # Global styles, tokens, layers
│
└── app/
    ├── app.ts                      # Root component
    ├── app.config.ts               # Global providers
    ├── app.routes.ts               # Root routes, features via loadChildren (ADR-0004)
    │
    ├── core/                       # App-wide infrastructure and app-level pages
    │   ├── index.ts                # Public API (exports PageNotFound)
    │   ├── pages/
    │   │   └── page-not-found/page-not-found.ts
    │   ├── auth/                   # Planned
    │   ├── http/                   # Planned
    │   └── layout/                 # Planned
    │
    ├── features/                   # Business capabilities (ADR-0001)
    │   └── deals/
    │       ├── index.ts            # Public API, the only file other features may import; re-exports dealsRoutes (ADR-0002)
    │       ├── deals.routes.ts     # Feature routes, default export
    │       ├── pages/              # Routable, compose UI + state
    │       │   └── deals-list/deals-list.page.ts
    │       ├── ui/                 # Feature-specific presentation
    │       ├── data/               # Data access + state
    │       └── model/              # Domain contracts + logic
    │
    └── shared/                     # Domain-independent reusable code
        ├── index.ts                # Public API, re-exports shared-module
        ├── shared-module.ts        # Shared Material/Router imports
        ├── ui/
        ├── forms/
        ├── directives/
        ├── pipes/
        ├── layouts/
        └── utils/
```

## Responsibilities and boundaries

| Directory           | Responsibility                                | Typical contents                     |
| ------------------- | --------------------------------------------- | ------------------------------------ |
| `core/`             | Application-wide infrastructure and app pages | Auth, HTTP, app shell, 404 page      |
| `features/`         | Business capabilities                         | Deals, contacts, tasks               |
| `features/*/pages/` | Route entry points and orchestration          | List, detail, edit pages             |
| `features/*/ui/`    | Feature-specific UI                           | Cards, forms, pickers, widgets       |
| `features/*/data/`  | Data fetching and state management            | API clients, stores, mappers         |
| `features/*/model/` | Domain types and business rules               | Interfaces, enums, validation        |
| `shared/`           | Domain-independent reusable code              | UI primitives, directives, utilities |

## Dependencies

Allowed directions. Enforced by Sheriff (ADR-0003).

- `app` → `core`, `shared`, `features`
- `core` → `shared`
- `features/<name>` → `shared`
- `features/<name>` → another feature only via `features/<other>/index.ts` (ADR-0002)
- `app.routes.ts` → `features/<name>/index.ts` via `loadChildren`, which re-exports the feature routes (ADR-0004)

Forbidden:

- `features` → `core`
- `core` → `features`
- `shared` → `core` or `features`
- feature A → feature B internals (any path other than `index.ts`)

## Within a feature

```sh
- pages → ui, data, model
- ui → model (and feature-local state when justified)
- data → model
- model → pure TypeScript, no Angular dependencies
```

## Page and UI roles

- `page`: controlling component. Loads data and passes it to its children.
- `ui`: presentational component. Receives data through inputs and depends on its parent page.

## Enforcement

- Soft: this document, ADRs, `.github/instructions/architecture.instructions.md`.
- Hard: ESLint with Sheriff (ADR-0003).

## Goals

- Clear ownership and scope to limit the blast radius of changes.
