import type { Meta, StoryObj } from '@storybook/react-vite';
import { Link } from './Link';

const meta: Meta<typeof Link> = {
  title: 'Components/Link',
  component: Link,
  argTypes: {
    variant: { control: 'select', options: ['default', 'blue', 'inline', 'button'] },
    size: { control: 'select', options: [1, 2] },
  },
  args: {
    children: 'Global Economic Outlook - June 2026',
    href: '#',
    variant: 'blue',
    size: 2,
    hasVisited: false,
  },
};
export default meta;
type Story = StoryObj<typeof Link>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {(['default', 'blue', 'inline', 'button'] as const).map((v) => (
        <div key={v} style={{ display: 'flex', gap: 24, alignItems: 'baseline' }}>
          <span className="sy-label3" style={{ width: 70, color: 'var(--sy-static-text-weak)' }}>{v}</span>
          <Link href="#" variant={v} size={1}>Link size 1</Link>
          <Link href="#" variant={v} size={2}>Link size 2</Link>
        </div>
      ))}
    </div>
  ),
};
