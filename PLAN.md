# Fitch Design System — Working Plan

## Goal
Build a Storybook design system that replicates the design language of three
authenticated Fitch products, with configurable themes and component props:

1. https://pro.sustainablefitch.com/  → theme `sustainable-fitch`
2. https://pro.fitchratings.com/      → theme `fitch-ratings`
3. https://bmi.fitchsolutions.com/    → theme `bmi`

All three sit behind a shared Auth0 login (`auth.fitch.group`); nothing is
publicly reachable, so analysis must happen through a live logged-in browser.

## Stack (decided)
- Vite + React 19 + TypeScript
- Storybook 10 (`@storybook/react-vite`, addon-docs, addon-a11y, addon-vitest, addon-mcp)
- Theming: CSS custom properties, one `[data-theme="..."]` scope per site,
  switched via a Storybook toolbar global (decorator in `.storybook/preview.tsx`)
- Tokens live in `src/tokens/` (colors, typography, spacing, radii, shadows),
  themes in `src/themes/<name>.css`
- Components in `src/components/<Name>/` with co-located `.stories.tsx`

## Site analysis workflow (per site, via Playwright MCP)
1. Navigate to the site; user logs in once in the MCP browser window when the
   Auth0 page appears (user has credentials and offered to log in).
2. Walk the main navigation — visit every top-level menu page and key subpages.
3. On each page: screenshot + extract computed styles via JS evaluation
   (colors in use, font families/sizes/weights, spacing scale, border radii,
   shadows, breakpoints) and inventory components (buttons, inputs, selects,
   tabs, tables, cards, badges, filters, charts, nav, modals, toasts, pagination).
4. Save raw findings under `analysis/<site>/` (screenshots + extracted JSON/notes).
5. Derive shared primitives vs. per-theme token values.

## Build phase
1. Token files + three theme CSS files from analysis.
2. Storybook theme-switcher toolbar + docs page showing token palettes.
3. Components (priority order): Button, Typography, Input/Select/Checkbox,
   Badge/Tag, Card, Tabs, Table (sortable/dense variants), Navigation header,
   Sidebar/menu, Pagination, Modal, Tooltip, Toast — each with full prop
   controls in stories.
4. Verify each component visually against site screenshots in all 3 themes.

## Status (2026-07-08) — COMPLETE
- [x] Playwright MCP + login; all 3 sites analyzed (screenshots + computed
      styles in `analysis/<site>/`)
- [x] KEY FINDING: all 3 sites share the compiled "fg" design system from
      `global-assets.fitch.group/apps/design-system/7.32.x/` (public CDN, no
      auth) — vendored verbatim in `src/styles/vendor/`. Theme file =
      ~1,100 `--fg-*` tokens (Style Dictionary). Sites all load Generic-theme;
      per-site accents (SF teal #187272, BMI royal #4169e1) are app-level.
- [x] Themes: `src/styles/themes/{sustainable-fitch,bmi}.css` override brand
      ramp + interactive/button primary tokens under `[data-theme]`;
      Storybook toolbar switcher in `.storybook/preview.tsx`
- [x] 23 React components emitting real fg-* classes + stories with controls
      (see README); token showcase stories in `src/tokens/`
- [x] Visual verification vs site captures (`analysis/verification/`);
      typecheck clean

- [x] Modal, Toast, Tooltip, Score components added + verified (2026-07-08)
- [x] DropdownMenu, Drawer, Chip, Slider, Pagination added + verified
      (2026-07-08; no fg-pagination exists in the vendor lib — composed from
      fg button styles)

- [x] MultiSelect, DateRangeDropdown, Avatar, News, ContactItem added +
      verified (2026-07-08). Avatar's vendor default background is white —
      use gray/bordered variants on light surfaces.

## Tasks #7–#12 — DONE (2026-07-08)
- [x] #7 Chatbot, #8 Logo (official SVGs downloaded from CDN assets/logos/ into
      src/assets/logos/; quote data-URLs in CSS url() — Vite inlines <4KB SVGs),
      #9 MediaObject (vendor ships only fg-media-object-figure), #10 TabsWrapper,
      #11 KrfSlider — NOTE: krf-slider is NOT dual-thumb; it's the Key Rating
      Factor notch selector (labeled marks + progress; sentiment tokens are
      blue/pink in Generic theme).
- [x] #12 Sweep complete: 101 unbuilt non-utility blocks triaged; worthwhile
      ones queued as grouped tasks below, rest are app-niche.

## Tasks #13–#16 — DONE (2026-07-08)
- [x] #13 Ten primitives: Spinner, DotTyping, Divider, Section, Textarea,
      Progress, Counter, EmptyState, JumpLinks, FileUpload
- [x] #14 Table suite: KEY FINDING — fg-table is an AG Grid theme (79
      `.fg-table .ag-*` rules; ag-theme-fitch + embedded icon font in vendor
      CSS). Built `DataTable` = ag-grid-react (installed; theme="legacy" +
      ag-grid.css base) wrapped in fg-table/ag-theme-fitch, plus standalone
      `TableFilter` set-filter popover. Vendor forces
      `position:static !important` on fg-set-table-filter (they tippy-position
      it) — popover positioning must live on a wrapper div.
- [x] #15 `NestedMultiSelect` (tree multi-select w/ tri-state parents);
      generic fg-dropdown/select-group overlap with existing Select/DropdownMenu
- [x] #16 SidebarNavFlyout, AppSwitcher (+app-launcher tiles w/ real logos),
      ContactModule (paged ContactItems), ChartTooltip

Remaining ideas moved to `ENHANCEMENTS.md` (16 proposals in 3 tiers + known
small defects). Nothing queued — pick items from there to turn into tasks.

## Rebrand: Fitch → Syena (2026-07-11)
- All shipped code moved to the Syena brand ("Syena Intelligent Systems"):
  vendor CSS forked to the sy- namespace (fg-→sy-, --fg-→--sy-,
  ag-theme-fitch→ag-theme-syena, fgbutton→sybutton keyframes), files renamed
  (sy-design-system[.min]/syena-default-theme.css).
- Themes renamed: generic→default "Syena Default" (base :root, no override),
  sustainable-fitch→green "Green theme", bmi→blue "Blue theme"
  (src/styles/themes/{green,blue}.css, [data-theme] selectors updated).
- FgChart→SyChart; Logo rebuilt as Syena lockup from
  src/assets/logos/SAIS-Logo.svg (Fitch SVGs deleted); sample copy
  Syena-branded (Syena AI, Syena Ratings…); index.html + .storybook/manager.ts
  branded "Syena Design System".
- analysis/ kept untouched as research archive. Gate: zero fitch/fg- matches
  in src, .storybook, index.html.

