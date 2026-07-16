import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon, ICON_NAMES } from './Icon';

const meta: Meta<typeof Icon> = {
  title: 'Components/Icon',
  component: Icon,
  argTypes: {
    name: { control: 'select', options: ICON_NAMES },
    size: { control: { type: 'range', min: 12, max: 48, step: 2 } },
  },
  args: { name: 'search', size: 24 },
};
export default meta;
type Story = StoryObj<typeof Icon>;

export const Playground: Story = {};

export const AllIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
      {ICON_NAMES.map((n) => (
        <div key={n} style={{ width: 96, textAlign: 'center' }}>
          <Icon name={n} size={24} />
          <div className="sy-label3" style={{ color: 'var(--sy-static-text-weak)' }}>{n}</div>
        </div>
      ))}
    </div>
  ),
};
