import type { Meta, StoryObj } from '@storybook/react-vite';
import { Radio } from './Radio';

const meta: Meta<typeof Radio> = {
  title: 'Components/Radio',
  component: Radio,
  args: {
    label: 'Include withdrawn ratings',
    name: 'playground',
    error: false,
    large: false,
    disabled: false,
  },
};
export default meta;
type Story = StoryObj<typeof Radio>;

export const Playground: Story = {};

export const Group: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Radio name="g" label="All reports" defaultChecked />
      <Radio name="g" label="Rating actions only" />
      <Radio name="g" label="Research only" />
      <Radio name="g" label="Disabled option" disabled />
    </div>
  ),
};
