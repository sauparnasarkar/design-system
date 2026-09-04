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
  and the later "text-color inheritance gap" entry in `PLAN.md` if extending
  it). Sets `color` on `[data-theme="analytics"]` itself (not just the usual
  token overrides) because the vendor reset hardcodes `body{color:#4a4a4a}`
  — any component with no explicit `color` of its own otherwise inherits
  that literal light-mode gray instead of the theme's ink, nearly invisible
  on this theme's dark surfaces. Found three times independently (`strong`,
  `table th`, then `KpiStat`'s value) before being fixed at the theme root
  instead of per component — if a new component looks unreadable only under
  this theme, check whether it sets its own `color` before assuming the
  theme is incomplete again.
- **analytics-bright-broadsheet** — light counterpart to `analytics`: warm
  paper canvas (`#F4F2ED`), near-black ink hierarchy, one hot accent
  (vermillion `#D8361B`), square geometry. Hierarchy comes from type size
  and rules, not color everywhere. Like `analytics`, this is a full-coverage
  theme (brand ramp through AG Grid tokens), not the minimal `green.css`
  template. One deliberate exception it and `analytics-bright-signal` share:
  chart panels stay **dark** (`--__s9cmpx-chart-surface: #171614`) inside an
  otherwise-light shell, so the existing vivid categorical series keeps the
  luminance separation it was validated for. `analytics.css` has no
  `.js-plotly-plot` rule to mirror here — its own canvas is already dark
  everywhere, so Plotly's transparent `paper_bgcolor`/`plot_bgcolor` never
  needed a separate panel-painting rule. Both bright themes add one:
  `.js-plotly-plot { background: var(--__s9cmpx-chart-surface) }`, plus a
  `fill: ... !important` override on Plotly's inline-SVG tick/legend/axis
  colors (`--__s9cmpx-static-text-weak` is a light-theme grey Plotly writes
  directly as an SVG attribute, unreachable by a normal CSS override).
  `--__s9cmpx-color-brand-100`/`-200` are hijacked as on-dark chart
  gridline/zeroline values rather than ramp steps — same technique
  `analytics.css` already uses, for the same reason; use `brand-50` or
  `brand-300`+ for actual brand tints.

  Several real gotchas surfaced live adopting this theme in a consumer app,
  worth knowing before the next bright theme hits the same ones:
  - **AG Grid header text was unreadable.** `.__s9cmpx-table .ag-header-cell`
    sets header text color straight to `--__s9cmpx-c-table-label-cell-text-
    color-default` (general body ink) at higher specificity than `.ag-header-
    row`'s own `color: var(--ag-header-foreground-color)` — so `--ag-header-
    foreground-color` never reaches the actual label text in ANY theme, just
    invisibly so wherever body ink and header ink happen to be similarly
    pale. This theme's dark header + light body ink made it visible first,
    but it's latent everywhere — fixed here (and mirrored in
    `analytics-bright-signal.css`) by reasserting `.ag-theme-s9cmpx .ag-
    header-cell { color: var(--ag-header-foreground-color) }` at that same
    specificity.
  - **`Gauge`'s value/tick text sat on its own dark indicator track**, not
    the surrounding (light) card — it previously read `--static-text-
    standard` (this theme's light-surface body ink) regardless, producing
    ~1.5:1 contrast. Fixed in `Gauge.tsx` by reading a new
    `--__s9cmpx-chart-surface-text-weak` token instead (also added to
    `analytics.css`, same value as its existing on-dark ink, so the default
    theme's own already-dark gauge track is unaffected).
  - **Root-level custom-property overrides can be silently shadowed by a
    closer vendor re-declaration.** `--__s9cmpx-c-sidebar-sidebar-item-
    button-background-color-active` (and its text/icon siblings) look like
    plain theme tokens, but vendor CSS re-declares the exact same properties
    directly on `[class*="__s9cmpx-sidebar-nav"]` — a descendant of wherever
    `data-theme` lives. CSS custom-property cascade resolves per element, so
    that nearer vendor declaration wins over a value set only at the theme
    root, no matter how specific the root selector is. The fix has to target
    the same (or a more specific) selector the vendor rule uses, not just
    "the theme root" — confirmed by first shipping the root-scoped version,
    seeing it silently do nothing live, then re-scoping to `[data-theme=...]
    [class*="__s9cmpx-sidebar-nav"]`.
  - **The active sidebar item's icon stayed dark-on-dark even after that
    fix**, because vendor CSS only recolors it via a `--active>svg` *direct
    child* selector — the real DOM nests the icon inside an intermediate
    `.__s9cmpx-sidebar-nav__sidebar-item-icon` wrapper span, so that rule
    never matches at all (inactive icons just inherit the theme's own body
    ink instead, which happens to look correct at rest, masking the gap).
    Fixed with an explicit descendant-selector override on the icon wrapper
    for the active state only.
  - **`KpiStat`'s compact BI-tile typography** (`__s9cmpx-headline4` value,
    plain-case `__s9cmpx-label3` label — a deliberate dense default for other
    consumers, see that component's own docstring) doesn't match this
    theme's own masthead-style KPI cards (large bold value, uppercase
    tracked label). Rather than changing the shared component's default,
    this theme scopes a typography override to `.__s9cmpx-kpi-stat`
    specifically, leaving `KpiStat` usage elsewhere unaffected.
  - **`SidebarNav`'s mobile "Open menu" toggle went invisible** (1.00:1
    contrast) once this theme's header went dark: the button's background,
    `--__s9cmpx-static-background-inverse-standard`, resolves to the exact
    same ink black this theme's own header now uses. `SidebarNav.tsx` now
    routes that button through dedicated `--__s9cmpx-c-sidebar-mobile-
    toggle-background/border/icon-color` tokens (falling back to the
    original inverse tokens, so every other theme is byte-identical to
    before) — this theme overrides them to a white chip, the one place a
    theme needs a header-adjacent floating control to *not* inherit the
    header's own ink.
  - **A long consumer wordmark wrapped to 3 lines and overflowed the
    header's fixed `height: 56px`** on any viewport <=768px wide (confirmed
    via real device emulation, phone and tablet-portrait alike — see
    `PLAN.md`'s mobile-audit entry for the full device matrix). Not
    Broadsheet-specific — every theme's header shares the same fixed
    height — but worth flagging here since long-wordmark apps are exactly
    where it surfaces. `Header.tsx`'s own markup was never the problem; a
    consumer's `logo` content needs explicit `white-space: nowrap` +
    `overflow: hidden` + `text-overflow: ellipsis` + a **`max-width`**
    (not `min-width: 0`) to truncate safely. `min-width: 0` looks like the
    standard fix but is a trap here specifically: `.__s9cmpx-header__left`
    is a CSS Grid item in a `minmax(auto, 1fr)` track, and overriding a
    grid item's own automatic minimum to 0 (via `min-width: 0` **or**
    `overflow` set to anything but `visible`) can let the grid's
    fr-distribution collapse that entire column to 0px instead of just
    letting its content shrink — confirmed live, the whole logo disappeared,
    not just its overflow. `max-width` sidesteps this: the box constrains
    itself directly, so the grid item's reported natural size is already
    small and nothing upstream needs to shrink.
- **analytics-bright-signal** — the polychrome sibling: cool bright canvas
  (`#F3F6FD`), cobalt primary (`#1B4DFF`), a hue per metric group
  (cobalt/violet/magenta) — color does the hierarchy work here instead of
  type size. Same dark-chart-panel split and `brand-100`/`-200` hijack as
  Broadsheet above. Two things it needs that Broadsheet doesn't: two
  non-semantic accent tokens, `--__s9cmpx-accent-secondary` (violet
  `#7A3CFF`) and `--__s9cmpx-accent-tertiary` (magenta `#E0219A`) — "a hue
  per metric group" is this theme's whole idea and the semantic layer has no
  token for it, so consumers apply these directly (`KpiStat` accent rules,
  nav-item icons, a second/third categorical dimension); and four remapped
  base radius steps, `--__s9cmpx-border-radius-2/3/4/6` → 4/6/8/10px, since
  rounder geometry is part of its character — the step *names* no longer
  match their pixel values after this, though the order stays monotonic
  (which is what components actually rely on). Reserved for a future
  consumer as of this writing; not yet adopted by any app.
