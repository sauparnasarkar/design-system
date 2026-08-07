import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { SyChart } from './SyChart';
import { ChartCard } from './ChartCard';
import { Select } from '../Select/Select';

const NOTCHES = ['AAA', 'AA+', 'AA', 'AA-', 'A+', 'A', 'A-', 'BBB+', 'BBB', 'BBB-', 'BB+', 'BB', 'BB-', 'B+', 'B', 'B-', 'CCC', 'WD'];
const YEARS = ['2022', '2023', '2024', '2025', '2026'];
const MONTHS = Array.from({ length: 24 }, (_, i) => `${2024 + Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, '0')}`);

const meta: Meta<typeof SyChart> = {
  title: 'Components/SyChart',
  component: SyChart,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof SyChart>;

/** Single-series column chart — "Ratings Distribution" shape. */
export const RatingsDistribution: Story = {
  render: () => (
    <ChartCard
      title="Ratings Distribution"
      actions={<Select size="small" ariaLabel="Rating type" options={[{ value: 'lt', label: 'LT IDR' }, { value: 'st', label: 'ST IDR' }]} value="lt" />}
      onDownload={() => {}}
      asOf="Jul 9, 2026, 10:04 AM EST"
    >
      <SyChart
        height={280}
        series={[{
          name: 'Entities',
          x: NOTCHES,
          y: [10, 14, 60, 950, 450, 120, 90, 130, 95, 70, 80, 110, 95, 75, 60, 45, 20, 140],
          color: '#1f1f1f',
        }]}
      />
    </ChartCard>
  ),
};

/** Stacked column + dotted line overlay — "Upgrade/Downgrade Ratio" shape. */
export const UpgradeDowngradeRatio: Story = {
  render: () => (
    <ChartCard title="Upgrade/Downgrade Ratio" onDownload={() => {}} asOf="Jul 9, 2026, 10:04 AM EST">
      <SyChart
        height={280}
        barmode="stack"
        series={[
          { name: 'Upgrades', x: YEARS, y: [55, 70, 90, 75, 380], color: '#2677f1' },
          { name: 'Downgrades', x: YEARS, y: [50, 45, 5, 25, 15], color: '#c42338' },
          { name: 'Upgrade/Downgrade Ratio', x: YEARS, y: [1.1, 1.5, 18, 3, 25.3], kind: 'line', dashed: true, color: '#494949' },
        ]}
      />
    </ChartCard>
  ),
};

/** Grouped column chart — "Documentation Score Distribution" shape. */
export const GroupedColumns: Story = {
  render: () => (
    <ChartCard title="Documentation Score Distribution" onDownload={() => {}}>
      <SyChart
        height={280}
        barmode="group"
        yTickFormat=".0%"
        series={[
          { name: 'USBS', x: ['1', '2', '3', '4', '5', 'No Score'], y: [0.01, 0.02, 0.06, 0.14, 0.2, 0.23] },
          { name: 'EMEA', x: ['1', '2', '3', '4', '5', 'No Score'], y: [0.005, 0.015, 0.04, 0.12, 0.03, 0.55] },
        ]}
        yTitle="% of Portfolio Notional"
      />
    </ChartCard>
  ),
};

/** Per-bar colors via `pointColors` — sign-based coloring (YoY change shape). */
export const SignColoredBars: Story = {
  render: () => {
    const countries = ['China', 'United States', 'India', 'Russia', 'Japan', 'Germany', 'Brazil', 'United Kingdom'];
    const yoy = [4.2, -1.1, 6.8, 0.9, -2.3, -3.1, 1.7, -1.9];
    return (
      <ChartCard title="YoY Emissions Change (%)" onDownload={() => {}}>
        <SyChart
          height={280}
          showLegend={false}
          series={[{
            name: 'YoY change',
            x: countries,
            y: yoy,
            pointColors: yoy.map((v) => (v < 0 ? '#dc2626' : '#4a90d9')),
          }]}
          yTitle="% vs prior year"
        />
      </ChartCard>
    );
  },
};

/** Horizontal bars via `orientation="h"` — feature-importance shape. */
export const HorizontalBars: Story = {
  render: () => {
    // reversed so the largest importance renders at the top
    const features = ['GDP per capita', 'Energy intensity', 'Coal share', 'Population', 'Renewables share', 'Oil price'].reverse();
    const importance = [0.05, 0.08, 0.11, 0.18, 0.26, 0.32];
    return (
      <ChartCard title="Feature Importance — Emissions Model" onDownload={() => {}}>
        <SyChart
          height={280}
          orientation="h"
          showLegend={false}
          yTickFormat=".0%"
          series={[{ name: 'Importance', x: features, y: importance }]}
        />
      </ChartCard>
    );
  },
};

/** Multi-series line chart — CLO "Key Metrics" shape (avg/min/max). */
export const MultiSeriesLine: Story = {
  render: () => {
    const wave = (base: number, amp: number) => MONTHS.map((_, i) => base + amp * Math.sin(i / 3) + (i % 5) * 0.2);
    return (
      <ChartCard title="WARF" onDownload={() => {}}>
        <SyChart
          height={280}
          yTitle="Rating Factor"
          series={[
            { name: 'Average Rating Factor', x: MONTHS, y: wave(33, 1), kind: 'line', color: '#2e5cb8' },
            { name: 'Min Rating Factor', x: MONTHS, y: wave(26, 1.5), kind: 'line', color: '#87ca65' },
            { name: 'Max Rating Factor', x: MONTHS, y: wave(43, 2), kind: 'line', color: '#c42338' },
          ]}
        />
      </ChartCard>
    );
  },
};

/**
 * Many-series legend in a narrow container (~290px, matching a mobile viewport) — regression
 * story for a real bug: a horizontal legend that can't fit all entries in one row wraps to one
 * item per row, and without extra height reserved for it, Plotly makes the legend's own
 * overflow area internally scrollable. That scrollbar rendered as a bare gray bar over the plot
 * with no visible legend container around it (no `bgcolor` is set), since the legend region
 * itself was clipped far below the tiny space actually available. Resize this story's container
 * (or check it in Chromatic/visual review at a narrow width) — every country should be listed
 * with no gray bar cutting across the lines.
 */
export const ManySeriesLineNarrow: Story = {
  render: () => {
    const years = ['1990', '2000', '2010', '2020', '2024'];
    const countries = ['China', 'United States', 'India', 'Russia', 'Japan', 'Germany', 'Brazil', 'United Kingdom', 'South Africa', 'Australia'];
    return (
      <div style={{ maxWidth: 290 }}>
        <ChartCard title="CO₂ Emissions by Country" onDownload={() => {}}>
          <SyChart
            height={280}
            xTitle="Year"
            yTitle="CO₂ (MtCO₂)"
            series={countries.map((name, i) => ({
              name,
              x: years,
              y: years.map((_, yi) => 1000 + i * 300 + yi * 150),
              kind: 'line' as const,
            }))}
          />
        </ChartCard>
      </div>
    );
  },
};

/** Shaded confidence-interval band, default vs. a lower `fillOpacity` for a less visually dominant CI. */
export const ConfidenceBand: Story = {
  render: () => {
    const years = ['2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028'];
    const central = [34500, 31200, 33600, 34900, 35100, 35400, 35700, 36000, 36300, 36600];
    const upper = central.map((v, i) => v + 400 * (i + 1));
    const lower = central.map((v, i) => v - 400 * (i + 1));
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: 16 }}>
        <ChartCard title="Default fillOpacity (0.25)" onDownload={() => {}}>
          <SyChart
            height={280}
            showLegend={false}
            series={[
              { name: 'Central', x: years, y: central, kind: 'line' },
              { name: '95% CI', x: years, y: upper, yLower: lower, kind: 'band' },
            ]}
          />
        </ChartCard>
        <ChartCard title="Reduced fillOpacity (0.12)" onDownload={() => {}}>
          <SyChart
            height={280}
            showLegend={false}
            series={[
              { name: 'Central', x: years, y: central, kind: 'line' },
              { name: '95% CI', x: years, y: upper, yLower: lower, kind: 'band', fillOpacity: 0.12 },
            ]}
          />
        </ChartCard>
      </div>
    );
  },
};

