import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Globe } from './Globe';
import { Button } from '../Button/Button';
import { Slider } from '../Slider/Slider';

// A small synthetic fixture (not real data): ~30 countries, 8 five-year frames. Values span
// several orders of magnitude so the log scale has something to show; two countries have gaps so
// the no-data colour and the table's "No data" rows are exercised.
const ISO = ['CHN', 'USA', 'IND', 'RUS', 'JPN', 'DEU', 'BRA', 'GBR', 'ZAF', 'AUS', 'CAN', 'FRA', 'ITA', 'MEX', 'IDN', 'SAU', 'KOR', 'IRN', 'TUR', 'ESP', 'POL', 'THA', 'EGY', 'ARG', 'NGA', 'KEN', 'ETH', 'COD', 'NOR', 'NZL'];
const NAMES = ['China', 'United States', 'India', 'Russia', 'Japan', 'Germany', 'Brazil', 'United Kingdom', 'South Africa', 'Australia', 'Canada', 'France', 'Italy', 'Mexico', 'Indonesia', 'Saudi Arabia', 'South Korea', 'Iran', 'Turkey', 'Spain', 'Poland', 'Thailand', 'Egypt', 'Argentina', 'Nigeria', 'Kenya', 'Ethiopia', 'DR Congo', 'Norway', 'New Zealand'];
const BASE = [2400, 5100, 580, 2500, 1150, 1050, 200, 600, 250, 280, 430, 380, 400, 300, 150, 180, 250, 210, 130, 230, 350, 90, 80, 120, 40, 6, 4, 2, 35, 25];
const GROWTH = [4.9, 0.95, 5.5, 0.7, 0.85, 0.55, 2.4, 0.5, 1.6, 1.4, 1.1, 0.7, 0.75, 1.5, 5.2, 3.8, 2.3, 3.7, 3.2, 0.8, 0.85, 3.0, 3.2, 1.5, 3.0, 4.0, 6.0, 5.0, 1.1, 1.3];
const YEARS = [1990, 1995, 2000, 2005, 2010, 2015, 2020, 2024];
const VALUES: Array<Array<number | null>> = YEARS.map((_, f) =>
  BASE.map((b, i) => {
    if ((i === 26 && f < 2) || (i === 27 && f < 3)) return null;
    return Math.round(b * (1 + (GROWTH[i] - 1) * (f / (YEARS.length - 1))) * 100) / 100;
  }),
);
// Same 9-stop sequential ramp (ColorBrewer YlOrRd) the dashboard's flat map uses.
const SCALE: Array<[number, string]> = [
  [0, '#ffffcc'], [0.125, '#ffeda0'], [0.25, '#fed976'], [0.375, '#feb24c'], [0.5, '#fd8d3c'],
  [0.625, '#fc4e2a'], [0.75, '#e31a1c'], [0.875, '#bd0026'], [1, '#800026'],
];

const meta: Meta<typeof Globe> = {
  title: 'Components/Globe',
  component: Globe,
  args: {
    isoCodes: ISO,
    locationNames: NAMES,
    years: YEARS,
    values: VALUES,
    yearIndex: YEARS.length - 1,
    colorRange: [1, 10000],
    colorScale: SCALE,
    zLog: true,
    hoverUnit: 'MtCO₂',
    legendTitle: 'Emissions (MtCO₂)',
    ariaLabel: 'Globe of emissions by country',
    autoRotate: false,
  },
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Globe>;

/** Static view: no spin, latest frame. */
export const Default: Story = {};

function DrivenDemo(args: React.ComponentProps<typeof Globe>) {
  const [yi, setYi] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  React.useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setYi((i) => (i + 1) % YEARS.length), 4000);
    return () => window.clearInterval(id);
  }, [playing]);
  return (
    <div style={{ maxWidth: 640 }}>
      <Globe {...args} yearIndex={yi} title={<div style={{ fontSize: 28, fontWeight: 500 }}>{YEARS[yi]}</div>} />
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12 }}>
        <Button variant="ghost-blue" onClick={() => setPlaying((p) => !p)}>{playing ? 'Pause' : 'Play'}</Button>
        <div style={{ flex: 1 }}>
          <Slider label="Year" min={0} max={YEARS.length - 1} step={1} value={yi} onChange={setYi} showValue={false} />
        </div>
      </div>
    </div>
  );
}

/** The consumer owns the clock: a Play button and Slider drive `yearIndex`; the globe blends colours between frames and (here) spins once per step. */
export const DrivenByConsumer: Story = {
  args: { autoRotate: true, rotationPeriodMs: 4000 },
  render: (args) => <DrivenDemo {...args} />,
};

