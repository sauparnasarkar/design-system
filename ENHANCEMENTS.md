# Proposed Enhancements

> **2026-07-11 rebrand note:** the system is now the **Syena Design System**
> (`sy-` prefix, themes: Syena Default / Green / Blue, `ag-theme-syena`,
> SyChart). Older entries below use the pre-rebrand `fg-`/Fitch names for
> historical accuracy — map fg-→sy- when acting on them. The namespace fork
> also completes the first step of item 16 (de-vendor).
>
> **2026-07-21 white-label rename note:** the `sy-` prefix above is itself now
> historical — class names/CSS custom properties were renamed again, this
> time to `__s9cmpx-`, to remove hardcoded Syena identity ahead of using this
> system as the basis for a future white-label platform (`ag-theme-syena` →
> `ag-theme-s9cmpx`). Entries below using `sy-`/`--sy-*` predate that rename
> — map sy-→__s9cmpx- when acting on them. See "White-label rework" in
> `PLAN.md`.

Status: proposals only — nothing here is queued. Say the word and any item
becomes a task. Current state for context: 59 components, 3 themes, vendored
fg CSS v7.32.2, Storybook 10, all typechecked and visually verified.

## Tier 1 — highest value next

1. **Interaction & a11y test pass** — **CLOSED 2026-07-21.**
   `@storybook/addon-vitest` and `addon-a11y` were installed but unused (no
   `vitest.config`, no `"test"` script, zero test files) — now wired up:
   `npm test` runs every `*.stories.tsx` as a real test (mount + automatic
   a11y/axe-core check) plus a Node-environment unit-test project. Explicit
   `play`-function assertions were added to `DataTable`, `Logo`, `Footer`,
   `Chatbot`, `AppSwitcher` (the components touched by the white-label
   rework) and a static guard test against reintroducing hardcoded `Syena`
   strings. Details: "Testing wired up" in `PLAN.md`.
   The remainder — the originally-proposed `play` functions for the
   interactive components (Select, MultiSelect, NestedMultiSelect, Tabs,
   Modal, Drawer, TableFilter, Pagination, Slider) plus turning a11y from
   `todo` to enforced — landed in
   sauparnasarkar/design-system#3: shared focus-trap hook for Modal/Drawer,
   roving-tabindex arrow-key nav for Tabs, highlighted-index keyboard
   handling for TableFilter, tree keyboard nav for NestedMultiSelect, `play`
   tests for all 9 components, and `a11y.test` flipped to `'error'` with
   every violation it surfaced fixed (a shared contrast token failing WCAG
   AA, missing accessible names on Slider/Progress/Score/NestedMultiSelect,
   an invalid `aria-activedescendant` on Select's and TableFilter's implicit
   `role="button"`, an unreachable ChartTooltip scroll region, a
   heading-order jump in the ClimateDashboard template, and stale demo-story
   colors from the white-label rework). `npm test` → 69 files, 121 tests,
   all passing. Details: "Interaction & a11y test pass" in `PLAN.md`.
2. **Visual regression CI (Chromatic)** — `@chromatic-com/storybook` is
   already in the addons. Init a git repo, wire `build-storybook` + Chromatic
   in GitHub Actions, snapshot all stories in all 3 themes. This locks in the
   pixel fidelity we verified by hand.
3. **Real fg icon set** — the current Icon component is 17 hand-drawn glyphs.
   The products inline their real SVGs in markup (`fg-icons` classes appear
   610× per page). Crawl one authenticated page per app with Playwright,
   harvest the distinct inline `<svg>`s, and generate a complete typed icon
   set. Biggest remaining visual-fidelity gap.
4. **Page templates** — composed stories replicating full screens for
   prototyping: Reports list (filter bar + DataTable + Pagination), Entity
   detail (Breadcrumb + JumpLinks + Score + ContactModule), Advanced Search
   (NestedMultiSelect + DateRangeDropdown + results grid), BMI geography
   overview. The AppShell story proves the pattern; these make the Storybook
   usable as a prototyping kit.

## Tier 2 — capability gaps

5. **Charts — BUILT 2026-07-09** as `FgChart` + `ChartCard`
   (plotly.js-dist-min; palette/fonts read from CSS vars so themes apply;
   four production shapes as stories). Original verification notes:
   VERIFIED 2026-07-09 on live FR PRO pages (banks#issuers,
   clo-deal-surveillance): charts are **Plotly.js** wrapped in `fg-chart` /
   `fg-chart-plotly` (styles already in our vendored CSS, incl.
   chart-tooltip-template + a candlestick variant). Build an `FgChart`
   wrapper (react-plotly.js) preconfigured with fg fonts + categorical token
   palette, covering the four shapes seen in production: single-series
   column, stacked column (+ optional line overlay), grouped column,
   multi-series line. Also a `ChartCard` composition (Card header w/
   Select/SegmentedControl/download button, legend, "Data as of" caption) —
   scaffolding parts all exist. Screenshots:
   `analysis/fitch-ratings/charts-*.png`. Notes: ABS "Indices" tabs are
   third-party Infogram iframes (out of scope); earlier Highcharts guess was
   wrong for FR PRO.