/**
 * World map — 'choropleth' kind with a log-scaled colorbar (`zLog`) so mid-tier values remain
 * distinguishable. Hover a country: the tooltip shows the real MtCO₂ figure (via `hoverUnit` +
 * `customdata`), not the log10-transformed color value. The colorbar renders horizontally below
 * the map rather than alongside it, so it never reads taller than the map itself.
 */
export const Choropleth: Story = {
  render: () => {
    const countries = ['CHN', 'USA', 'IND', 'RUS', 'JPN', 'DEU', 'BRA', 'GBR', 'ZAF', 'AUS', 'FRA', 'CAN', 'IDN', 'MEX'];
    const co2 = [11900, 5000, 2900, 1700, 1050, 640, 470, 340, 440, 390, 300, 570, 680, 480];
    return (
      <ChartCard title="Latest-Year CO₂ Emissions by Country" onDownload={() => {}}>
        <SyChart
          height={420}
          showLegend={false}
          series={[{
            name: 'CO₂ (Mt)',
            x: [],
            y: [],
            kind: 'choropleth',
            locations: countries,
            zLog: true,
            colorValues: co2,
            colorScale: [[0, '#fff2cc'], [0.5, '#f0a24a'], [1, '#7a1f1f']],
            colorbarTitle: 'MtCO₂',
            hoverUnit: 'MtCO₂',
          }]}
        />
      </ChartCard>
    );
  },
};