- **analytics-bright-signal-tidewater** — a sibling of `analytics-bright-
  signal`, not a replacement (Signal stays exactly as it is): same
  structure (cool bright canvas, white cards, dark chart panels, rounder
  geometry, one hue per metric group), primary moved from cobalt `#1B4DFF`
  to deep teal-blue `#0A6E8C`, accents to sea-green `#0F7A6D` and ochre
  `#A2660A`, chart ground to `#061E28`. Built for
  `climate-emissions-analysis-project`'s GHG dashboard, where the hue choice
  is load-bearing rather than cosmetic: green/red already mean
  emissions-fell/emissions-rose there, so a green brand would compete with a
  live semantic — water/atmosphere instead of foliage sidesteps that and
  keeps the Overview map's pale-yellow-to-deep-maroon magnitude ramp
  unambiguous too. Unlike Signal, this theme **does** darken its header
  (`--__s9cmpx-c-header-background-color: #06222D`), so it needs — and
  carries — the same vendor-gap fixes `analytics-bright-broadsheet`
  documented rather than Signal's smaller set: the dark-header inline
  `color` `!important` overrides on `Header.tsx`'s logo/icon buttons, the
  sidebar active-token cascade re-scope to `[class*="__s9cmpx-sidebar-nav"]`,
  and the active-icon wrapper-span reassertion. Also carries the
  `--__s9cmpx-c-sidebar-mobile-toggle-*` trio, which this theme genuinely
  needs on its own terms (not copied defensively): its header resolves to
  the same value the toggle's inverse-token fallback does, the same
  invisible-button failure Broadsheet hit first.

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