/** Arrow keys rotate (the canvas changes), +/- zoom, 0 resets; Table view swaps the canvas for a real table incl. "No data" rows. */
export const KeyboardAndTable: Story = {
  args: { yearIndex: 0 },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const globe = c.getByRole('img', { name: /Globe of emissions by country, 1990/ });
    globe.focus();
    // Let the first frame paint (geometry loads async), then compare pixels around a rotation.
    const canvas = globe as HTMLCanvasElement;
    await waitFor(() => {
      const ctx = canvas.getContext('2d')!;
      const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      expect(d.some((v, i) => i % 4 === 3 && v > 0)).toBe(true);
    }, { timeout: 5000 });
    const before = canvas.toDataURL();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    await waitFor(() => expect(canvas.toDataURL()).not.toBe(before));
    const rotated = canvas.toDataURL();
    await userEvent.keyboard('+');
    await waitFor(() => expect(canvas.toDataURL()).not.toBe(rotated));
    await userEvent.keyboard('0');
    await waitFor(() => expect(canvas.toDataURL()).toBe(before));

    await userEvent.click(c.getByRole('button', { name: 'Table view' }));
    const table = await c.findByRole('table');
    await expect(within(table).getByText('China')).toBeInTheDocument();
    await expect(within(table).getAllByText('No data').length).toBeGreaterThan(0);
    await userEvent.click(c.getByRole('button', { name: 'Globe view' }));
    await expect(c.queryByRole('table')).not.toBeInTheDocument();
  },
};

/** prefers-reduced-motion: no spin even with autoRotate, and year steps snap instead of blending. */
export const ReducedMotion: Story = {
  args: { autoRotate: true, rotationPeriodMs: 500 },
  decorators: [
    (Story) => {
      const orig = window.matchMedia;
      window.matchMedia = ((q: string) => ({ matches: q === '(prefers-reduced-motion: reduce)', media: q, addEventListener: () => {}, removeEventListener: () => {} })) as unknown as typeof window.matchMedia;
      React.useEffect(() => () => { window.matchMedia = orig; }, [orig]);
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement).getByRole('img') as HTMLCanvasElement;
    await waitFor(() => expect(canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data.some((v, i) => i % 4 === 3 && v > 0)).toBe(true), { timeout: 5000 });
    const a = canvas.toDataURL();
    await new Promise((r) => setTimeout(r, 800));
    await expect(canvas.toDataURL()).toBe(a);
  },
};

/** prefers-reduced-motion + `allowSpinWithReducedMotion`: the consumer's autoRotate (here standing in for "the user's Play button is running") is honoured -- the globe spins even though the OS asks for reduced motion. Colour blending stays off. */
export const ReducedMotionSpinOnRequest: Story = {
  args: { autoRotate: true, allowSpinWithReducedMotion: true, rotationPeriodMs: 1500 },
  decorators: [
    (Story) => {
      const orig = window.matchMedia;
      window.matchMedia = ((q: string) => ({ matches: q === '(prefers-reduced-motion: reduce)', media: q, addEventListener: () => {}, removeEventListener: () => {} })) as unknown as typeof window.matchMedia;
      React.useEffect(() => () => { window.matchMedia = orig; }, [orig]);
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement).getByRole('img') as HTMLCanvasElement;
    const painted = () => canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data.some((v, i) => i % 4 === 3 && v > 0);
    await waitFor(() => expect(painted()).toBe(true), { timeout: 5000 });
    const a = canvas.toDataURL();
    await waitFor(() => expect(canvas.toDataURL()).not.toBe(a), { timeout: 3000 });
  },
};

/** No panel background: sits on the page (check both themes in the toolbar -- on a dark page the ocean disc merges into it, on a light page it reads as a dark globe). */
export const Transparent: Story = {
  args: { transparent: true },
  decorators: [(Story) => <div style={{ background: 'var(--__s9cmpx-static-background-weak)', padding: 24 }}><Story /></div>],
};

/** Linear (non-log) scale, no legend/controls: the bare canvas for tight layouts. */
export const BareLinear: Story = {
  args: { zLog: false, colorRange: [0, 6000], showLegend: false, showControls: false },
};

/** A 320px-wide parent (a small phone): the padded panel and canvas must fit inside it -- no horizontal overflow. */
export const NarrowContainer: Story = {
  decorators: [(Story) => <div data-testid="narrow" style={{ width: 320 }}><Story /></div>],
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByTestId('narrow');
    const canvas = within(canvasElement).getByRole('img') as HTMLCanvasElement;
    await waitFor(() => expect(canvas.getBoundingClientRect().width).toBeGreaterThan(0));
    const outer = box.getBoundingClientRect();
    const c = canvas.getBoundingClientRect();
    await expect(c.right).toBeLessThanOrEqual(outer.right + 0.5);
    await expect(c.left).toBeGreaterThanOrEqual(outer.left - 0.5);
    await expect(box.scrollWidth).toBeLessThanOrEqual(box.clientWidth);
  },
};