5b. **Data-tool table presets — BUILT 2026-07-09** as HeatCell/heatColumn,
   TrendCell/trendColumn (note: `--fg-static-background-sentiment-*` are the
   pale tints; `inverse-*` are saturated), TableToolbar, and CardCarousel;
   AG Grid row grouping is Enterprise-only so the story uses flat rows.
   Original verification notes: VERIFIED 2026-07-09 on Transition-and-Default
   and Sensitivity-Monitor: both are AG Grid tools our DataTable can already
   host, but two cell patterns deserve packaged renderers + stories:
   (a) transition-matrix heat cells (tinted % cells via
   `fg-table-highlight-cell`), (b) sentiment trend cells (Better/Neutral/Worse
   full-cell fills from `--fg-static-background-sentiment-*`). Plus row
   grouping (sector groups) and a grid toolbar composition (Filter / Export /
   Manage Columns / Select Portfolio ghost buttons — all existing
   components). Sensitivity-Monitor also confirmed
   `fg-nested-checkbox-virtualized` in production (see item 8) and a
   "Related Tools & Data" card carousel → small `CardCarousel` wrapper over
   MediaObject cards with paging arrows.
6. **DataTable editing + date filters** — wire `fg-cell-edit` for inline cell
   editing, and build the `date-table-filter` / `date-range-table-filter`
   popovers to complete the filter family alongside TableFilter.
7. **SidebarNav flyout integration** — SidebarNavFlyout exists as a panel;
   attach it to SidebarNav items on hover/click with positioning (the
   products use tippy; floating-ui would be the modern equivalent).
8. **Virtualized nested checkbox trees** — `nested-checkbox-virtualized`
   exists in the vendor CSS for huge option sets (all countries); add
   windowing to NestedMultiSelect for 1k+ options.
9. **Remaining vendor blocks (~85)** — mostly niche (entitlement,
   radio-buttons group, input-field, sectors-dropdown, media-loader…). Build
   on demand; the per-block reference CSS in
   `analysis/fg-design-system/components/` makes each one ~30 min.

## Tier 3 — platform & workflow

10. **Package the library** — Vite library mode build of `src/index.ts`
    (ESM + d.ts, React as peer dep, CSS as exports) so real apps can
    `npm install` it instead of copying from Storybook.
11. **Theme builder** — a script that takes one accent hex and emits a full
    theme override file (ramp generation + button/interactive token mapping),
    so new product themes take seconds; optionally a live theme-editor story.
12. **Dark theme exploration** — the token set has complete `inverse-*`
    semantic tokens; prototype a dark theme from them as a 4th toolbar entry.
13. **Vendor version watcher** — small script (or scheduled agent) that
    checks `global-assets.fitch.group/apps/design-system/` for versions newer
    than 7.32.2, downloads, and diffs tokens/classes so the replica tracks
    Fitch's releases.
14. **Storybook polish** — viewport presets matching the breakpoints found in
    the vendor CSS (560/768/960/1440/1920), theme-aware canvas backgrounds,
    sidebar reorganized into Foundations / Forms / Data Display / Feedback /
    Navigation / Shell.
15. **Publish to a Claude Design project** — push the component previews to
    claude.ai/design via /design-sync so the design system is browsable
    outside Storybook.
16. **De-vendor the CSS (licensing hygiene)** — if this ever needs to be
    distributed beyond internal prototyping, regenerate the component CSS
    from the token file + reference styles so no Fitch-compiled asset ships;
    the 186 split reference files make this tractable.

## Known small defects (fix opportunistically)

- Avatar default background is white (vendor-accurate but invisible on white
  surfaces) — consider defaulting `gray` to true.
- KrfSlider track geometry uses approximated 4%-inset margins rather than the
  vendor's `--option-width` calc; fine at 10 notches, drifts slightly at 3.
- Toast reproduces react-toastify's box styles inline; if exact parity
  matters, add react-toastify and mount ours inside its container.
- `npm run dev` is broken (the Vite app entry was removed in favor of
  Storybook-only); either restore a minimal `main.tsx` or delete the script.
