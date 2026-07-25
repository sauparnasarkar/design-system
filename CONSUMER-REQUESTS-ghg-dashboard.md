# Consumer Requests — GHG Emissions Dashboard

Status: proposals only — nothing here is queued, same convention as `ENHANCEMENTS.md`.

Separate from `ENHANCEMENTS.md`'s internal roadmap (that file tracks capability gaps
found by auditing this system against production fg pages; this one tracks concrete
bugs/gaps found by a specific consumer, `sauparnasarkar/climate-emissions-analysis-
project`, while building against components as they exist today). Source: a full UX
review of that project's React dashboard, cross-checked against this repo's actual
component source rather than assumed from app-side symptoms alone. Full context/
rationale lives in that project's `ENHANCEMENTS.md`, Release 3 §3.14 — this doc is the
subset of findings that are genuinely this repo's responsibility to fix, extracted so
they're actionable without needing the other repo's context.

Four components, four independent items — no dependency between them.

## 1. `KpiStat` — `deltaDirection` colors by numeric sign, not by outcome

**File:** `src/components/KpiStat/KpiStat.tsx`

Current behavior: `deltaDirection: 'up' | 'down' | 'neutral'` colors `'up'` green
(`--__s9cmpx-static-text-sentiment-positive`) and `'down'` red
(`--__s9cmpx-static-text-sentiment-negative`) — a generic "this number increased/
decreased" convention, the same one a stock-price ticker would use.

**Why this is a real bug, not just a style preference:** for any consumer where "the
number went up" and "the outcome is good" point in *opposite* directions — which is
exactly the GHG dashboard's case, since an increase in emissions is bad — a caller has
to invert the semantics at the call site (pass `"up"` when the underlying metric went
down, and vice versa) to get the correct color. That inversion is easy to get backwards,
and in the consuming app, it currently *is* backwards: a "Fastest Growth" card (an
increase in emissions) is wired to `deltaDirection="up"` → renders green; a "Largest
Reduction" card (a decrease) is wired to `deltaDirection="down"` → renders red. Emissions
growth reads as good news, reduction reads as bad news, on the same page whose own tier
table — right above these two cards — colors the identical concept correctly.

**Proposed fix:** add a `'good' | 'bad'` pair to `deltaDirection`, mapped directly to
the sentiment colors regardless of numeric sign, alongside the existing `'up' | 'down' |
'neutral'` (kept for consumers where up-is-good genuinely holds, e.g. revenue,
attendance):

