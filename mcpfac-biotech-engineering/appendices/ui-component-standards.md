# Appendix D — UI Component Standards

Concrete build rules underneath Volume 2's design system and Volume 3's
component/feature organization.

## Anatomy of a Component

Every non-trivial component (product card, form, table row, dashboard
widget) should account for, in code, not just design:

```
- Default/loaded state
- Loading state (skeleton, not a spinner-only screen, for content-shaped areas)
- Empty state (with a clear next action, not just "No results")
- Error state (with a retry action where retrying makes sense)
- Disabled state (if interactive)
```

If a component genuinely can't have one of these (e.g. a static footer
link), that's fine — but it's a deliberate omission, not an oversight.

## Props Contract

- Required props have no default; optional props get a sensible default
  in the function signature, not scattered `??` fallbacks in the JSX.
- Boolean props read as a question (`isDisabled`, `showBadge`), matching
  Appendix B.
- Prefer a small number of well-typed props over a single loosely-typed
  `config` object, unless the component genuinely has many optional
  variations (then a typed `variant` prop + discriminated union is
  better than a grab-bag object).
- Components that render a list take `items: T[]` + a `renderItem`
  or dedicated child component — never inline map logic duplicated across
  pages.

## Composition Over Configuration

- Prefer `<Card><Card.Header /><Card.Body /></Card>` compound patterns for
  layout-flexible components (cards, dialogs, tables) over a single
  component with 15 boolean flags.
- Wrap shadcn/ui primitives rather than importing them directly all over
  the app — e.g. `components/product/ProductPriceBadge.tsx` wraps
  `Badge` with the domain-specific formatting/color logic, so pricing
  display logic lives in one place.

## Accessibility Checklist (per component)

- Interactive elements are real `<button>`/`<a>`, not `<div onClick>`.
- Every form input has a linked `<label>` (via `htmlFor`/`id` or
  `aria-label`).
- Focus is visible (don't strip `outline` without providing a replacement
  focus ring).
- Modals/drawers trap focus while open and return focus to the trigger on
  close.
- Color is never the only signal (e.g. status badges pair color with text
  or an icon, per Volume 2's status color system).

## Styling Rules

- Tailwind utility classes only for one-off layout; recurring
  design-token values (the specific greens, spacing, radii, shadows from
  Volume 2) go through the Tailwind config / CSS variables, not hardcoded
  hex values or arbitrary `px` values in `className`.
- No inline `style={{ ... }}` except for truly dynamic values Tailwind
  can't express (e.g. a computed width percentage).
- Use `cn()`/`clsx` for conditional classes — no manual string
  concatenation.

## Animation Rules (Framer Motion, per Volume 2)

- Reuse a small shared set of motion variants (`fadeIn`, `slideUp`,
  `scaleIn`) from `lib/motion.ts` rather than inlining transition configs
  in every component.
- Respect `prefers-reduced-motion` — check it before applying
  non-essential motion.

## Component Placement

Match Volume 3's `components/` and `features/` split:
- Generic, reusable, no business meaning → `components/<category>/`
  (e.g. `components/buttons/PrimaryButton.tsx`).
- Domain-specific, tied to a feature's data → `features/<feature>/components/`
  (e.g. `features/quotes/components/QuoteStatusBadge.tsx`).

If a component in `features/` turns out to be needed by two unrelated
features, that's the signal to promote it into `components/`.

## Testing

- Every reusable component: a render test (renders without crashing, key
  props reflected in output) at minimum.
- Interactive components (forms, filters): test the interaction, not just
  the render — e.g. typing in a filter actually narrows the list.
- Snapshot tests are discouraged as the *only* test for a component — they
  catch diffs, not correctness.
