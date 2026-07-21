# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The Syena Design System: a React 19 + TypeScript component library and design
tokens, documented and tested through Storybook. It is meant to become the
basis of a future white-label platform — see "Namespace" below before adding
anything brand-specific.

## Commands

```bash
npm run storybook       # dev server, http://localhost:6006 (probe the port first — often already running in the user's own terminal)
npm test                # vitest run — full suite (storybook project + unit project)
npm run test:watch      # vitest watch mode
npm run build            # tsc -b && vite build
npm run build-storybook  # static Storybook build
npm run lint              # oxlint
```

Running a single story/test file:
```bash
npx vitest run -t "<story or test name>"
npx vitest run src/components/Select/Select.stories.tsx
```

## Architecture

### Token-driven styling, not a normal component-CSS setup

Nothing here uses CSS Modules, styled-components, or Tailwind for component
styling. Everything routes through hand-authored vendor CSS plus CSS custom
properties:

- `src/styles/vendor/syena-default-theme.css` — ~1,100 `--__s9cmpx-*` custom
  properties (17 color ramps, semantic colors, type scale, per-component
  tokens, 3 chart palettes). This is the base theme, always loaded.
- `src/styles/vendor/sy-design-system.min.css` — component class rules
  (`.__s9cmpx-button`, etc.) that consume the tokens above via
  `--__s9cmpx-c-*` component-level variables. This is a vendored/forked
  library, not something to hand-edit component-by-component — see
  Provenance below.
- `src/styles/vendor/sy-design-system-reset.min.css` — CSS reset, loaded
  first.
- `src/styles/themes/{green,blue,analytics}.css` — small overrides (~30
  tokens each) scoped to `[data-theme="..."]`, loaded after the base theme.
  A new theme is a new file in this pattern plus registering it in
  `.storybook/preview.tsx`'s toolbar `items` list.
- `src/styles/overrides.css` — the design system's own bug-fix layer for
  cases where the vendored CSS needs a correction that shouldn't touch the
  vendor files directly. **This file must be imported by any consuming app**
  (not just Storybook's preview) — it was previously Storybook-only and a
  real bug shipped silently to a consumer as a result.

React components emit these vendored class names (`__s9cmpx-*`) rather than
defining their own styles — a component's job is prop → class name/variant
mapping, using the `cx()` helper (`src/lib/cx.ts`) to join classes. Look at
`src/components/Button/Button.tsx` as the template for this pattern.

### Namespace: no hardcoded brand identity

All classes/CSS vars/BEM blocks live under the `__s9cmpx-` namespace
(renamed from `sy-`/`Syena` on 2026-07-21 — see PLAN.md "White-label
rework"). Rules that follow from this and are enforced by tests/types, not
convention:

- `src/__tests__/no-vendor-strings.test.ts` fails the build if a hardcoded
  `Syena`/`syena` string appears anywhere under `src/components/**/*.tsx`
  (excluding `*.stories.tsx`) or `src/styles/**/*.css`. Story files are
  exempt — they're internal docs and legitimately demonstrate usage with
  Syena's own branding passed as explicit example props.
- Components that need branding take it as required props with no
  Syena-specific default (e.g. `Footer.copyright`, `Chatbot.title`,
  `Logo`'s `markSrc`/`wordmark`/`accent`) — a forgotten override is a type
  error, not a silent brand leak.
- `"sideEffects": false` in `package.json` matters here: without it,
  bundlers can't tree-shake an unused component whose module imports an
  asset at module scope, and that asset ships to consumers even when
  unused. Keep it `false` and keep component modules free of module-scope
  side effects beyond CSS/asset imports.
- When adding a new vendor-CSS-backed identifier (e.g. an `ag-theme-*` AG
  Grid theme name), it must match in lockstep across the component `.tsx`,
  any `.css` referencing it, and the vendor CSS blob — a mismatch breaks
  styling silently rather than erroring.

### Component structure

`src/components/<Name>/` holds `<Name>.tsx` + co-located `<Name>.stories.tsx`
(no separate test files per component — see Testing below). Public exports
are re-exported individually from `src/index.ts`; add new components there.

`src/lib/` — small shared helpers (`cx`, `useFocusTrap`).
`src/tokens/` — Storybook-only stories that showcase token values (color
ramps, semantic colors, type scale) rather than components.
`src/assets/logos/` — brand assets consumers can pass explicitly (e.g.
`syena-mark.png`); components never import brand assets on their own.

### DataTable / AG Grid

`DataTable` wraps `ag-grid-react` skinned via `ag-theme-s9cmpx` (vendor CSS
defines `.__s9cmpx-table .ag-*` rules). This is the one component backed by
a third-party grid engine rather than plain vendor CSS classes — expect its
theming to work differently (AG Grid theme class + `ag-theme-s9cmpx` pairing)
than every other component.

## Testing

`npm test` runs two Vitest projects (`vite.config.ts`):

- **`storybook`** project — every `*.stories.tsx` runs as a live test: mounts
  the story, runs its `play` function if present, and enforces an automatic
  axe-core a11y check per story (`a11y.test: 'error'` in
  `.storybook/preview.tsx` — a violation fails the test, not just reports
  it). This is the primary test coverage mechanism; most components have no
  dedicated test file, only stories.
  - Interactive components (`Select`, `MultiSelect`, `Slider`, `Pagination`,
    `Tabs`, `Modal`, `Drawer`, `TableFilter`, `NestedMultiSelect`, ...) have
    `play` functions using `storybook/test` (`within`, `userEvent`,
    `expect`) exercising keyboard interaction — arrow-key navigation, focus
    traps, roving tabindex, tree navigation. Follow this pattern (see
    `Select.stories.tsx`) when adding interaction coverage for a new
    component rather than writing a separate test file.
- **`unit`** project — plain Node-environment tests matching
  `src/**/*.test.ts` (not `.stories.tsx`), currently just
  `no-vendor-strings.test.ts`.

When changing a color token, re-run the full suite — a11y contrast failures
cascade across many stories at once (a single token fix once resolved 338 of
345 violations). If you need to compute a replacement color for a contrast
failure, use the WCAG relative-luminance formula rather than guessing.

## Provenance

Component styling and token architecture were derived from screenshots and
computed-style extraction of production financial-data UIs (archived,
unshipped, under `analysis/`). The vendor CSS in `src/styles/vendor/` is a
forked/renamed copy of that research, not something authored from scratch —
treat it as a third-party dependency when debugging (check what class/token
actually exists in the vendor file) rather than assuming a component's CSS
lives entirely in its own `.tsx`.

## Where to look for more context

- `README.md` — user-facing overview, component inventory, theme list.
- `PLAN.md` — full dated project history (site analysis, rebrand, white-label
  rework, testing pass) with the reasoning behind non-obvious decisions.
- `ENHANCEMENTS.md` — proposed backlog; check before assuming a gap is
  unnoticed.
