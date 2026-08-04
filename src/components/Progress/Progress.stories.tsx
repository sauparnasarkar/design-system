import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Progress } from './Progress';

const meta: Meta<typeof Progress> = {
  title: 'Components/Progress',
  component: Progress,
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'tertiary', 'success'] },
    value: { control: { type: 'range', min: 0, max: 100, step: 5 } },
  },
  args: { value: 60, variant: 'primary', large: false, square: false, label: 'Bulk export' },
};
export default meta;
type Story = StoryObj<typeof Progress>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <Progress {...args} />
    </div>
  ),
};

export const ClampsAboveMax: Story = {
  args: { value: 150, label: 'Over 100%' },
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <Progress {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = canvas.getByRole('progressbar');
    await expect(bar).toHaveAttribute('aria-valuenow', '100');
    // The visible % readout next to the label must reflect the same clamped value.
    await expect(canvas.getByText('100%')).toBeInTheDocument();
  },
};

export const ClampsBelowMin: Story = {
  args: { value: -20, label: 'Negative value' },
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <Progress {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = canvas.getByRole('progressbar');
    await expect(bar).toHaveAttribute('aria-valuenow', '0');
    await expect(canvas.getByText('0%')).toBeInTheDocument();
  },
};
