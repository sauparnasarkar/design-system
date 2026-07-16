import type { Meta, StoryObj } from '@storybook/react-vite';
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
