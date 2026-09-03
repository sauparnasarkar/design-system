# Syena Design System

The component library and design tokens for **Syena Intelligent Systems**
products, documented in Storybook.

```bash
npm install
npm run storybook   # http://localhost:6006
npm test            # runs every story as a smoke/a11y test, plus unit tests
```

Switch themes with the **Theme** dropdown in the Storybook toolbar:

- **Syena Default** — neutral/black primary (base tokens, no override)
- **Green theme** — teal accent (`[data-theme="green"]`)
- **Blue theme** — royal blue accent (`[data-theme="blue"]`)
- **Analytics theme** — dark data-viz look (`[data-theme="analytics"]`,
  SciChart-inspired): deep navy canvas, cyan accent, and its own vivid
  chart palette validated for the dark surface
- **Analytics Bright — Broadsheet** — light counterpart to Analytics
  (`[data-theme="analytics-bright-broadsheet"]`): warm paper canvas, near-black
  ink hierarchy, one vermillion accent, square geometry; chart panels stay
  dark so the vivid categorical palette keeps its validated luminance
  separation
- **Analytics Bright — Signal** — the polychrome sibling
  (`[data-theme="analytics-bright-signal"]`): cool bright canvas, cobalt
  primary, a hue per metric group (cobalt/violet/magenta), rounded geometry;
  same dark-chart-panel split as Broadsheet

## Architecture

See `DESIGN.md` for the full reference: token architecture, theming model,
the `__s9cmpx-` namespace rules, and the component catalog with established
conventions (story-embedded `play`-function testing, pure-logic extraction
for Plotly-backed components).

Everything is token-driven. `src/styles/vendor/syena-default-theme.css`
defines ~1,100 `--__s9cmpx-*` CSS custom properties (17 color ramps, semantic
colors, a full type scale, per-component tokens, 3 chart palettes);
`sy-design-system.min.css` consumes them via `--__s9cmpx-c-*` component
variables. Themes are small override files in `src/styles/themes/` scoped to
`[data-theme=…]` — a new theme is ~30 token overrides.

> **Namespace note (2026-07-21):** class names and CSS custom properties were
> renamed from `sy-`/`--sy-*` to `__s9cmpx-`/`--__s9cmpx-*` to remove
> vendor-identity (Syena) leaks ahead of using this system as the basis for a
> future white-label platform. The vendor CSS *filenames*
> (`sy-design-system.min.css`, `syena-default-theme.css`) are unchanged —
> only their contents were renamed. See "White-label rework" in `PLAN.md`.

- `src/components/<Name>/` — typed React components emitting `__s9cmpx-*`
  classes (variants/sizes/states as props), each with a `.stories.tsx` with
  controls
- `src/tokens/` — token showcase stories (color ramps, semantic colors, type
  scale)
- `src/assets/logos/syena-mark.png` — the official Syena eagle mark
  (transparent background); `Logo` no longer imports this itself — it's a
  generic lockup taking `markSrc`/`wordmark` as props, and Syena's own stories
  pass this asset explicitly as the example

## Testing

`npm test` (`vitest run`) runs two Vitest projects:
- **`storybook`** — every `*.stories.tsx` file runs as a real test (mounts the
  story, runs its `play` function if present, plus an automatic a11y/axe-core
  check per story via `addon-a11y`, enforced: `a11y.test: 'error'` in
  `.storybook/preview.tsx` fails the test on any violation, not just reports
  it). This covers all ~60 components with zero dedicated test files.
  `DataTable`, `Logo`, `Footer`, `Chatbot`, and `AppSwitcher` additionally
  have explicit `play`-function assertions regression-proofing the
  white-label rework (AG Grid theme class pairing, consumer-supplied
  branding actually rendering). `Select`, `MultiSelect`, `Slider`,
  `RangeSlider`, `Pagination`, `Tabs`, `Modal`, `Drawer`, `TableFilter`, and
  `NestedMultiSelect` additionally have `play`-function tests covering
  keyboard interaction (arrow-key navigation, focus traps on Modal/Drawer,
  roving tabindex on Tabs, tree navigation on NestedMultiSelect, dual-thumb
  cross-clamping on RangeSlider, type-to-search filtering on MultiSelect).
  `KrfSlider`, `Accordion`, `DropdownMenu`, `DateRangeDropdown`, `Checkbox`,
  `Radio`, `Toggle`, `Input`, `SegmentedControl`, `ChartTooltip`, `Gauge`,
  `Score`, and `Progress` additionally have `play`-function tests covering
  their own logic/state (clamping, single-vs-multiple open state,
  select-closes-menu, custom-range Apply gating, etc.) — see "Component-level
  test coverage, round 2" in `PLAN.md` for the full list and rationale.
  `PromptBar` additionally has `play`-function tests covering autofocus
  per variant, Enter/Shift+Enter handling, the empty-value submit guard,
  loading/disabled states, refocus-after-loading, and auto-grow capping.
- **`unit`** — plain Node-environment tests: `src/__tests__/no-vendor-strings.test.ts`
  (fails if a hardcoded `Syena`/`syena` string is reintroduced into non-story
  component source or CSS), plus `SyChart/chartMath.test.ts` and
  `Score/Score.test.ts` unit-testing pure logic extracted out of those two
  components (colorbar tick math / alpha-blend color math; ESG-score-to-ramp
  mapping).

`npm run test:watch` for interactive/watch mode.

## Component inventory (65)

Button, Typography, Link, Tag, Chip, Tabs, TabsWrapper, SegmentedControl,
Checkbox, Radio, Toggle, Input, Select, MultiSelect (dropdown menu opens with
a type-to-search box filtering options by label; opt out per instance with
`suppressSearch`), NestedMultiSelect,
SearchInput, DropdownMenu, DateRangeDropdown, InlineAlert, BannerAlert,
Card(+Header), Tile, Accordion, Breadcrumb, Table, DataTable (AG Grid with
the `ag-theme-s9cmpx` skin) + presets (HeatCell, TrendCell, TableToolbar),
TableFilter, Pagination, Icon, Avatar, Logo (generic markSrc/wordmark lockup),
Modal, Drawer, Toast, Tooltip,
ChartTooltip, SyChart (Plotly: column / stacked+line / grouped / multi-line,
plus band/choropleth/treemap — see DESIGN.md's Charts entry for a real,
fixed treemap crash root-caused to a `marker: undefined` key on
colorValues-less treemap traces) + ChartCard, Slider, RangeSlider (dual-thumb, cross-clamped, APG multi-thumb
slider pattern — for continuous ranges, e.g. a year filter), KrfSlider,
Score, Progress, Spinner, DotTyping, Divider,
Section, Textarea, PromptBar (controlled prompt/chat input bar, landing/docked
variants, composes Textarea + Button + Spinner), Counter, EmptyState, JumpLinks, BackToTop, FileUpload, KpiStat, Gauge, News,
MediaObject, CardCarousel, ContactItem, ContactModule, Chatbot (generic
title/messages, no hardcoded assistant name),
and the app shell (Header, SidebarNav, SidebarNavFlyout, AppSwitcher, Footer)
plus composed page stories: `Shell/AppShell` and `Templates/ClimateDashboard`.

## Roadmap

See `ENHANCEMENTS.md` for the proposed enhancement backlog.

## Provenance

The token architecture and component styling were derived from research into
production financial-data UIs; the raw research (screenshots, computed-style
extractions, reference CSS) is archived under `analysis/` and is not shipped.
All shipped classes and tokens live in the `__s9cmpx-` namespace (renamed from
`sy-` — see the Architecture section above).
