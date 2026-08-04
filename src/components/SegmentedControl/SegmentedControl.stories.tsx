import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { SegmentedControl } from './SegmentedControl';

const meta: Meta<typeof SegmentedControl> = {
  title: 'Components/SegmentedControl',
  component: SegmentedControl,
  argTypes: {
    size: { control: 'select', options: ['small', 'medium'] },
  },
  args: {
    items: [
      { value: 'all', label: 'All' },
      { value: 'reports', label: 'Reports' },
      { value: 'entities', label: 'Entities' },
      { value: 'instruments', label: 'Instruments' },
    ],
    size: 'medium',
    square: false,
    fullWidth: false,
    disabled: false,
  },
};
export default meta;
type Story = StoryObj<typeof SegmentedControl>;

export const Playground: Story = {
  args: { onChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const all = canvas.getByRole('radio', { name: 'All' });
    const reports = canvas.getByRole('radio', { name: 'Reports' });
    // Uncontrolled: the first item is selected by default.
    await expect(all).toBeChecked();

    await userEvent.click(reports);
    await expect(reports).toBeChecked();
    await expect(all).not.toBeChecked();
    await expect(args.onChange).toHaveBeenCalledWith('reports');
  },
};

export const IconSegments: Story = {
  args: {
    items: [
      { value: 'grid', icon: 'grid', ariaLabel: 'Grid view' },
      { value: 'list', icon: 'menu', ariaLabel: 'List view' },
    ],
    square: true,
  },
};