## Climate Dashboard theme + components (2026-07-13)
- New "Climate theme" ([data-theme="climate"], src/styles/themes/climate.css)
  derived from the BoldBI Weather Forecast sample: sky-blue accent
  (#3b83f6/#5aa5db), #f9f9f9 canvas, BoldBI chart palette override
  (--sy-chart-categorical-default-01..09). Research: analysis/climate/.
- Components from the user's GHG Trend Analysis Streamlit app (localhost:8501)
  + BoldBI: KpiStat (st.metric-style), Gauge (Plotly indicator), SyChart
  extended with kind:'band' (CI fills) and referenceY (dashed line + label).
- FIX: SyChart/Gauge cssVar now resolves from the component element (not
  documentElement) so [data-theme] wrappers theme charts correctly.
- Composed story: Templates/ClimateDashboard (KPI row, gauge, trends,
  forecast band, scenarios) hardwired to the climate theme.

## Climate theme → Analytics theme (SciChart restyle) (2026-07-15)
- Renamed to "Analytics theme" ([data-theme="analytics"],
  src/styles/themes/analytics.css — climate.css deleted); Storybook toolbar,
  Logo product variant (climate→analytics, word tint #1d84a3), and the
  ClimateDashboard template (now hardwired to the analytics theme) updated.
- Styling derived from the SciChart.js React showcase "Navy" demo theme
  (research: scichart.com blog thumbnails, colors sampled with Pillow):
  canvas #14233c, panel/card/input surface #1b2a49, elevated #213458,
  light ink (#fff/#d7e0f0/#8fa2c4), navy hairlines, cyan primary #2d9cbd.
- Series palette is SciChart-derived but snapped into the dark-mode band and
  validated with the dataviz skill's validate_palette.js against #1b2a49
  (lightness/chroma/CVD/contrast all PASS): #2d9cbd #e06c1a #22a084 #ec0f6c
  #b054c4 #bd8a1d #9d7fe0 #699e20 #dc5959.
- FIX: SyChart now themes the x-axis gridcolor/zerolinecolor too (was Plotly
  default light gray — glaring on dark). Gauge default fill re-keyed from
  palette slot 08 (BoldBI holdover) to slot 01.
- Dark-mode token coverage: backgrounds, text, dividers, secondary outlines,
  selection/hover overlays (grey tags), primary button/fill, sentiment ink.
  Verification screenshots in analysis/verification/analytics-*.png.

## Analytics theme: full dark token coverage (2026-07-15)
- User-reported: DataTable, Tabs, Tag text unreadable in the Analytics theme.
  Root cause: the first pass only overrode ~a third of the semantic layer.
- analytics.css now overrides the ENTIRE semantic token layer (surfaces incl.
  surface-*/layer-*, inverse backgrounds/text flipped light, sentiment tint +
  ink + outline + fill families, primary/secondary/tertiary/link fills,
  outline + overlay ladders as white-alpha, focus ring cyan) plus a dedicated
  `[data-theme="analytics"] .ag-theme-syena` block — AG Grid hardcodes light
  --ag-* values instead of reading semantic tokens.
- NEW src/styles/overrides.css (imported after vendor css): `.sy-tab`
  background-color transparent — vendor CSS only styles hover/active/disabled
  tab backgrounds and the reset doesn't clear button backgrounds, so all
  themes showed UA `buttonface` gray on default-state tabs.
- Storybook decorator now paints the canvas var(--sy-static-background-weak)
  (dark navy in Analytics; #f5f5f5 in light themes, previously white).
- Verified in analytics theme: DataTable, SensitivityMonitor (TrendCells now
  dark sentiment washes), Tabs (4 variants), Tag AllColors, Button AllVariants,
  InlineAlert; light-theme regression on Tabs/DataTable. Screenshots in
  analysis/verification/analytics-*.png.

## Hardcoding audit + fixes (2026-07-15)
- Audited src/ for hardcoded colors. The var(--sy-*, #fallback) pattern is
  fine; six components had real hardcoding (#fff surfaces, black-alpha
  borders) that broke in the dark Analytics theme: TableFilter,
  SidebarNavFlyout, AppSwitcher, Chatbot, ChartTooltip, KrfSlider.
- All six now use tokens: background-standard (component shells),
  layer-standard (popovers/panels), divider-standard/weak (borders),
  overlay-primary-hover (hover fills), fill-primary-onprimary (on-fill text).
  ChartTooltip's dark variant now uses the inverse tokens, so it flips to a
  light tooltip on dark themes. TableFilter's search input lost its UA-default
  white 'field' background. Bonus: KrfSlider's inactive notch buttons had the
  same UA buttonface bug as tabs (background: undefined) — now transparent.
- analytics.css gained --sy-static-divider-inverse-* (dark-alpha) for
  hairlines on the light inverse surfaces.
- Known remnants (deliberate): cssVar()/FALLBACK_PALETTE fallbacks, Logo
  product tints, story demo colors, hardcoded box-shadows (shadow tokens are
  drop-shadow() filter values, unusable in box-shadow), HeatCell's light blue
  ramp tint, SyChart DEFAULT_CONTINUOUS_SCALE named colors.
- Note: .sy-chart-tooltip is position:absolute with a translate offset by
  design (hover element) — its story renders off-origin; pre-existing.
- Verified in analytics + default themes; screenshots in analysis/verification/.

## White-label rework: rename sy-/Syena → __s9cmpx-, remove hardcoded branding (2026-07-21)
- Same class of rename as the Fitch→Syena rebrand above, one step further:
  this design system may end up as the basis for a future external-facing
  white-label platform, not just Syena's own products, so hardcoded Syena
  identity needed to come out while there's still only one real consumer
  (climate-dashboard-react) to coordinate with. PR:
  sauparnasarkar/design-system#1.
- Triggered by a concrete, confirmed leak: the real Syena logo PNG was
  publicly fetchable on the deployed consumer site even though nothing there
  renders `<Logo>`. Root cause: no `"sideEffects": false` in package.json, so
  Rollup couldn't prove the unused `Logo` module (which imported the asset at
  module scope) was droppable. Fixed by adding `sideEffects: false` (verified
  safe — no module-scope side effects beyond CSS/asset imports).
- `sy-`/`Syena`/`syena` renamed to `__s9cmpx-` everywhere it's a class name,
  CSS custom property, or BEM block — ~90 hand-authored files plus the 3
  vendor CSS files (`sy-design-system.min.css`, `syena-default-theme.css`,
  `sy-design-system-reset.min.css` — filenames unchanged, contents renamed).
  `ag-theme-syena` → `ag-theme-s9cmpx`, renamed in lockstep across
  `DataTable.tsx`, `analytics.css`, and the vendor CSS blob (a mismatch breaks
  DataTable's AG Grid styling entirely). This is a rename, not a hashing
  scheme — the theming contract (consumers overriding tokens by name) is
  unaffected.
- `Footer.copyright` and `Chatbot.title` are now required props with no
  Syena-specific default — a forgotten override is a type error, not a
  silent brand leak.
- `Logo` reworked from a hardcoded Syena eagle-mark + wordmark component into
  a generic `markSrc`/`wordmark`/`accent` lockup. This cascaded into
  `AppSwitcher`, which had hardcoded the old `LogoProduct` enum into its own
  public `AppSwitcherApp` type — reworked to the same generic props.
- climate-dashboard-react needed a matching update: it referenced several
  `sy-*` classes/tokens directly in its own JSX (not only through component
  props), so those needed the same rename or styling would have silently
  broken. See sauparnasarkar/climate-emissions-analysis-project#69.

## Testing wired up (2026-07-21)
- `vitest`, `@vitest/browser-playwright`, `@vitest/coverage-v8`, and
  `@storybook/addon-vitest` were already installed (and `.storybook/main.ts`
  already registered the addon, `vite.config.ts` already had the full
  `storybookTest` project config) but never actually invoked — no `"test"`
  script existed and it had never been run.
- Running it surfaced a real dependency bug, not a config mistake: several
  CJS-only transitive deps of `@testing-library/dom` (`aria-query`,
  `lz-string`, `dom-accessibility-api`, `pretty-format`, `@adobe/css-tools`,
  `css.escape`, `picocolors`, `redent`, `@babel/code-frame`) weren't being
  correctly ESM-interop'd by Vitest's browser-mode dep optimizer. Fixed by
  listing them all in `vite.config.ts`'s `optimizeDeps.include`.
- Added `"test": "vitest run"` / `"test:watch": "vitest"` to package.json.
  Result: all ~60 existing `*.stories.tsx` files now run as real tests
  (mount + a11y check) with zero new test files needed for that baseline.
- Added explicit `play`-function assertions to `DataTable`, `Logo`, `Footer`,
  `Chatbot`, `AppSwitcher` — the components touched by the white-label rework
  above — proving the exact things previously only verified by hand (AG Grid
  theme class pairing, consumer-supplied branding actually rendering).
- Added a second Vitest project (`unit`, Node environment, not browser) for
  `src/__tests__/no-vendor-strings.test.ts` — a static guard that fails if a
  literal `Syena`/`syena` string reappears in non-story component source or
  CSS, directly encoding the regression class from the leak above.
- Verified these aren't hollow: deliberately broke the `ag-theme-s9cmpx`
  class pairing and reintroduced a literal `"Syena"` string, confirmed each
  test failed with a clear message, then reverted both.
- Current state: `npm test` → 69 files, 120 tests, all passing;
  `npm run build-storybook` still succeeds.
- Not done (see ENHANCEMENTS.md item 1): the originally-proposed play
  functions for the interactive components (Select, MultiSelect,
  NestedMultiSelect, Tabs, Modal, Drawer, TableFilter, Pagination, Slider),
  and turning a11y from `todo` to enforced.

## Interaction & a11y test pass (2026-07-21, sauparnasarkar/design-system#3)
- Read every one of the 9 components' actual keyboard handlers before
  assuming the ENHANCEMENTS.md backlog note was still accurate — it wasn't,
  uniformly. Select, MultiSelect, Slider, and Pagination were already fully
  correct (combobox pattern, arrow-key value stepping, native buttons) and
  only needed `play`-function tests proving it. Tabs, TableFilter, Modal,
  Drawer, and NestedMultiSelect had real, confirmed gaps.
- Added `src/lib/useFocusTrap.ts`: a shared hook (save/restore
  `document.activeElement`, focus the first focusable descendant on open,
  trap Tab/Shift+Tab at both boundaries) adopted by both `Modal` and
  `Drawer` — `Drawer`'s always-mounted `embedded` mode opts out of all
  modal-only behavior (`aria-modal`, `inert`, the trap itself) since it's a
  permanently-visible docked panel, not a dialog.
- `Tabs`: roving tabindex (only the active/first-enabled tab sits in the Tab
  order) plus ArrowLeft/ArrowRight/Home/End, skipping disabled tabs and
  wrapping at the ends, per the APG tabs pattern.
- `TableFilter`: reused the same highlighted-index/`aria-activedescendant`
  pattern Select/MultiSelect already had, wired to ArrowUp/Down/Enter/Escape
  on both the trigger and the search input.
- `NestedMultiSelect`: tree keyboard nav over a flattened list of visible
  group/child rows (respecting expand/collapse state) —
  ArrowUp/Down/Left/Right/Enter/Space — plus a pre-existing, previously
  undetected gap: the combobox had no `aria-labelledby` connecting it to its
  own visible label at all.
- Each of the 5 fixed components was verified by deliberately reverting the
  fix locally, confirming its new test failed with a clear message, then
  restoring — same discipline as the "Testing wired up" pass above.
- Flipping `.storybook/preview.tsx`'s `a11y.test` from `'todo'` to `'error'`
  surfaced 345 violations across 42 failing tests, traced to a handful of
  root causes (not fixed piecemeal):
  - `--__s9cmpx-static-text-weak: #757575` failed 4.5:1 against its three
    most common backgrounds — accounted for 338 of the 345 violations.
    Computed a replacement (`#666666`) via the WCAG luminance formula rather
    than guessing.
  - `Slider`/`Progress`/`Score` had no accessible name on their
    `role="slider"`/`"progressbar"`/`"meter"` elements despite having (or,
    for `Score`, gaining) a `label` concept — wired `aria-labelledby`/
    `aria-label`.
  - `Select`'s trigger `<button>` had an implicit `role="button"`, which
    doesn't support `aria-activedescendant` per the ARIA spec — fixed with
    an explicit `role="combobox"`. The same bug, independently, in
    `TableFilter`'s trigger — same fix, but this one also required adding
    `aria-labelledby` since `combobox` (unlike `button`) doesn't compute its
    accessible name from content the way the old implicit role did. Found by
    Copilot's PR review, not the original a11y-enforcement pass — see below.
  - `ChartTooltip`'s vendor-CSS-driven scrollable region had no way to be
    reached by keyboard (`tabIndex={0}`).
  - `ClimateDashboard.stories.tsx`'s demo page nested an `<h1>` directly
    above `ChartCard`'s hardcoded `<h5>` title, skipping heading levels.
    Made the heading level configurable (`CardHeader`/`ChartCard`
    `headingLevel` prop, default `5` unchanged) and set it to `2` in that
    story.
  - Several demo-story-only fixes: `SegmentedControl`'s `IconSegments` story
    not using the component's own existing `ariaLabel` prop; accent colors
    left over from the white-label rework's own story choices
    (`AppShell`/`Header`/`Logo`/`AppSwitcher` stories) failing contrast;
    `SyChart`'s "Ratings Distribution" story embedding an unlabeled `Select`
    (added a `Select` `ariaLabel` prop for compact/unlabeled uses, matching
    the pattern this fix needed).
  - Along the way, found `overrides.css` (the `.__s9cmpx-tab` background fix
    and the new search-input-on-inverse fix, see below) was only ever
    imported by Storybook's own preview, never by the actual consuming app —
    fixed by adding the import to
    `climate-dashboard-react/src/main.tsx` (sauparnasarkar/climate-emissions-analysis-project#71).
  - Header's search input rendered white text on an effectively-light
    background (1.09:1) despite the existing dark-backdrop/token-remap
    mechanism looking correct on paper — root cause only found by
    instrumenting the live DOM (a temporary diagnostic story dumping
    `getComputedStyle()`), which showed `SearchInput`'s own root div
    redefines the same CSS custom property `SearchInput`'s inner control div
    also matches (`[class*=__s9cmpx-search-input]` catches both, by
    substring), overriding the ancestor Header wrapper's attempted fix
    regardless of it being inline. Fixed with a `.__s9cmpx-search-input--on-inverse`
    rule in `overrides.css` targeting both the root and the inner control
    div directly, applied via `SearchInput`'s existing `className` prop.
- Copilot's PR review (sauparnasarkar/design-system#3) caught two things the
  above pass missed: the `TableFilter` `aria-activedescendant`-on-`button`
  bug above, and `Tabs`' `tabRefs` array retaining stale/detached button
  references if `items` ever shrinks (fixed with a `.slice(0, items.length)`
  trim each render).
- Verified via a scripted real-Chromium spot-check (Playwright against a
  running Storybook dev server, no GUI browser tool available): Modal and
  Drawer both trap focus, wrap Tab/Shift+Tab, and restore focus to the
  trigger on close; Tabs' roving tabindex + ArrowRight move focus and
  selection together.
- Current state: `npm test` → 69 files, 121 tests, all passing;
  `npm run build-storybook` still succeeds.

## RangeSlider + MultiSelect type-to-search (2026-07-23, sauparnasarkar/design-system#4, #5)

Both driven by the same consumer need: `climate-emissions-analysis-project`'s
new Data Explorer page (a ~220-country picker plus a year-range filter with no
existing control for it).

- **`RangeSlider` — new component.** Dual-thumb, reusing 100% of `Slider`'s
  existing vendor CSS classes (`.__s9cmpx-slider*`) with zero stylesheet
  changes — a second thumb's own `left: %` plus a fill spanning between both,
  the same way `Slider` already positions its one thumb. Additive only: does
  not touch `Slider`'s prop contract or any current consumer. Follows the APG
  multi-thumb slider pattern — each thumb is an independent `role="slider"`
  with its own `aria-valuemin`/`max`/`now` and a distinct accessible name
  (`thumbLabels` prop; two thumbs sharing one label would be indistinguishable
  to a screen reader). Cross-clamped on every update (drag or keyboard) so the
  lower thumb can never pass the upper one and vice versa — coincident thumbs
  represent a single-point selection. Home/End jump to a thumb's *own* bound
  (the partner thumb's current value), not the global min/max.
  - Copilot's PR review caught one real bug: step-snapping used
    `Math.round(raw / step) * step`, which snaps to multiples of `step`
    starting at 0 rather than at `min` — wrong whenever `min` isn't itself a
    multiple of `step`. Fixed to `min + Math.round((raw - min) / step) * step`.
    No behavior change for the actual year-slider consumer (`min` and `step`
    are both integers, so the two formulas are identical there), but a real
    fix for any future non-zero-offset use.
- **`MultiSelect` — type-to-search added to the dropdown menu.** On by
  default for every consumer (not just the motivating 220-country list);
  `suppressSearch` opts out. Mirrors `TableFilter`'s own existing
  search-in-menu pattern rather than inventing a new one. Space is treated as
  a normal typed character in the search input (not a toggle key, unlike the
  `suppressSearch` keyboard path where the control itself still drives
  selection) — multi-word queries like "United King..." work.
  - Writing real interaction tests for this (rather than closing the menu at
    the end of every story, as every prior `MultiSelect` story happened to
    do) surfaced a genuine, pre-existing a11y defect that had never been
    caught: the per-option checkbox was a real `<input type="checkbox">`
    nested inside a `<li role="option">` — an axe "nested-interactive"
    violation. Confirmed `tabIndex={-1}` plus `aria-hidden="true"` do **not**
    satisfy this specific axe rule (its own message says so explicitly —
    some assistive tech can still reach a nested native control regardless).
    The actual fix: no real `<input>` at all inside the option — a decorative
    `<span>` echoing the already-present `aria-selected` state instead. The
    same bug exists in `TableFilter`'s own option list (same pattern,
    untouched here — out of scope for this change, worth a future pass).
  - The empty-results ("No matches") state needed its own two a11y fixes:
    `aria-activedescendant` must not point at an option index that doesn't
    exist when the filtered list is empty, and the placeholder row itself
    needs `role="option"` + `aria-disabled="true"` (not `role="presentation"`
    — an empty `role="listbox"` with zero `option`/`group` children is itself
    an `aria-required-children` violation).
- Current state: `npm test` → 70 files, 130 tests, all passing;
  `npm run build-storybook` still succeeds; `tsc -b` clean.

## Component-level test coverage, round 2 (2026-08-03)
- Prompted by a test-strategy note left in a consumer PR
  (climate-emissions-analysis-project, ghg-emissions-analysis feature): "design-system
  has no automated component-level tests today ... no SyChart.test.tsx/Slider.test.tsx."
  Slider itself already had `play`-function keyboard-nav coverage by that point, but the
  broader claim was right — most components still had only mount+a11y coverage from the
  a11y-enforcement pass above, no assertions on their own interactive behavior.
- Decision (explicit, discussed before implementing): extend the existing
  story-embedded `play`-function convention rather than introduce separate
  `*.test.tsx` files per component. Reasons: consistent with the 15
  components that already had `play` coverage and with what CLAUDE.md
  documents; interaction tests double as live Storybook documentation;
  avoids a second, parallel test-authoring convention for ~60 components
  going forward. The one exception: two components (`SyChart`, `Score`) had
  genuine pure-function logic worth unit-testing directly, not just through
  a rendered story.
- Scope: 14 components with real untested logic/state, not a sweep of all
  ~46 components lacking `play` functions — most of the rest are
  presentational (Divider, Typography, Spinner, ...) where mount+a11y
  already covers everything meaningful. The remaining ~40 are logged as a
  deferred backlog item in `ENHANCEMENTS.md` (Tier 1, item 1a) rather than
  silently dropped.
- `SyChart.tsx` imports `plotly.js-dist-min` at module scope, which
  references the browser-only global `self` — importing *anything* from
  that file (even a pure, Plotly-free function) crashes immediately under
  the `unit` Vitest project's Node environment. Fixed by extracting the two
  pure functions (`withAlpha`, `logColorbarTicks`) into a new sibling module,
  `chartMath.ts`, with zero Plotly dependency; `chartMath.test.ts` imports
  from there. This is a reusable pattern: any future pure logic worth
  unit-testing out of a Plotly-backed component (`Gauge` included) needs the
  same split, not a direct export from the component file itself.
- Score's ESG-step color mapping (value → 1..15 ramp step) was similarly
  extracted into two exported pure functions, `clampScore`/`mapToEsgStep`,
  and unit-tested directly — no Plotly involved here, just pulled out of the
  render body for testability.
- Two real bugs were caught in the *new tests themselves*, not the
  components, while writing them — worth noting since they're an easy trap:
  - `DateRangeDropdown`'s preset entries render as `<li role="option">`
    wrapping a `<button>` — `getByRole('option', { name })` resolves to the
    `<li>` (whose accessible name comes from its button child's text), but
    the actual click handler lives on the `<button>`. A click dispatched at
    the `<li>` never reaches it (the button is a descendant, not an
    ancestor, so it's not on the native bubble path). Fixed by querying
    `getByRole('button', { name })` instead.
  - `Accordion`'s panel has a CSS `fadein` keyframe animation
    (`opacity: 0 → 1` over 0.35s) — asserting `toBeVisible()` immediately
    after the click that opens it races the animation's start (jest-dom's
    visibility check treats `opacity: 0` as not-visible), and fails
    intermittently depending on exactly when the assertion's computed-style
    read lands relative to the animation clock. Fixed by asserting
    `toBeInTheDocument()` instead — presence is what the test actually cares
    about; visibility timing isn't the thing under test.
  - Also fixed one small pre-existing a11y gap surfaced by an unrelated full
    suite run: the "Choropleth Animated" SyChart story's frame-scrubber
    `<input type="range">` had no accessible name (`aria-label="Animation
    frame"` added) — pre-dated this pass, caught only because running the
    complete suite (not just the new files) is part of verifying any change
    per CLAUDE.md's testing guidance.
- Current state: `npm test` → 72 files, 177 tests, all passing; `tsc -b`
  clean; `npm run lint` unchanged (pre-existing errors on `main` untouched;
  the only new lint output is two `only-export-components` warnings on
  `Score.tsx` for its two newly-exported pure functions — same
  non-blocking warning class already present on `Icon.tsx` and
  `DataTable/presets.tsx`).

## DataTable "Scroll for more" hint → real scroll control (2026-08-16)

- Reported live, in a consuming app (climate-emissions-analysis-project's
  `/ask` agent page): a scrollable grid showed the "Scroll for more →"
  badge, but hovering the grid on macOS never revealed a scrollbar to
  actually use — the badge itself was non-interactive
  (`pointerEvents: 'none'`, `aria-hidden="true"`), so a mouse-only desktop
  user had no way to act on it at all.
- Root-caused live (claude-in-chrome against a real overflowing grid, not
  just reading the source): AG Grid's own "Apple-style" scrollbar
  (`.ag-apple-scrollbar`) is `opacity: 0; visibility: hidden` at rest, meant
  to fade in on hover — but the `mouseenter`/`mousedown` listeners AG Grid
  binds to trigger that fade-in are bound to the exact element
  `visibility: hidden` excludes from browser hit-testing. A real hover never
  reaches it; the reveal mechanism is self-defeating on any Mac/iOS user
  agent (`_isMacOsUserAgent() || _isIOSUserAgent()` unconditionally applies
  the class). Confirmed via `elementFromPoint` + a genuinely dispatched
  `mouseenter` event bypassing hit-testing: the JS listener itself is wired
  correctly and does toggle `.ag-scrollbar-active` → `opacity: 1` once
  reached — hit-testing exclusion is the actual, sole blocker of the
  hover-to-reveal path itself.
- That said, fixing only the CSS (dropping `visibility: hidden`, keeping
  `opacity: 0`) turned out to be necessary but not sufficient: even with the
  JS listener now reachable, no scrollbar visually rendered in a live test.
  On macOS, AG Grid defers to the OS's own overlay scrollbar for the actual
  pixels, and that indicator's on-screen appearance is an OS/compositor-level
  decision driven by native pointer hover — not something a DOM class toggle
  or CSS opacity change can force into view. Confirmed by directly setting
  `scrollLeft` on `.ag-body-horizontal-scroll-viewport`, which reliably
  moved the grid's content regardless of what the native scrollbar did or
  didn't render.
- Two-part fix, in order of what actually solves the reported problem:
  1. **Primary**: `DataTable.tsx`'s badge became a real `<button>` — a
     `scrollRight` handler drives `scrollLeft` directly (`scrollBy` at 80%
     of the viewport's visible width, `behavior: 'smooth'`), removed
     `pointerEvents: 'none'`/`aria-hidden` in favor of a real
     `aria-label`. Visibility logic changed from `isScrollable`
     (computed once, then permanently dismissed the instant *any* scroll
     happened, `scrollLeft > 4`) to `canScrollMore` (recomputed on every
     scroll event via the existing `ResizeObserver`/scroll-listener
     plumbing, `scrollLeft + clientWidth < scrollWidth - 1`) — the old
     one-shot dismissal meant a user who scrolled even slightly via
     trackpad permanently lost the only affordance, even with many more
     columns still off-screen; the new button now behaves like a real
     "next page" control that disappears only once there's genuinely
     nothing left to scroll to.
  2. **Secondary**, `overrides.css`: dropped `visibility: hidden` from
     `.ag-apple-scrollbar`'s invisible state (kept `opacity: 0`) so AG
     Grid's own hover-to-reveal at least has a chance to work on browsers
     where the OS does render on DOM-class-driven hover — doesn't hurt,
     restores intended-but-broken behavior, but isn't what actually
     resolves the report; the button is.
- New `ScrollHint` story (`DataTable.stories.tsx`): 14 synthetic wide
  columns force horizontal overflow regardless of viewport width. `play`
  asserts the button appears, clicking it advances `scrollLeft`, and
  setting `scrollLeft` to the far end + dispatching `scroll` (simulating
  "reached the end by any means") makes the button disappear — covering
  both the click-to-scroll mechanism and the recomputed-per-scroll
  visibility gating, not just the one-shot dismissal the old hint had.
- Deliberately did *not* pursue making the native/OS scrollbar itself
  reliably visible (e.g. forcing `ag-apple-scrollbar` off entirely, or
  always-visible scrollbar styling) — explicitly out of scope per direct
  instruction (a persistently visible scrollbar wasn't wanted); the button
  is the actual deliverable, the CSS fix is a free secondary improvement
  riding along with the same investigation.

### Four rounds to get this actually working live (2026-08-16)

The button itself (previous entry) went through three more attempts after
first appearing done, each one caught by live re-verification on the real
Mac Mini deployment before being reported as fixed — Storybook and `npm
test` passed at every stage, none of that caught any of these:

1. **Click did nothing** — `scrollRight` read `scrollElRef`, a node
   reference cached once when the effect first attached. AG Grid recreates
   `.ag-body-horizontal-scroll-viewport` after mount as its own layout
   settles, silently going stale. Fixed by re-querying the node fresh at
   click time instead of caching it.
2. **Button stopped appearing on new overflow** — the same stale-node
   problem also affected `canScrollMore`'s gating (the ResizeObserver
   attached to a specific node instance). Redesigned to attach both the
   ResizeObserver and a `MutationObserver({childList, subtree,
   attributes})` to `wrapperRef.current` (never swapped by AG Grid)
   instead of the AG Grid-owned child.
3. **Still didn't appear** — the `MutationObserver` from fix 2 recorded
   **zero mutations** across a column-add that measurably changed
   `scrollWidth` from 464 to 960. Root cause: `MutationObserver` can only
   see DOM tree/attribute changes; AG Grid was widening the box through a
   mechanism that touches neither (spec-wise, a `ResizeObserver`'s job).
   Fixed by combining both tools — `ResizeObserver` for size, a
   `childList`-only `MutationObserver` for node-swap detection.
4. **Still didn't appear**, even with the ResizeObserver+MutationObserver
   combination confirmed correctly wired (`ro.observe()` verified called
   on the right node via direct instrumentation). Root-caused this time by
   reading `canScrollMore`'s actual React fiber state directly, bypassing
   DOM/instrumentation proxies entirely: state stayed `false` with
   `scrollWidth` (960) genuinely exceeding `clientWidth` (464). The real
   cause: **`ResizeObserver` fires on an element's own border/content-box
   size changing — not on `scrollWidth`.**
   `.ag-body-horizontal-scroll-viewport`'s own box is deliberately clamped
   by `overflow-x` regardless of how wide its content grows; that's
   exactly the case `ResizeObserver` cannot see. Not a wiring bug like
   attempts 2–3 — the wrong API for the question ("does this element's
   content now overflow its own fixed box" is a `scrollWidth`-vs-
   `clientWidth` comparison, not a box-size-change event). Fixed by
   dropping both observers for a 250ms poll while the table is mounted
   (`fix/datatable-scroll-hint-poll-based-detection`, PR #56) — correct by
   construction regardless of what causes the overflow, at the cost of a
   cheap comparison on a timer instead of chasing the one correct
   triggering event.

Confirmed live, for real this time: grid in view, column added via the
Columns picker, button appeared within the poll interval on both Data
Explorer grid instances, click advanced `scrollLeft`.

One instrumentation note worth keeping for next time: ad-hoc `.click()` or
single-`MouseEvent('click')` dispatch via `javascript_exec`-style page
scripting did not reliably trigger this button's React `onClick` during
manual live debugging, and a `ResizeObserver` subclass injected via
`javascript_exec` *after* the app had already mounted and created its own
observer instances did not intercept those pre-existing instances' callbacks
— both artifacts of retrofitting instrumentation onto an already-running
page, not evidence about the app's own code. Reading React's fiber state
directly (`el[Object.keys(el).find(k=>k.startsWith('__reactFiber$'))]`,
walking `memoizedState`) sidesteps this class of problem entirely: no
patching, no timing assumptions, just the actual value React is holding.

## Analytics theme: text-color inheritance gap + SyChart sizing + open treemap crash (2026-09-02)

User-reported (new consumer: `fund-allocation-dashboard-react`, nested inside
`global-institutional-broker-platform/us_fund_family_india_allocation_monitor/`)
via three live-browser issues: KpiStat values and a Select placeholder nearly
invisible on the Analytics theme; a Taxonomy Drill-Down page rendering fully
blank. Diagnosed with Playwright (the Claude-in-Chrome extension wasn't
reachable from that session) rather than manual clicking — real console
errors and computed styles proved more reliable than screenshots alone.

**Contrast — same root cause as "Analytics theme: full dark token coverage"
above, one more gap in the same pattern.** That 2026-07-15 entry and the
`strong`/`table th` overrides already in `analytics.css` exist because the
vendor reset hardcodes `body{color:#4a4a4a}` (light-mode ink, not a semantic
token), which bleeds through to any element with no explicit `color` of its
own. `KpiStat`'s `.__s9cmpx-headline4` value span is exactly that case —
confirmed live via `getComputedStyle`: `rgb(74,74,74)` on a `#1e2f52` card,
~1.5:1 contrast (needs 4.5:1). Patching `headline4` alone would just repeat
the class of miss those two prior rules already are — each one exists
because a *different* component was independently found broken by the same
underlying gap. **Fixed once, at the source**: `analytics.css` now sets
`color: var(--__s9cmpx-static-text-standard)` on `[data-theme="analytics"]`
itself, so every descendant without its own color rule inherits the correct
dark-theme ink instead of the reset's literal gray. The `strong`/`table th`
rules stay (more specific, harmless now) but nothing like this should need a
fourth one-off patch. Verified: KpiStat value corrected to `rgb(215,224,240)`
on Fund Screener and Fund Detail; Select's "Select..." placeholder (same
underlying gap, different component) confirmed legible without a separate
fix.

**SyChart container sizing — a real but insufficient fix.** The chart div
(`SyChart.tsx`'s `ref` element) had no CSS `height` of its own — only
`layout.height` passed to Plotly, which sizes the plot *after* it draws.
Confirmed live via `getBoundingClientRect()` inside the mount effect: the
div was 0px tall at the moment `Plotly.react` is first called. Now sets
`style={{ width: '100%', height }}` directly, so the container has its real
size from the first frame instead of relying on Plotly's post-draw resize.
Correct on its own merits, but **testing showed this does not fix the
treemap crash below** — do not assume container height is the cause if this
recurs.

**RESOLVED (2026-09-02, follow-up session): root cause was `marker:
undefined` as a live object key, not any of the above.** The treemap crash
above resisted this session's entire investigation (StrictMode, container
sizing, ancestor CSS, deferred timing, sibling probe div, and — critically —
replaying the *exact captured* trace/layout/config JSON, both standalone and
via the same bundled Plotly module on the live page) because every one of
those repros used **JSON-serialized** trace data, and `JSON.stringify`
silently drops any key whose value is `undefined`. The real bug only exists
in the *live* JS object, never in its JSON round-trip — which is exactly why
"replay the exact same data" kept succeeding while the real page kept
crashing with supposedly the same data.

The treemap trace builder wrote `marker: s.colorValues ? {...} : undefined`.
When a treemap series has no `colorValues` (the Taxonomy Drill-Down page's
case — a plain, uncolored treemap), this evaluates to a trace object with
the literal key `marker` **present**, valued `undefined` — not an *absent*
key. `'marker' in trace` is `true` either way in JS, and Plotly's own
`cleanData` gates a treemap `marker.line` default on that key's *presence*,
not its truthiness. So it entered the branch expecting an object and did
`'line' in trace.marker`, throwing `TypeError: Cannot use 'in' operator to
search for 'line' in undefined` — the exact reported error, on the exact
reported line, only for treemap (the one SyChart kind with a
conditionally-`undefined` `marker`; bar's `marker` fallback at line ~465 is
always a real object, which is why bar/line/band never showed this).

Confirmed directly: a hand-built trace `{ type: 'treemap', ..., marker:
undefined }` fed to the same bundled `plotly.js-dist-min` module reproduces
`Cannot use 'in' operator to search for 'line' in undefined` verbatim; the
same trace with the `marker` key *omitted* entirely does not crash.

**Fix**: changed the treemap branch from `marker: s.colorValues ? {...} :
undefined` to conditionally *spreading* the whole `marker` key in
(`...(s.colorValues ? { marker: {...} } : {})`), so a colorValues-less
treemap never has a `marker` key on its trace at all, matching every other
kind's convention of omitting rather than nulling out unused Plotly fields.
Verified live: Taxonomy Drill-Down renders its treemap correctly across all
five dimension tabs (Sector/Industry/Business Theme/End Market/
Infrastructure) with zero console errors and no `RouteErrorBoundary`
fallback; Family Rollup's bar-chart `SyChart` usages (which do set
`colorValues`, exercising the still-present branch) unaffected;
`design-system`'s own `SyChart` Vitest suite unchanged (26/26 passing,
same 12 pre-existing unrelated `_scrollZoom` JSDOM errors on both the pre-
and post-fix tree, confirmed via `git stash`).

**Lesson for future Plotly.js crash investigations in this file**: never
rely on `JSON.stringify`/`console.log`-captured trace data to "replay the
exact input" — it cannot represent a key present with value `undefined`,
which is a legitimate and different runtime shape from that key being
absent, and Plotly's own internals (at least `cleanData`) can and do
distinguish between them.

Unrelated, pre-existing, confirmed via `git stash` (not caused by the above):
`design-system`'s own `npm test` already fails one `SyChart.stories.tsx`
case ("Expandable") with a different Plotly-internal error
(`Cannot read properties of undefined (reading '_scrollZoom')`) in the
JSDOM/Vitest environment, on both the pre- and post-fix tree.

**Follow-up (PR review): no story exercised the exact crashing shape.** The
existing `Treemap` story always set `colorValues`, so it never took the
branch that crashed and the storybook-project mount+a11y test (which would
have caught this at the time) never ran against it. Added
`TreemapWithoutColorValues` — a treemap series with no `colorValues` at
all — as a permanent regression test. Verified it actually catches the
regression: reverting the `SyChart.tsx` fix and re-running reproduces the
exact same `Cannot use 'in' operator to search for 'line' in undefined`
against this new story specifically.

## Analytics theme: page canvas was never actually painted, plus a real SearchInput bug (2026-09-02)

Same session/consumer as the entry above; two more issues the user reported
live after the first round of fixes landed.

**`SearchInput` silently discarded its own internal styling whenever a
caller passed a `style` prop.** Real, confirmed-live bug, not scoped to the
Analytics theme: `SearchInput.tsx` spread `{...rest}` (which includes any
caller `style`) *after* its own `style={{border:0, outline:'none',
background:'transparent', flex:1}}` on the inner `<input>` -- JSX/React
doesn't merge two `style` props on the same element, the later one wins
outright. `fund-allocation-dashboard-react`'s Issuer Ownership Screener
passes `style={{maxWidth:420, marginBottom:16}}` (clearly intended for the
whole search box), which landed on the *inner input* instead and wiped its
transparent/borderless/flex-1 styling entirely. Confirmed live via
`getComputedStyle`: the input fell back to the browser's literal native
`type=search` defaults -- `background: rgb(255,255,255)`,
`border: 2px inset rgb(118,118,118)`, `flex: 0 1 auto` (not growing) -- which
rendered as a small (~174px) native-looking white box floating at the far
right of a much wider, otherwise-empty dark bar. The user's own description
("I cannot type anything... this looks like a tooltip") is exactly what that
combination looks like: the real input was there and *did* accept typed
text (confirmed: `.value` updated correctly even in this broken state), but
nothing about its appearance or position read as "the search box." The
`Header`'s own `SearchInput` usage never passes `style`, which is why it was
never affected and why this wasn't caught earlier. **Fixed**: `style`
destructured out separately and applied to the *outer* wrapper div (the
natural target for a caller's box-sizing intent); `{...rest}` now spreads
*before* the input's own load-bearing `style`, so no future caller-supplied
prop can silently clobber it the same way, whether or not it happens to be
`style` specifically.

**The Analytics theme never painted the page canvas -- only the components
that explicitly reference surface tokens did.** Reported as "the tab and
page title/sub-title text color" still looking wrong even after the
text-color-inheritance fix in the entry above. Root cause, confirmed live
via `getComputedStyle`: `html{background-color:#fff}` (the vendor reset) is
what actually shows through the page canvas -- `body`, `#root`, the
`[data-theme="analytics"]` wrapper div, and `<main>` were all
`rgba(0,0,0,0)` (transparent) in the real consumer app, so the literal white
reset background was still visible everywhere *outside* a Card/KpiStat/etc.
The text-color fix from the prior entry was working correctly (title color
computed to the right bright `#d7e0f0`) -- it just had nothing dark to sit
on outside of individual component surfaces, so it read as low-contrast
again for a completely different reason than the first round. This exact
gap is *why* Storybook's own preview decorator paints
`background: var(--__s9cmpx-static-background-weak)` on its canvas (see
"Analytics theme: full dark token coverage" above) -- Storybook was already
covering for something the theme CSS itself never did, and this consumer
had no equivalent of its own. **Fixed at the theme root, same place as the
`color` fix**: `[data-theme="analytics"]` now also sets
`background-color: var(--__s9cmpx-static-background-weak)`, matching
Storybook's own decorator value exactly. This makes DESIGN.md §2's existing
claim ("set `data-theme` on an ancestor element... that's the only wiring a
consuming app needs") actually true for the first time for this theme --
previously a consumer had to separately know to paint the canvas itself, a
step Storybook hid by doing it for you. Verified live on both Fund Screener
and Fund Detail: real dark navy canvas end to end, no more white bleeding
through around/between cards.

**A real feature gap, not a bug**: `Header`'s search field had no wired
behavior at all (`SearchInput` with no `onChange`/`onSubmit`/enter-handling
exposed) -- confirmed by reading the component before assuming otherwise.
Typing and pressing Enter did nothing, which reads as broken even though it
was simply never implemented. `Header` grew an `onSearch?: (query: string)
=> void` prop, called on Enter with the field's own now-internally-tracked
value; the consumer wires it to `navigate('/issuers?q=' + query)` and
`IssuerScreenerPage` seeds/re-syncs its own search state from `?q=` (via
`useSearchParams`, re-checked on every navigation since revisiting the same
route with a new query string doesn't remount the page). Scoped
deliberately narrow: only issuers are searchable end-to-end today (funds
have no equivalent text-search endpoint), so the placeholder was corrected
from "Search issuers, funds…" to "Search issuers…" rather than promising a
fund search that doesn't exist.

**A real race condition surfaced while testing the above, unrelated to any
of it**: `IssuerScreenerPage`'s issuer-select `onClick` had no guard against
a slow `getIssuerOwnership()` response resolving *after* the user had
already retyped a new query or clicked "back to search" -- confirmed live
via a fast click-then-type sequence where the stale response resurrected
the old issuer's detail view on top of a fresh, unrelated search. Fixed
with a ref tracking the latest requested/cleared security_id; a response is
only applied if it's still the most recent request. Also added an explicit
"← Back to search results" button on the selected-issuer view (clears the
same ref) -- previously the only way back to the results list was to retype
the search box, which worked but wasn't discoverable.

## Two new light themes: Analytics Bright — Broadsheet + Signal (2026-09-03)

External design handoff (Claude Design), delivered as a bundle with two production-shaped CSS
files, an HTML mock, PNG screenshots, and a README -- reviewed and adopted essentially as-is,
not rewritten. **Broadsheet** (`analytics-bright-broadsheet.css`): warm paper canvas (`#F4F2ED`),
near-black ink hierarchy, one hot vermillion accent (`#D8361B`), square geometry -- hierarchy
comes from type size and rules, not color everywhere. **Signal** (`analytics-bright-signal.css`):
cool bright canvas (`#F3F6FD`), cobalt primary (`#1B4DFF`), a hue per metric group
(cobalt/violet/magenta), rounded geometry -- color does the hierarchy work instead. Both are
light counterparts to `analytics`; both are full-coverage themes like it (brand ramp through AG
Grid tokens), not the minimal `green.css`/`blue.css` ~30-token template.

**The one deliberate light/dark split, in both**: chart panels stay dark
(`--__s9cmpx-chart-surface`, `#171614` Broadsheet / `#0C1226` Signal) inside an otherwise-light
shell, so the existing vivid categorical series keeps the luminance separation it was validated
for. This needed a rule `analytics.css` never had to write: `.js-plotly-plot { background:
var(--__s9cmpx-chart-surface) }`, plus `fill: ... !important` on Plotly's inline-SVG
tick/legend/axis colors (Plotly writes these directly as SVG attributes sourced from
`--__s9cmpx-static-text-weak`, a light-theme grey here, which a normal CSS rule can't reach --
confirmed by grep that `analytics.css` has zero `.js-plotly-plot` matches, because its own canvas
is already dark everywhere so Plotly's transparent `paper_bgcolor`/`plot_bgcolor` was already
correct with no extra rule). The handoff's README claimed both new files are "drop-in siblings
of `analytics.css`" using "the same override surface" -- true for every other category (surfaces,
ink, dividers, sentiment, interactive states, buttons, chart categorical palette, sidebar-nav ink,
AG Grid tokens), false only for this one selector, which is genuinely new. Not a defect in the
handoff, just an imprecise claim; the CSS files' own header comments already explain it correctly.

**`--__s9cmpx-color-brand-100`/`-200` hijacked as on-dark gridline/zeroline values** in both
themes (same technique `analytics.css` already documents, same reason: `SyChart` reads these two
specifically as chart gridline/zeroline colors, and a dark chart panel needs on-dark hairline
values there instead of a brand tint). Use `brand-50` or `brand-300`+ for actual brand color in
either theme.

**Signal-only additions, both documented as review items in the handoff and kept as-is**: two
non-semantic accent tokens, `--__s9cmpx-accent-secondary` (violet `#7A3CFF`) and
`--__s9cmpx-accent-tertiary` (magenta `#E0219A`) -- "a hue per metric group" is this theme's whole
idea and the semantic token layer has no name for it, so these ship as plain named custom
properties for consumers to apply directly (`KpiStat` accent rules, nav-item icons, a
second/third categorical dimension). And four remapped base radius steps,
`--__s9cmpx-border-radius-2/3/4/6` → 4/6/8/10px, since rounder geometry is part of Signal's
character -- the step *names* no longer match their pixel values after this, though the order
stays monotonic, which is what components actually rely on.

Registered both in `.storybook/preview.tsx` (imports + `globalTypes.theme.toolbar.items`) and
documented in `README.md`'s theme list and `DESIGN.md` §2, following the existing `analytics`
entry's own style (inline gotcha documentation, not a separate doc). Verified: `npm test`
(Storybook's `a11y.test: 'error'` runs axe on every story, including both new themes') passes;
eyeballed both themes across `Templates/ClimateDashboard`, `Shell/AppShell`, `DataTable`,
`SyChart` (all kinds incl. treemap/choropleth), `KpiStat`, `Tag`, `InlineAlert`, `Tabs`, `Select`,
`TableFilter`, `Score`, `Gauge` in the Storybook toolbar.

**Only Broadsheet ships to a real app so far** -- adopted in
`us_fund_family_india_allocation_monitor/fund-allocation-dashboard-react` (separate PR, same
session) as a user-selectable alternative to the existing dark `analytics` theme, switchable at
runtime and persisted in `localStorage`. Signal is not yet adopted by any consumer, per explicit
user decision -- it exists here as a ready asset for a future app.