/**
 * Animated choropleth — `colorRange` pins the color scale across frames (so a lower-magnitude
 * year doesn't falsely read as "the same red" as a higher one), `animationFrame` drives per-tick
 * color updates via a direct `Plotly.restyle` rather than a full re-render (confirmed live: zoom
 * in on the map, then let it play — the zoom holds), and one country (`AUS`, only in frame 1) has
 * no data in some frames, rendering in `noDataColor` instead of vanishing into the background.
 * Hovering AUS in that frame shows the default "No data reported" tooltip (see
 * `noDataHoverText` on `SyChartSeries` — SPEC.md §5.18.4) rather than no hover at all.
 * Built for SPEC.md §5.17 (Animated Choropleth Time-Series).
 */
export const ChoroplethAnimated: Story = {
  render: () => {
    const countries = ['CHN', 'USA', 'IND', 'RUS', 'JPN', 'DEU', 'BRA', 'GBR', 'ZAF', 'AUS'];
    const frames = [
      [8200, 4300, 900, 1500, 950, 580, 300, 400, 300, null],
      [9600, 4700, 1400, 1600, 1000, 610, 380, 370, 380, 250],
      [11900, 5000, 2900, 1700, 1050, 640, 470, 340, 440, 390],
    ];
    const YEARS = [1990, 2010, 2024];
    const [frameIndex, setFrameIndex] = React.useState(0);
    const [playing, setPlaying] = React.useState(false);
    React.useEffect(() => {
      if (!playing) return;
      const id = setInterval(() => setFrameIndex((i) => (i + 1) % frames.length), 900);
      return () => clearInterval(id);
    }, [playing]);
    // Pinned across all frames, computed once from every frame's real min/max -- not just the
    // frame currently on screen. Never recomputed per tick.
    const colorRange = React.useMemo<[number, number]>(() => {
      const all = frames.flat().filter((v): v is number => v != null);
      return [Math.min(...all), Math.max(...all)];
    }, []);
    // Memoized to mount only -- must never change reference as frameIndex advances, or SyChart's
    // main effect re-runs and the animation loses the user's zoom (see animationFrame's own doc
    // comment on SyChartProps).
    const series = React.useMemo(
      () => [
        {
          name: 'CO₂ (Mt)',
          x: [],
          y: [],
          kind: 'choropleth' as const,
          locations: countries,
          zLog: true,
          colorValues: frames[0],
          colorRange,
          colorScale: [[0, '#fff2cc'], [0.5, '#f0a24a'], [1, '#7a1f1f']] as Array<[number, string]>,
          colorbarTitle: 'MtCO₂',
          hoverUnit: 'MtCO₂',
        },
      ],
      [colorRange],
    );
    return (
      <ChartCard title={`CO₂ Emissions by Country (${YEARS[frameIndex]})`} onDownload={() => {}}>
        <div style={{ marginBottom: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
          <button type="button" onClick={() => setPlaying((p) => !p)}>
            {playing ? 'Pause' : 'Play'}
          </button>
          <input
            type="range"
            aria-label="Animation frame"
            min={0}
            max={frames.length - 1}
            value={frameIndex}
            onChange={(e) => {
              setPlaying(false);
              setFrameIndex(Number(e.target.value));
            }}
          />
        </div>
        <SyChart height={420} showLegend={false} series={series} animationFrame={{ colorValues: frames[frameIndex] }} />
      </ChartCard>
    );
  },
};

/**
 * Flat, non-hierarchical treemap — 'treemap' kind sized by BAU cumulative total, colored by
 * reduction upside. Hover a tile: both the size metric (`values`, labeled via `valueLabel`) and
 * the color metric (`colorValues`, labeled via `colorbarTitle`) show up, not just the tile's
 * label and size the way Plotly's own default treemap hover would leave it.
 */
export const Treemap: Story = {
  render: () => {
    const countries = ['China', 'United States', 'India', 'Russia', 'Japan', 'Germany', 'Brazil', 'United Kingdom'];
    const bauTotal = [420000, 180000, 110000, 62000, 38000, 23000, 17000, 12000];
    const reductionUpsidePct = [18, 32, 12, 22, 41, 55, 25, 48];
    return (
      <ChartCard title="Cumulative BAU Emissions, Sized by Total / Colored by Reduction Upside" onDownload={() => {}}>
        <SyChart
          height={360}
          showLegend={false}
          series={[{
            name: 'Reduction Upside',
            x: [],
            y: [],
            kind: 'treemap',
            labels: countries,
            parents: countries.map(() => ''),
            values: bauTotal,
            // No hoverUnit here -- unlike the real app's usage (where both the size and color
            // metrics share MtCO₂), this story's color metric is a %, a different unit than the
            // size metric's MtCO₂, and hoverUnit applies the same suffix to both.
            valueLabel: 'Cumulative BAU',
            colorValues: reductionUpsidePct,
            colorScale: [[0, '#eaf7ea'], [1, '#1a7a3c']],
            colorbarTitle: '% Reduction Upside',
          }]}
        />
      </ChartCard>
    );
  },
};

/** Two small-multiple panels sharing an identical `yRange` — the detail that makes side-by-side comparison honest. */
export const SharedYRange: Story = {
  render: () => {
    const years = ['2019', '2020', '2021', '2022', '2023'];
    const chinaBau = [10200, 9800, 10500, 10800, 11200];
    const usBau = [5000, 4600, 4900, 4950, 4850];
    const sharedRange: [number, number] = [0, 12000];
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: 16 }}>
        <ChartCard title="China — BAU" onDownload={() => {}}>
          <SyChart height={260} showLegend={false} yRange={sharedRange} series={[{ name: 'BAU', x: years, y: chinaBau, kind: 'line' }]} />
        </ChartCard>
        <ChartCard title="United States — BAU" onDownload={() => {}}>
          <SyChart height={260} showLegend={false} yRange={sharedRange} series={[{ name: 'BAU', x: years, y: usBau, kind: 'line' }]} />
        </ChartCard>
      </div>
    );
  },
};

