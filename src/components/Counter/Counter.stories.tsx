import type { Meta, StoryObj } from '@storybook/react-vite';
import { Counter } from './Counter';

const meta: Meta<typeof Counter> = {
  title: 'Components/Counter',
  component: Counter,
  argTypes: {
    variant: { control: 'select', options: ['default', 'active', 'important', 'new-items'] },
  },
  args: { value: 23, variant: 'default' },
};
export default meta;
type Story = StoryObj<typeof Counter>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      {(['default', 'active', 'important', 'new-items'] as const).map((v) => (
        <span key={v} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span className="sy-label3">{v}</span>
          <Counter value={23} variant={v} />
        </span>
      ))}
      <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <span className="sy-label3">capped</span>
        <Counter value={140} max={99} variant="important" />
      </span>
    </div>
  ),
};