`suppressCellFocus` is set unconditionally (AG Grid: no keyboard navigation
into cells at all) — deliberate, not an oversight: Tab-stopping through
every cell of a purely-informational table is worse for keyboard/screen-
reader users than skipping the table's internals entirely, and most
`DataTable` usages across every consumer app have no per-row action at all.
**If a consumer wires a row to navigate or open something on click, use the
`onRowActivate` prop instead of a hand-rolled `gridOptions.onRowClicked`** —
a mouse-only `onRowClicked` is a real, confirmed keyboard-accessibility gap
(verified live in an audit: Enter on a keyboard-focused cell did nothing).
`onRowActivate` re-enables cell focus for that one table and wires both the
click and Enter/Space-on-a-focused-cell paths to the same handler, so the
row-level action is reachable either way.

## 5. Component catalog (65)

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
DateRangeDropdown (logic-tested), DropdownMenu (logic-tested), PromptBar
(logic-tested — controlled prompt/chat input composing Textarea + Button +
Spinner; landing/docked variants (same width as of the fix below the
consuming app requested — landing no longer caps narrower than docked),
auto-grow capped at 4 lines, Enter/Shift+Enter handling, loading/disabled
states, optional `expandedContent` — a panel that grows from inside the
bar's own border on focus, collapses on blur-away or a successful submit
(dual collapse paths: trySubmit itself, and a `loading`-driven effect for
a caller submitting externally, bypassing trySubmit) — and a forwardRef
exposing the underlying textarea so a caller can move focus into it
programmatically, e.g. after prefilling `value` from a suggestion)

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
column / stacked+line / grouped / multi-line, plus band/choropleth/treemap
kinds; a colorValues-less treemap previously crashed Plotly's own
`cleanData` on first draw — a real bug, fixed 2026-09-02: the trace builder
left a `marker: undefined` key present (vs. omitted) on the trace object,
which Plotly's `cleanData` treats differently from a genuinely absent key;
see the "RESOLVED" update inside the "text-color inheritance gap + SyChart
sizing + open treemap crash" entry in `PLAN.md` for the full root cause,
including why every JSON-based repro attempt failed to reproduce it) +
ChartCard

**Content/marketing** — News, MediaObject, CardCarousel, ContactItem,
ContactModule

**Identity & messaging** — Logo (generic `markSrc`/`wordmark` lockup, no
Syena default — see §3), Chatbot (generic `title`/`messages`, no hardcoded
assistant name)

**App shell** — Header, SidebarNav (logic-tested — optional `persistentAction`:
a single always-visible action rendered next to the menu toggle, present in
every state (expanded, collapsed-to-rail, and the mobile drawer's closed
floating-button state) unlike a regular nav item, for a feature prominent
enough to want a persistent entry point rather than living inside the page
list), SidebarNavFlyout, AppSwitcher, Footer

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
Apply gating); JumpLinks, BackToTop (post-ship scroll/focus fixes); PromptBar
(autofocus per variant, Enter/Shift+Enter handling, empty-value submit
guard, loading/disabled states, expandedContent show/hide on focus, no
refocus or re-expand once loading resolves, auto-grow capping).

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
