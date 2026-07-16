import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  argTypes: {
    size: { control: 'select', options: ['small', 'default', 'large', 'xlarge'] },
  },
  args: {
    name: 'Sauparna Sarkar',
    size: 'default',
    gray: false,
    bordered: false,
    square: false,
  },
};
export default meta;
type Story = StoryObj<typeof Avatar>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      {/* the vendor default background is white; use gray/bordered on light surfaces */}
      <Avatar name="Sauparna Sarkar" size="small" gray />
      <Avatar name="Sauparna Sarkar" gray />
      <Avatar name="Sauparna Sarkar" size="large" gray />
      <Avatar name="Sauparna Sarkar" size="xlarge" bordered />
      <Avatar name="Sauparna Sarkar" square gray />
    </div>
  ),
};
