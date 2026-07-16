import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from './Spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Components/Spinner',
  component: Spinner,
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'default'] },
  },
  args: { size: 'default', inverse: false, label: 'Loading…' },
};
export default meta;
type Story = StoryObj<typeof Spinner>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
      <Spinner size="xs" />
      <Spinner size="sm" />
      <Spinner />
      <Spinner label="Preparing export…" />
    </div>
  ),
};
