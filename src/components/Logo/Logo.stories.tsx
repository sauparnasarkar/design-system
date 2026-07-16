import type { Meta, StoryObj } from '@storybook/react-vite';
import { Logo } from './Logo';

const meta: Meta<typeof Logo> = {
  title: 'Components/Logo',
  component: Logo,
  argTypes: {
    product: { control: 'select', options: ['default', 'green', 'blue', 'analytics'] },
    height: { control: { type: 'range', min: 16, max: 64, step: 4 } },
  },
  args: {
    product: 'default',
    height: 28,
  },
};
export default meta;
type Story = StoryObj<typeof Logo>;

export const Playground: Story = {};

export const AllProducts: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {(['default', 'green', 'blue', 'analytics'] as const).map((p) => (
        <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="sy-label3" style={{ width: 90, color: 'var(--sy-static-text-weak)' }}>{p}</span>
          <Logo product={p} />
        </div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span className="sy-label3" style={{ width: 90, color: 'var(--sy-static-text-weak)' }}>large</span>
        <Logo product="default" height={48} />
      </div>
    </div>
  ),
};
