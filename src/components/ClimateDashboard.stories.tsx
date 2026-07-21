import type { Meta, StoryObj } from '@storybook/react-vite';
import { KpiStat } from './KpiStat/KpiStat';
import { Gauge } from './Gauge/Gauge';
import { SyChart } from './SyChart/SyChart';
import { ChartCard } from './SyChart/ChartCard';
import { Select } from './Select/Select';
import { MultiSelect } from './MultiSelect/MultiSelect';

const YEARS_HIST = Array.from({ length: 35 }, (_, i) => 1990 + i);
const YEARS_FC = Array.from({ length: 20 }, (_, i) => 2024 + i);

const co2 = (base: number, growth: number) => YEARS_HIST.map((_, i) => Math.round(base + i * growth + Math.sin(i / 4) * base * 0.02));

const meta: Meta = {
  title: 'Templates/ClimateDashboard',
  parameters: { layout: 'fullscreen' },
};
export default meta;

/**
 * Climate dashboard template (GHG Trend Analysis layout, SciChart-style dark
 * theming). Rendered inside the Analytics theme regardless of the toolbar.
 */
export const Overview: StoryObj = {
  render: () => (
    <div data-theme="analytics" style={{ background: 'var(--__s9cmpx-static-background-weak)', minHeight: '100vh', padding: 24, fontFamily: 'var(--__s9cmpx-font-families-primary)', color: 'var(--__s9cmpx-static-text-standard)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h1 className="__s9cmpx-headline4" style={{ margin: 0 }}>Climate Change Trend Analysis and Forecasting</h1>
          <p className="__s9cmpx-body3-short" style={{ margin: '4px 0 0', color: 'var(--__s9cmpx-static-text-weak)' }}>
            Greenhouse gas emissions for 10 major countries — regression models and ETS(A,Ad,N) forecasting.
          </p>
        </div>
        <span className="__s9cmpx-label3" style={{ color: 'var(--__s9cmpx-static-text-weak)' }}>Data refreshed at Jul 13, 2026 09:06 PM</span>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <Select
          label="Country"
          size="small"
          options={['China', 'United States', 'India', 'Russia', 'Japan'].map((c) => ({ value: c, label: c }))}
          value="China"
        />
        <MultiSelect
          label="Compare"
          size="small"
          options={['China', 'United States', 'India', 'Russia', 'Japan', 'Germany'].map((c) => ({ value: c, label: c }))}
          value={['China', 'United States', 'India']}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
        <KpiStat label="10-Country CO₂ (2024)" value="25,324 MtCO₂" delta="+76.5% since 1990" deltaDirection="up" />
        <KpiStat label="Global Share" value="68.2%" delta="-0.8% vs 2023" deltaDirection="down" />
        <KpiStat label="Per-Capita Average" value="8.1 tCO₂" delta="+0.2 tCO₂" deltaDirection="up" />
        <KpiStat label="Countries Analysed" value="10" delta="OWID CO₂ dataset" deltaDirection="neutral" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 16 }}>
        <ChartCard title="Current Warming Index" headingLevel={2}>
          <Gauge value={1.28} min={0} max={2} suffix="°C" height={230} />
        </ChartCard>
        <ChartCard title="CO₂ Emissions Over Time (MtCO₂)" onDownload={() => {}} asOf="Jul 13, 2026" headingLevel={2}>
          <SyChart
            height={260}
            series={[
              { name: 'China', x: YEARS_HIST, y: co2(2500, 280), kind: 'line' },
              { name: 'United States', x: YEARS_HIST, y: co2(5100, -15), kind: 'line' },
              { name: 'India', x: YEARS_HIST, y: co2(600, 75), kind: 'line' },
            ]}
            xTitle="Year"
          />
        </ChartCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <ChartCard title="ETS(A,Ad,N) Forecast — China" onDownload={() => {}} headingLevel={2}>
          <SyChart
            height={260}
            series={[
              { name: 'Historical (1990–2024)', x: YEARS_HIST, y: co2(2500, 280), kind: 'line' },
              {
                name: '95% CI',
                x: YEARS_FC,
                y: YEARS_FC.map((_, i) => 12000 + i * 260 + i * i * 18),
                yLower: YEARS_FC.map((_, i) => 12000 + i * 140 - i * i * 14),
                kind: 'band',
                color: '#22a084',
              },
              { name: 'ETS Forecast', x: YEARS_FC, y: YEARS_FC.map((_, i) => 12000 + i * 200), kind: 'line', color: '#22a084' },
            ]}
            xTitle="Year"
          />
        </ChartCard>
        <ChartCard title="Emissions Scenarios (2025–2040)" onDownload={() => {}} headingLevel={2}>
          <SyChart
            height={260}
            referenceY={{ value: 2500, label: '1990 level' }}
            series={[
              { name: 'BAU', x: YEARS_FC, y: YEARS_FC.map((_, i) => 12200 + i * 190), kind: 'line' },
              { name: 'Moderate (−2%/yr)', x: YEARS_FC, y: YEARS_FC.map((_, i) => 12200 * Math.pow(0.98, i)), kind: 'line', color: '#bd8a1d' },
              { name: 'Aggressive (−5%/yr)', x: YEARS_FC, y: YEARS_FC.map((_, i) => 12200 * Math.pow(0.95, i)), kind: 'line', color: '#22a084' },
            ]}
            xTitle="Year"
          />
        </ChartCard>
      </div>
    </div>
  ),
};
