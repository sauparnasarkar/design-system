import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tag } from './Tag';

const meta: Meta<typeof Tag> = {
  title: 'Components/Tag',
  component: Tag,
  argTypes: {
    color: { control: 'select', options: ['grey', 'blue', 'green', 'red', 'yellow', 'white'] },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
  },
  args: {
    children: 'Cross-Sector',
    color: 'grey',
    size: 'medium',
    clickable: false,
  },
};
export default meta;
type Story = StoryObj<typeof Tag>;

export const Playground: Story = {};

export const AllColors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {(['grey', 'blue', 'green', 'red', 'yellow', 'white'] as const).map((c) => (
        <div key={c} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span className="sy-label3" style={{ width: 60, color: 'var(--sy-static-text-weak)' }}>{c}</span>
          <Tag color={c} size="small">Outlook</Tag>
          <Tag color={c} size="medium">Outlook</Tag>
          <Tag color={c} size="large">Outlook</Tag>
          <Tag color={c} size="medium" onRemove={() => {}}>Removable</Tag>
        </div>
      ))}
    </div>
  ),
};
