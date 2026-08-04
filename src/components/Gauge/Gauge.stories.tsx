import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Gauge } from './Gauge';
import { ChartCard } from '../SyChart/ChartCard';

const meta: Meta<typeof Gauge> = {
  title: 'Components/Gauge',
  component: Gauge,
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 120, step: 0.1 } },
  },
  args: {
    value: 62.8,
    min: 0,
    max: 120,
    suffix: '°F',
    height: 220,
  },
};
export default meta;
type Story = StoryObj<typeof Gauge>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ maxWidth: 380 }}>
      <ChartCard title="Current Temperature">
        <Gauge {...args} />
      </ChartCard>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Plotly renders the indicator's number + suffix as SVG text — wait for its async draw.
    await expect(canvas.findByText(/62\.8.*°F/)).resolves.toBeInTheDocument();
  },
};