```ts
deltaDirection?: 'up' | 'down' | 'neutral' | 'good' | 'bad';
```
```ts
const deltaColor =
  deltaDirection === 'up' || deltaDirection === 'good'
    ? 'var(--__s9cmpx-static-text-sentiment-positive, #187254)'
    : deltaDirection === 'down' || deltaDirection === 'bad'
      ? 'var(--__s9cmpx-static-text-sentiment-negative, #8d1a2a)'
      : 'var(--__s9cmpx-static-text-weak, #757575)';
```
The chevron icon (`up`/`down`) is currently tied to the same prop for direction *and*
color — decide whether `'good'`/`'bad'` should still render a chevron (and if so, in
which direction) or omit it, since "good"/"bad" doesn't inherently imply a numeric
direction the way "up"/"down" does. Simplest: `'good'`/`'bad'` render no chevron
(matching `'neutral'`'s current icon-less treatment), leaving the chevron as an
up/down-only affordance.

## 2. `MultiSelect` — clear-all button visually collides with the last tag's remove-×

**File:** `src/components/MultiSelect/MultiSelect.tsx`

The component already does the right thing structurally: a correctly
`aria-label="Clear all"`-labeled clear button exists (lines ~198–211), separate from
each selected tag's own `Tag`'s `onRemove` "×". The bug is purely visual — both use the
same `Icon name="close"` at the same size, and the clear-all button sits directly
adjacent to the last tag in the always-visible control row
(`__s9cmpx-dropdown-multi-select__indicator`), with no spacing or divider between them.
In a live screenshot this reads as two identical, ambiguous "×"s in a row — a user can't
tell "remove the last country" from "clear everything" without hovering to check the
tooltip/aria-label.

**Proposed fix**, either or both:
- Add a visible separator between the tag list and the indicator area — a
  `border-left` or `margin-left` of ~8px on `__s9cmpx-dropdown-multi-select__indicator`
  would be enough to visually group the clear-all + chevron as "control-level actions,"
  distinct from the per-item tags.
- Swap the clear-all icon for something that can't be confused with a chip's own
  remove-× at a glance — an "x-circle" icon (circle-backslash silhouette reads as
  "clear/reset" more distinctly than a bare "x"), or a short text label ("Clear") in
  place of the icon.

Benefits every `MultiSelect` consumer at once, not just the GHG dashboard — this is a
component-level fix, not something a consumer should have to work around per-page.

## 3. `SidebarNav` — no support for labeled sections/groups

**File:** `src/components/SidebarNav/SidebarNav.tsx`

Current shape: `items: SidebarNavItem[]` renders as one flat `<ul>`. The only
structural feature beyond that is `footerItems` — a single pinned bottom cluster,
separated by one `<hr>`, with no label of its own. There's no way for a consumer to
group items into labeled sections (e.g. "Exploration" vs. "Projection," or any other
product's equivalent split) without hand-rolling it outside the component.

**Proposed fix** — additive, not a breaking change to existing consumers:

```ts
export interface SidebarNavGroup {
  /** Section caption, e.g. "Exploration". Omit for an unlabeled cluster. */
  label?: string;
  items: SidebarNavItem[];
}

export interface SidebarNavProps {
  /** Flat list, unlabeled — existing behavior, unchanged for current consumers. */
  items?: SidebarNavItem[];
  /** Labeled sections — mutually exclusive with `items`. */
  groups?: SidebarNavGroup[];
  footerItems?: SidebarNavItem[];
  // ...rest unchanged
}
```

Render each group's `label` (when present) as a small caption above its `<ul>` —
reuse the existing `__s9cmpx-label3` / weak-text treatment already used elsewhere in
this component family (e.g. `MultiSelect`'s own label) for visual consistency — and
extend the existing `<hr>` divider pattern to run between every group, not just before
`footerItems`.

## 4. `SyChart` — no choropleth/treemap trace support, no explicit axis-range control, annotations only cover the reference-line case

**File:** `src/components/SyChart/SyChart.tsx`

Three related gaps, all in the same component, worth doing together since they touch
the same `layout`/trace-construction code:

**4a. No map or treemap trace type at all.** `SyChart` only ever emits Plotly
`type: 'scatter'` (for `kind: 'line'`/`'band'`) or `type: 'bar'`. A world-map
choropleth and a treemap are both genuinely new capabilities, not new props on an
existing shape:

```ts
kind?: 'bar' | 'line' | 'band' | 'choropleth' | 'treemap';

// choropleth-specific (kind: 'choropleth')
locations?: string[];        // ISO-3 codes
locationmode?: 'ISO-3';
zLog?: boolean;               // caller passes already-log-transformed z; component
                               // formats colorbar ticks back to real units — Plotly has
                               // no native log-scale colorbar the way xaxis.type='log'
                               // works for cartesian charts, so this needs explicit
                               // handling, not just passing zLog through to Plotly

// treemap-specific (kind: 'treemap')
labels?: string[];
parents?: string[];           // '' for root-level tiles — flat, non-hierarchical is fine
values?: number[];
```
The choropleth trace also needs its own `geo` layout block (projection type,
`showframe`, `showcoastlines`, background color matching the dashboard's dark theme)
which doesn't exist anywhere in `SyChart`'s current layout construction — treat this as
a parallel code path alongside the existing `xaxis`/`yaxis` layout, not an extension of
it.

**4b. No way to force an explicit axis range.** Both axes hardcode `fixedrange: true`
with no caller-supplied bounds — `yaxis`/`xaxis` ranges are entirely internal
(Plotly's auto-range). This blocks any consumer trying to keep multiple `SyChart`
instances visually comparable (e.g. several small-multiple panels that need to share
one y-axis scale so relative steepness isn't distorted by independent auto-scaling):

```ts
yRange?: [number, number];
xRange?: [number | string, number | string];
```
Applied as `layout.yaxis.range`/`layout.xaxis.range` when provided; Plotly's existing
auto-range behavior is the default and is unchanged when omitted.

**4c. `annotations` only ever renders the single `referenceY.label` case.** The
internal `layout.annotations` array is fully replaced by a one-item array derived from
`referenceY?.label` — there's no way for a consumer to add an arbitrary point
annotation (e.g. a labeled marker on a specific year/value) independent of the
reference-line feature:

```ts
export interface SyChartAnnotation {
  x: string | number;
  y: number;
  text: string;
  showarrow?: boolean;
}
// SyChartProps
annotations?: SyChartAnnotation[];
```
Merge caller-supplied `annotations` with the existing `referenceY?.label`-derived one
(concatenate both arrays into `layout.annotations`) rather than one replacing the
other, since a chart might reasonably want both a reference line label and one or more
point annotations at once.

---

**Cross-reference to existing roadmap items** (`ENHANCEMENTS.md`): item 7
("SidebarNav flyout integration") and item 8 ("Virtualized nested checkbox trees...for
huge option sets (all countries)") are adjacent to items 3 and 2 above respectively —
worth sequencing together if picked up, since item 8's stated example (a 200+ country
option set) is precisely the shape `MultiSelect`/`NestedMultiSelect` face in the GHG
dashboard consumer today.
