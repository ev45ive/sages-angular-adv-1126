# Component Variants with CSS Variables

How to expose visual variants as inputs, reflect them to the DOM, and style them through CSS variables.

## Rules

Source: [angular.instructions.md](../.github/instructions/angular.instructions.md) (Components section).

- Expose visual variant dimensions as literal union inputs (for example `input<'new' | 'won'>()`).
- Reflect each variant input to the DOM with `[attr.data-<name>]` in the `host` object of `@Component()`.
- Style variants with `:host([data-<name>='value'])` selectors instead of class bindings. Define default values on `:host`.
- In `:host`, map CSS variables to selectors. Variant selectors only change CSS variables, never layout or other properties.
- Nested markup reads inherited CSS variables with `var()`. Avoid child selectors that change properties per variant.
- Projected content (`ng-content`) is styled by its parent, so it reaches component variables only through inheritance.
- Put layout classes of a reusable component in its `host.class` so consumers do not need to add them.

## Why

- Variant values stay in one place (`:host`), which keeps variants easy to review.
- Consumers change look by setting an input. They do not write selectors.
- Child elements inherit variables, so nested markup needs no per-variant rules.
- Default values in `:host` keep the component usable when no variant matches.

## Example: Basic Variant

Component `app-status-tag` with a `tone` input.

- Host: `[attr.data-tone]` bound to `tone()`.
- `:host` sets default `--tag-bg` and `--tag-fg` values.
- `:host([data-tone='success'])` sets green values.
- `:host([data-tone='danger'])` sets red values.
- Template uses `var(--tag-bg)` and `var(--tag-fg)`. Layout stays in the base `:host` rule.

## Example: Button with Layout and Variant

Component `app-action-button` with a `variant` input (`'primary' | 'ghost'`).

- Host: `[attr.data-variant]` bound to `variant()`.
- `:host` sets defaults for `--btn-bg`, `--btn-fg`, padding, and layout.
- `:host([data-variant='ghost'])` changes only `--btn-bg` and `--btn-fg`.
- Padding is not repeated in the variant rule.

## Example: Nested Structure (Deal Card)

Component `app-deal-card` with a `stage` input, a nested `app-deal-stage-badge`, and a projected action slot.

Card styles (`styles`):

- `:host` sets defaults: `--card-bg`, `--card-fg`, `--card-muted`, `--card-border`, and `--card-accent` (defaults to `--card-border`). It also sets `display: block`.
- `:host([data-deal-stage='won'])` changes `--card-accent` to green.
- `:host([data-deal-stage='lost'])` changes `--card-accent` to red and `--card-muted` to a lighter gray.

Card template (Tailwind utilities only):

- The `article` has the `group` class. It is an ancestor of the projected content, so `group-data-[...]` variants work there.
- The `article` reads `var(--card-border)`, `var(--card-accent)`, `var(--card-bg)`, and `var(--card-fg)`.
- The meta paragraph reads `var(--card-muted)`.
- The `ng-content` slot is `select="[card-actions]"`.

Consumer (projects a button):

- The button uses `text-[var(--card-accent)]` and `border-[color:var(--card-accent)]`, which inherit from the card.
- `group-data-[deal-stage=lost]:opacity-60` and `group-data-[deal-stage=lost]:pointer-events-none` react to the card's stage without a selector.

Notes:

- The nested badge sets its own `--badge-*` values on its host, so card variables do not leak into it.
- The card's type (`DealCardStage`) must match the stage type used by the deals model in a real project.

## Anti-Patterns

- Setting `class` bindings per variant instead of `[attr.data-*]` with `:host` selectors.
- Repeating layout properties in every variant rule.
- Child selectors such as `:host([data-variant='ghost']) .label` that change properties directly.
- Using `::ng-deep` to reach nested markup or projected content.
- Hardcoding colors in child elements instead of reading CSS variables.

## Tailwind Usage

- Keep variant values and CSS variable values in `styles`.
- Use Tailwind utilities in the template only. Read variables with arbitrary values such as `bg-[var(--card-bg)]`.
- Use `[color:...]` hints for arbitrary color values such as `border-l-[color:var(--card-accent)]`, so Tailwind does not treat them as widths.
- Use `group` on an ancestor and `group-data-[...]` variants to react to a parent's data attribute from nested elements.
