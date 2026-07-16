import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider } from './Divider';

const meta: Meta<typeof Divider> = {
  title: 'Components/Divider',
  component: Divider,
  argTypes: {
    emphasis: { control: 'select', options: ['weak', 'default', 'strong'] },
  },
  args: { vertical: false, emphasis: 'default', dashed: false },
};
export default meta;
type Story = StoryObj<typeof Divider>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ maxWidth: 480 }}>
      <p className="sy-body3-long">Reports</p>
      <Divider {...args} />
      <p className="sy-body3-long">Entities</p>
      <Divider {...args}>OR</Divider>
      <p className="sy-body3-long">Instruments</p>
    </div>
  ),
};
