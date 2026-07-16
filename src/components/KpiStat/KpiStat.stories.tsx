import type { Meta, StoryObj } from '@storybook/react-vite';
import { KpiStat } from './KpiStat';

const meta: Meta<typeof KpiStat> = {
  title: 'Components/KpiStat',
  component: KpiStat,
  argTypes: {
    deltaDirection: { control: 'select', options: ['up', 'down', 'neutral'] },
  },
  args: {
    label: '10-Country CO₂ (2024)',
    value: '25,324 MtCO₂',
    delta: '+76.5% since 1990',
    deltaDirection: 'up',
    card: true,
  },
};
export default meta;
type Story = StoryObj<typeof KpiStat>;

export const Playground: Story = {};

export const KpiRow: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <KpiStat label="Average Dew Point" value="32.3°F" />
      <KpiStat label="Average Humidity" value="56.3%" delta="-2.1% vs yesterday" deltaDirection="down" />
      <KpiStat label="Average Visibility" value="10.1 mi" delta="+0.4 mi" deltaDirection="up" />
      <KpiStat label="Countries Analysed" value="10" delta="unchanged" deltaDirection="neutral" />
    </div>
  ),
};
