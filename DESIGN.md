# DESIGN.md

Reference for how the Syena Design System is built: token architecture,
theming model, component catalog, and the conventions established across it.
This is the "how it's built and how to build the next thing consistently"
document — for narrative/dated project history see `PLAN.md`; for the
proposed backlog see `ENHANCEMENTS.md`; for a one-page consumer overview see
`README.md`.

This document is shared across consuming projects — anything brand-specific
belongs in a consumer's own docs, not here.

## 1. Token architecture

Nothing in this system uses CSS Modules, styled-components, Tailwind, or
inline style objects for component styling (a few `.stories.tsx` decorators
are the only exception). Styling is entirely CSS custom properties consumed
by hand-authored vendor CSS classes, in three layers loaded in this order:

1. **Reset** — `src/styles/vendor/sy-design-system-reset.min.css`. Loaded
   first, always.
2. **Base theme (tokens)** — `src/styles/vendor/syena-default-theme.css`.
   ~1,100 `--__s9cmpx-*` custom properties. This is the token source of
   truth — every color, spacing, type, and per-component value a class rule
   can reference. Categories include: 17 color ramps (`--__s9cmpx-color-*`,
   `--__s9cmpx-grey-*`, `--__s9cmpx-blue-*`, `--__s9cmpx-green-*`,
   `--__s9cmpx-red-*`, `--__s9cmpx-yellow-*`, ...), semantic tokens
   (`--__s9cmpx-static-*`, `--__s9cmpx-interactive-*`,
   `--__s9cmpx-text-*`, `--__s9cmpx-border-*`), a full type scale
   (`--__s9cmpx-font-*`, `--__s9cmpx-letter-*`, `--__s9cmpx-paragraph-*`),
   per-component tokens (`--__s9cmpx-button-*`, `--__s9cmpx-tag-*`,
   `--__s9cmpx-table-*`, `--__s9cmpx-dropdown-*`, `--__s9cmpx-tabs-*`,
   `--__s9cmpx-checkbox-*`, `--__s9cmpx-radiobutton-*`, ...), 3 chart
   palettes (`--__s9cmpx-chart-*`, `--__s9cmpx-graph-*`), shadows/z-index
   (`--__s9cmpx-shadow-*`, `--__s9cmpx-z-*`). This file is always loaded,
   unconditionally — it's the only theme with no `[data-theme]` scoping.
3. **Component CSS** — `src/styles/vendor/sy-design-system.min.css`. Class
   rules (`.__s9cmpx-button`, `.__s9cmpx-tag`, ...) that consume layer 2's
   tokens through `--__s9cmpx-c-*` component-level variables. This is a
   vendored/forked library (see Provenance in `CLAUDE.md`) — treat it as a
   third-party dependency, not something to hand-edit component-by-component.
   If a rule looks wrong, check what actually exists in this file before
   assuming the bug is in a component's `.tsx`.
4. **Overrides** — `src/styles/overrides.css`. The design system's own
   bug-fix layer, for cases where the vendored CSS needs a correction that
   shouldn't touch the vendor file directly (vendor files are meant to stay
   diffable against upstream). **Every consuming app must import this file**
   directly, not just rely on Storybook's preview importing it — a real bug
   once shipped silently to a consumer because this file was Storybook-only.
5. **Theme overrides** — `src/styles/themes/{green,blue,analytics}.css`,
   loaded last, each scoped under `[data-theme="..."]`. See §2.

A React component's job is prop → class name/variant mapping onto these
vendor classes via the `cx()` helper (`src/lib/cx.ts`, joins class names and
skips falsy values) — never emitting its own styles. `Button.tsx`
(`src/components/Button/Button.tsx`) is the canonical example: variant/size
enums map straight to `__s9cmpx-button--${variant}` / `--${size}` modifier
classes, booleans map to boolean modifier classes, and everything not
component-specific (native `<button>` attributes, `disabled`, `className`)
passes through via `...rest`.

## 2. Theming model

