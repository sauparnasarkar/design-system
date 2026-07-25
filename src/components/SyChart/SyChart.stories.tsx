import type { Meta, StoryObj } from '@storybook/react-vite';
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
