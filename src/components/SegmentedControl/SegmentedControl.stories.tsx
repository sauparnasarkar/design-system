import type { Meta, StoryObj } from '@storybook/react-vite';
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

export const Playground: Story = {};

export const IconSegments: Story = {
  args: {
    items: [
      { value: 'grid', icon: 'grid', ariaLabel: 'Grid view' },
      { value: 'list', icon: 'menu', ariaLabel: 'List view' },
    ],
    square: true,
  },
};