A theme is a small override file — roughly 30 tokens — layered after the
base theme, scoped to `[data-theme="name"]`, redefining only what changes
for that brand/context (brand color ramp, primary interactive/button
tokens). Everything else falls through to the base theme's tokens
unchanged. `src/styles/themes/green.css` is the template: it redefines
`--__s9cmpx-color-brand-*` (the 50–1000 ramp), `--__s9cmpx-interactive-fill-primary-*`,
and `--__s9cmpx-button-primary-*-{background,border,label}` per state
(default/hover/focused/pressed/loading) — nothing else.

Current themes:
- **default** — no override file; the base theme's own neutral/black
  primary.
- **green** — teal accent (`#187272` family).
- **blue** — royal blue accent.
- **analytics** — SciChart-inspired dark data-viz theme: deep navy canvas,
  cyan accent, its own vivid chart palette validated for a dark surface
  (the one theme that goes beyond the ~30-token pattern — it needed fuller
  dark-mode token coverage; see "Analytics theme: full dark token coverage"
  in `PLAN.md` if extending it).

To add a theme: create `src/styles/themes/<name>.css` following the
green.css pattern, import it in `.storybook/preview.tsx`, and register it
in that file's toolbar `globalTypes.theme.items` list (`{ value: 'name',
title: '... theme' }`). The preview's decorator sets `data-theme` on a
wrapper div from the toolbar selection — that's the only wiring a consuming
app needs to replicate (set `data-theme` on an ancestor element) to pick up
a theme at runtime.

## 3. The `__s9cmpx-` namespace (white-label constraint)

Every class name, CSS custom property, and BEM block in this system lives
under the `__s9cmpx-` namespace — a deliberately meaningless prefix chosen
so this system can become the basis of a white-label platform with no
hardcoded brand identity leaking into shipped code. (History: renamed from
`sy-`/`Syena` on 2026-07-21 — see "White-label rework" in `PLAN.md`.)

This is enforced, not just conventional:

- `src/__tests__/no-vendor-strings.test.ts` fails `npm test` if a hardcoded
  `Syena`/`syena` string appears anywhere under `src/components/**/*.tsx`
  (excluding `*.stories.tsx`) or `src/styles/**/*.css`. Story files are
  exempt — they're internal docs and legitimately demonstrate usage with
  Syena's own branding as explicit example props.
- Components that need branding take it as **required props with no
  Syena-specific default** — `Footer.copyright`, `Chatbot.title`, `Logo`'s
  `markSrc`/`wordmark`/`accent`. A forgotten override is a type error, not a
  silent brand leak.
- `"sideEffects": false` in `package.json` — bundlers can only tree-shake an
  unused component if its module has no side effects at module scope. Keep
  new component modules free of module-scope side effects beyond CSS/asset
  imports, or an unused component's assets ship to consumers anyway.
- A new vendor-CSS-backed identifier (e.g. an `ag-theme-*` AG Grid theme
  name) must match **in lockstep** across the component `.tsx`, any `.css`
  referencing it, and the vendor CSS blob — see `DataTable.tsx`'s
  `ag-theme-s9cmpx` pairing (`cx('__s9cmpx-table', 'ag-theme-s9cmpx', ...)`,
  matched against `.__s9cmpx-table .ag-*` rules in the vendor CSS). A
  mismatch here breaks styling silently, not with an error.

## 4. Component structure

`src/components/<Name>/` holds `<Name>.tsx` plus a co-located
`<Name>.stories.tsx`. There are no separate `*.test.tsx` files per
component by convention — story files carry both documentation and test
coverage (§6). Public components are re-exported individually from
`src/index.ts`; add new components there, not via a barrel/wildcard export.

- `src/lib/` — shared helpers used across components: `cx.ts` (class-name
  join), `useFocusTrap.ts` (shared focus-trap hook used by Modal and
  Drawer).
- `src/tokens/` — Storybook-only stories showcasing raw token values
  (`Colors.stories.tsx`, `Typography.stories.tsx`) rather than components.
  Look here when you need to see the full color ramp/type scale rendered
  rather than reading the raw CSS custom properties.
- `src/assets/logos/` — brand assets a consumer can pass explicitly (e.g.
  `syena-mark.png`). Components never import brand assets themselves —
  matches the required-props rule in §3.

### DataTable is the one exception

`DataTable` wraps `ag-grid-react`, skinned via the `ag-theme-s9cmpx` +
`__s9cmpx-table` class pairing described in §3, rather than being built from
plain vendor CSS classes like every other component. If you're extending
DataTable, its theming works differently from the rest of the system —
check both the AG Grid theme class and the vendor `.__s9cmpx-table .ag-*`
rules, not just one.

## 5. Component catalog (64)

Grouped by function. All are exported from `src/index.ts`; `(logic-tested)`
marks components with a `play`-function test beyond mount+a11y — see §6 for
what that means and when to add one for a new component.

**Foundational** — Typography, Link

**Actions & selection controls** — Button, Tag, Chip, Checkbox
(logic-tested), Radio (logic-tested), Toggle (logic-tested), SegmentedControl
(logic-tested)

**Forms & inputs** — Input (logic-tested), Textarea, SearchInput, Select
(logic-tested), MultiSelect (logic-tested — dropdown opens with a
type-to-search box filtering by label; opt out per instance with
`suppressSearch`), NestedMultiSelect (logic-tested), Counter, FileUpload,
DateRangeDropdown (logic-tested), DropdownMenu (logic-tested)

**Navigation** — Tabs (logic-tested), TabsWrapper, Breadcrumb, Pagination
(logic-tested), JumpLinks (logic-tested — scroll/focus regression coverage
across several post-ship fixes, see SPEC.md §5.19/§5.20), BackToTop
(logic-tested)

**Sliders & range input** — Slider (logic-tested), RangeSlider
(logic-tested — dual-thumb, cross-clamped, APG multi-thumb slider pattern,
for continuous ranges e.g. a year filter), KrfSlider (logic-tested)

**Overlays & feedback** — Modal (logic-tested — shared focus trap), Drawer
(logic-tested — shared focus trap), Toast, Tooltip, InlineAlert, BannerAlert,
Spinner, DotTyping

**Layout & content containers** — Card + CardHeader, Tile, Accordion
(logic-tested), Section, Divider, EmptyState

**Data display** — Table, DataTable (logic-tested — AG Grid, see §4) +
presets (HeatCell, TrendCell, TableToolbar), TableFilter (logic-tested),
Score (logic-tested), Progress (logic-tested), Gauge (logic-tested), KpiStat,
Avatar, Icon

**Charts** — ChartTooltip (logic-tested), SyChart (logic-tested — Plotly:
column / stacked+line / grouped / multi-line) + ChartCard

**Content/marketing** — News, MediaObject, CardCarousel, ContactItem,
ContactModule

**Identity & messaging** — Logo (generic `markSrc`/`wordmark` lockup, no
Syena default — see §3), Chatbot (generic `title`/`messages`, no hardcoded
assistant name)

**App shell** — Header, SidebarNav, SidebarNavFlyout, AppSwitcher, Footer

**Composed page stories** (not exported components — demonstrate
composition) — `Shell/AppShell`, `Templates/ClimateDashboard`

## 6. Testing conventions

`npm test` runs two Vitest projects (defined in `vite.config.ts`):

### `storybook` project — the primary coverage mechanism

Every `*.stories.tsx` runs as a live test: mounts the story, runs its `play`
function if present, and enforces an automatic axe-core a11y check per story
(`a11y.test: 'error'` in `.storybook/preview.tsx` — a violation fails the
test, not just reports it).

**Convention: extend story-embedded `play` functions, not separate test
files.** When a component has real interaction logic worth testing
(keyboard nav, clamping, open/close state, controlled/uncontrolled
behavior, callback firing), add a `play` function to its story rather than
writing a `<Name>.test.tsx`. Use `storybook/test`'s exports: `within`,
`userEvent`, `expect`, `fireEvent`, `fn`, `waitFor`. `Select.stories.tsx`
and `Accordion.stories.tsx` are good templates — see their `play` functions
for the pattern of grabbing the canvas via `within(canvasElement)`, driving
interaction via `userEvent`, and asserting on ARIA state
(`aria-expanded`, `aria-checked`, `aria-valuenow`) rather than incidental
DOM structure.

Components with `play`-function tests as of this writing: DataTable, Logo,
Footer, Chatbot, AppSwitcher (white-label rework regression coverage);
Select, MultiSelect, NestedMultiSelect, Slider, RangeSlider, Pagination,
Tabs, Modal, Drawer, TableFilter (keyboard interaction, focus traps, roving
tabindex, tree nav, cross-clamping, type-to-search); KrfSlider, Accordion,
DropdownMenu, DateRangeDropdown, Checkbox, Radio, Toggle, Input,
SegmentedControl, ChartTooltip, Gauge, Score, Progress (round-2 pass —
clamping, single-vs-multiple open state, select-closes-menu, custom-range
Apply gating); JumpLinks, BackToTop (post-ship scroll/focus fixes).

~40 components remain mount+a11y only — this is a deliberate, documented
state for low-logic/presentational components (Divider, Typography,
Spinner, Tag, Avatar, Breadcrumb, ...), not an oversight. See ENHANCEMENTS.md
Tier 1 item 1a before assuming a gap needs closing; only add a `play`
function when a component actually grows interaction logic worth
regression-testing.

**Pitfalls hit while writing these tests, worth knowing before adding
more:**
- `role="option"` wrapping a `<button>`: the accessible name resolves from
  the button's text, but a click dispatched at the wrapping element won't
  bubble down into the button's own handler. Query for the element that
  actually owns the click handler (often `getByRole('button', ...)`, not
  `'option'`).
- Native `<input type="date">`: `userEvent.type()` doesn't reliably set a
  literal ISO value (locale/segment-order quirks). Use
  `fireEvent.change(input, { target: { value: 'YYYY-MM-DD' } })` instead.
- jest-dom's `toBeVisible()` checks computed `opacity`, so it races any CSS
  fade-in animation that starts at `opacity: 0` — assert
  `.toBeInTheDocument()` when presence, not animation-timing, is what's
  actually under test.

### `unit` project — plain Node-environment tests

Matches `src/**/*.test.ts` (not `.stories.tsx`). Currently:
`no-vendor-strings.test.ts` (§3's namespace guard), plus
`SyChart/chartMath.test.ts` and `Score/Score.test.ts`, which unit-test pure
logic extracted out of those two components rather than only exercising it
through a rendered story.

**Convention: extract Plotly-adjacent (or otherwise DOM/browser-coupled)
pure logic into a sibling module when it needs direct unit testing.**
`SyChart.tsx` can't be imported at all from a Node-environment test — it
pulls in `plotly.js-dist-min` at module scope, which references the
browser-only global `self` and throws immediately under Node. Its pure
color/tick math (`withAlpha`, `logColorbarTicks`) lives in a Plotly-free
sibling, `SyChart/chartMath.ts`, which `SyChart.tsx` imports from; the test
file imports from `chartMath.ts` directly. Follow this split for any future
pure logic worth unit-testing out of a Plotly-backed component (`Gauge` is
a flagged future candidate — not yet done, since its only current "logic"
is a one-line color fallback, not complex enough to warrant extraction
yet).

### Color token changes need a full-suite re-run

A11y contrast failures cascade — a single shared token fix once resolved
338 of 345 violations in one pass. If you need to compute a replacement
color for a contrast failure, use the WCAG relative-luminance formula
rather than guessing at a hex value.

## 7. Provenance

Component styling and token architecture were derived from screenshots and
computed-style extraction of production financial-data UIs (archived,
unshipped, under `analysis/`). The vendor CSS in `src/styles/vendor/` is a
forked/renamed copy of that research, not authored from scratch — when
debugging, check what class/token actually exists in the vendor file rather
than assuming a component's full styling lives in its own `.tsx`.

## 8. Where else to look

- `README.md` — user-facing overview, quick start, theme list.
- `PLAN.md` — full dated project history with the reasoning behind
  non-obvious decisions (rebrand, white-label rework, each testing pass).
  This document (`DESIGN.md`) describes the resulting system; `PLAN.md`
  describes how and why it got that way.
- `ENHANCEMENTS.md` — proposed backlog; check before assuming a gap in
  coverage or capability is unnoticed.
- `CLAUDE.md` — guidance aimed at Claude Code specifically (commands,
  quick architecture summary); this document is the fuller standalone
  reference the same material is distilled from.
