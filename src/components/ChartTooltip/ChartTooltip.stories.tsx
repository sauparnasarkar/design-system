import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ChartTooltip } from './ChartTooltip';

const meta: Meta<typeof ChartTooltip> = {
  title: 'Components/ChartTooltip',
  component: ChartTooltip,
  argTypes: {
    variant: { control: 'select', options: ['dark', 'light'] },
  },
  args: {
    title: 'Jun 2026',
    variant: 'dark',
    rows: [
      { color: 'var(--__s9cmpx-chart-categorical-default-01, #2677f1)', label: 'GDP Growth', value: '2.1%' },
      { color: 'var(--__s9cmpx-chart-categorical-default-02, #187254)', label: 'Inflation', value: '4.6%' },
      { color: 'var(--__s9cmpx-chart-categorical-default-03, #e6ad1b)', label: 'Policy Rate', value: '3.75%' },
    ],
  },
};
export default meta;
type Story = StoryObj<typeof ChartTooltip>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Jun 2026')).toBeInTheDocument();
    await expect(canvas.getByText('GDP Growth')).toBeInTheDocument();
    await expect(canvas.getByText('2.1%')).toBeInTheDocument();
    await expect(canvas.getByText('Inflation')).toBeInTheDocument();
    await expect(canvas.getByText('Policy Rate')).toBeInTheDocument();
  },
};

export const Light: Story = {
  args: { variant: 'light' },
};

export const NoTitle: Story = {
  args: { title: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText('Jun 2026')).not.toBeInTheDocument();
    // Rows still render without a title.
    await expect(canvas.getByText('GDP Growth')).toBeInTheDocument();
  },
};