/** A custom annotation (e.g. "Global lockdowns") merged alongside the existing `referenceY` label annotation. */
export const Annotations: Story = {
  render: () => (
    <ChartCard title="Historical CO₂ with a 2020 Annotation" onDownload={() => {}}>
      <SyChart
        height={300}
        showLegend={false}
        referenceY={{ value: 30000, label: '1990 level' }}
        annotations={[{ x: '2020', y: 31500, text: 'Global lockdowns', showarrow: true }]}
        series={[{
          name: 'CO₂',
          x: ['2018', '2019', '2020', '2021', '2022'],
          y: [34500, 34800, 31200, 33600, 34900],
          kind: 'line',
        }]}
      />
    </ChartCard>
  ),
};

/** `ChartCard`'s `expandable` control (SPEC.md §5.11) — click the expand icon to toggle a
 * safe-area-aware fixed overlay; `children` as a function of `isExpanded` lets the chart grow
 * with it, rather than just sitting in a bigger empty card. */
export const Expandable: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: 16 }}>
      <ChartCard title="China — BAU" expandable>
        {(isExpanded) => (
          <SyChart
            height={isExpanded ? 600 : 280}
            showLegend={false}
            series={[{ name: 'BAU', x: YEARS, y: [10200, 9800, 10500, 10800, 11200], kind: 'line' }]}
          />
        )}
      </ChartCard>
      <ChartCard title="United States — BAU" expandable>
        {(isExpanded) => (
          <SyChart
            height={isExpanded ? 600 : 280}
            showLegend={false}
            series={[{ name: 'BAU', x: YEARS, y: [5000, 4600, 4900, 4950, 4850], kind: 'line' }]}
          />
        )}
      </ChartCard>
    </div>
  ),
};

/** `id` passthrough to the outer Card element (SPEC.md §5.19) -- gives a same-page anchor link
 * (JumpLinks) a stable target to scroll/focus to, independent of the card's own (often dynamic)
 * title. */
export const WithAnchorId: Story = {
  render: () => (
    <ChartCard id="ratings-distribution" title="Ratings Distribution" onDownload={() => {}}>
      <SyChart height={280} series={[{ name: 'Entities', x: NOTCHES.slice(0, 6), y: [10, 14, 60, 950, 450, 120], color: '#1f1f1f' }]} />
    </ChartCard>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByText('Ratings Distribution').closest('#ratings-distribution');
    await expect(card).not.toBeNull();
  },
};
