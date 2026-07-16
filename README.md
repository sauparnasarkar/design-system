# Syena Design System

The component library and design tokens for **Syena Intelligent Systems**
products, documented in Storybook.

```bash
npm install
npm run storybook   # http://localhost:6006
```

Switch themes with the **Theme** dropdown in the Storybook toolbar:

- **Syena Default** — neutral/black primary (base tokens, no override)
- **Green theme** — teal accent (`[data-theme="green"]`)
- **Blue theme** — royal blue accent (`[data-theme="blue"]`)
- **Analytics theme** — dark data-viz look (`[data-theme="analytics"]`,
  SciChart-inspired): deep navy canvas, cyan accent, and its own vivid
  chart palette validated for the dark surface

## Architecture

Everything is token-driven. `src/styles/vendor/syena-default-theme.css`
defines ~1,100 `--sy-*` CSS custom properties (17 color ramps, semantic
colors, a full type scale, per-component tokens, 3 chart palettes);
`sy-design-system.min.css` consumes them via `--sy-c-*` component variables.
Themes are small override files in `src/styles/themes/` scoped to
`[data-theme=…]` — a new theme is ~30 token overrides.

- `src/components/<Name>/` — typed React components emitting `sy-*` classes
  (variants/sizes/states as props), each with a `.stories.tsx` with controls
- `src/tokens/` — token showcase stories (color ramps, semantic colors, type
  scale)
- `src/assets/logos/syena-mark.png` — the official Syena eagle mark
  (transparent background), used by the `Logo` lockup component

## Component inventory (61)

Button, Typography, Link, Tag, Chip, Tabs, TabsWrapper, SegmentedControl,
Checkbox, Radio, Toggle, Input, Select, MultiSelect, NestedMultiSelect,
SearchInput, DropdownMenu, DateRangeDropdown, InlineAlert, BannerAlert,
Card(+Header), Tile, Accordion, Breadcrumb, Table, DataTable (AG Grid with
the `ag-theme-syena` skin) + presets (HeatCell, TrendCell, TableToolbar),
TableFilter, Pagination, Icon, Avatar, Logo, Modal, Drawer, Toast, Tooltip,
ChartTooltip, SyChart (Plotly: column / stacked+line / grouped / multi-line)
+ ChartCard, Slider, KrfSlider, Score, Progress, Spinner, DotTyping, Divider,
Section, Textarea, Counter, EmptyState, JumpLinks, FileUpload, KpiStat, Gauge, News,
MediaObject, CardCarousel, ContactItem, ContactModule, Chatbot (Syena AI),
and the app shell (Header, SidebarNav, SidebarNavFlyout, AppSwitcher, Footer)
plus composed page stories: `Shell/AppShell` and `Templates/ClimateDashboard`.

## Roadmap

See `ENHANCEMENTS.md` for the proposed enhancement backlog.

## Provenance

The token architecture and component styling were derived from research into
production financial-data UIs; the raw research (screenshots, computed-style
extractions, reference CSS) is archived under `analysis/` and is not shipped.
All shipped classes and tokens live in the `sy-` namespace.
