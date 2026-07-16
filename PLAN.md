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
