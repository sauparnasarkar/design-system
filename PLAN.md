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
