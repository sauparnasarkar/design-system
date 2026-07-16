import type { Meta, StoryObj } from '@storybook/react-vite';
import { InlineAlert } from './InlineAlert';

const meta: Meta<typeof InlineAlert> = {
  title: 'Components/InlineAlert',
  component: InlineAlert,
  argTypes: {
    variant: { control: 'select', options: ['default', 'success', 'warning', 'error'] },
  },
  args: {
    children: 'Compendium of rating actions following publication of updated bank rating criteria.',
    variant: 'default',
    withBorder: false,
    fullWidth: false,
  },
};
export default meta;
type Story = StoryObj<typeof InlineAlert>;

export const Playground: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 640 }}>
      {(['default', 'success', 'warning', 'error'] as const).map((v) => (
        <InlineAlert key={v} variant={v} withBorder fullWidth link={{ label: 'View report', href: '#' }}>
          {v.charAt(0).toUpperCase() + v.slice(1)} alert message body.
        </InlineAlert>
      ))}
    </div>
  ),
};
