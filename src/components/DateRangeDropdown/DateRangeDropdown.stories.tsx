import type { Meta, StoryObj } from '@storybook/react-vite';
import { DateRangeDropdown } from './DateRangeDropdown';

const meta: Meta<typeof DateRangeDropdown> = {
  title: 'Components/DateRangeDropdown',
  component: DateRangeDropdown,
  args: {
    placeholder: 'Select Date',
    disabled: false,
  },
};
export default meta;
type Story = StoryObj<typeof DateRangeDropdown>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ minHeight: 420 }}>
      <DateRangeDropdown {...args} />
    </div>
  ),
};
