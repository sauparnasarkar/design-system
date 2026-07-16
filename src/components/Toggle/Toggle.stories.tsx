import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toggle } from './Toggle';

const meta: Meta<typeof Toggle> = {
  title: 'Components/Toggle',
  component: Toggle,
  argTypes: {
    size: { control: 'select', options: ['small', 'medium', 'large'] },
  },
  args: {
    label: 'Email notifications',
    size: 'medium',
    disabled: false,
    defaultChecked: true,
  },
};
export default meta;
type Story = StoryObj<typeof Toggle>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Toggle size="small" label="Small" defaultChecked />
      <Toggle size="medium" label="Medium" defaultChecked />
      <Toggle size="large" label="Large" defaultChecked />
      <Toggle size="medium" label="Disabled" disabled />
    </div>
  ),
};
