import type { Meta, StoryObj } from '@storybook/react-vite';
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
      { color: 'var(--sy-chart-categorical-default-01, #2677f1)', label: 'GDP Growth', value: '2.1%' },
      { color: 'var(--sy-chart-categorical-default-02, #187254)', label: 'Inflation', value: '4.6%' },
      { color: 'var(--sy-chart-categorical-default-03, #e6ad1b)', label: 'Policy Rate', value: '3.75%' },
    ],
  },
};
export default meta;
type Story = StoryObj<typeof ChartTooltip>;

export const Playground: Story = {};

export const Light: Story = {
  args: { variant: 'light' },
};
