import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs } from './Tabs';

const SECTOR_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'issuers', label: 'Issuers' },
  { id: 'research', label: 'Research' },
  { id: 'ratings', label: 'Ratings Research' },
  { id: 'insights', label: 'Insights' },
];

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'tertiary', 'chips'] },
    size: { control: 'select', options: ['small', 'large'] },
  },
  args: {
    items: SECTOR_TABS,
    variant: 'primary',
    size: 'large',
  },
};
export default meta;
type Story = StoryObj<typeof Tabs>;

export const Playground: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {(['primary', 'secondary', 'tertiary', 'chips'] as const).map((v) => (
        <div key={v}>
          <div className="__s9cmpx-label3" style={{ marginBottom: 8, color: 'var(--__s9cmpx-static-text-weak)' }}>{v}</div>
          <Tabs items={SECTOR_TABS} variant={v} />
        </div>
      ))}
    </div>
  ),
};
