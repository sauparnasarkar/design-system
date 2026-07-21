import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Drawer } from './Drawer';
import { Button } from '../Button/Button';
import { Tag } from '../Tag/Tag';

const meta: Meta<typeof Drawer> = {
  title: 'Components/Drawer',
  component: Drawer,
  parameters: { layout: 'fullscreen' },
  args: {
    title: 'Notifications',
    width: 550,
  },
};
export default meta;
type Story = StoryObj<typeof Drawer>;

function DrawerDemo(args: React.ComponentProps<typeof Drawer>) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ padding: 24, minHeight: 480 }}>
      <Button onClick={() => setOpen(true)}>Open drawer</Button>
      <Drawer
        {...args}
        open={open}
        onClose={() => setOpen(false)}
        subheader={<span className="__s9cmpx-label3" style={{ color: 'var(--__s9cmpx-static-text-weak)' }}>3 unread</span>}
        footer={<Button variant="secondary" fullWidth onClick={() => setOpen(false)}>Mark all as read</Button>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            ['Syena Affirms Generali China’s IFS at ‘A-’; Outlook Stable', 'Affirmation'],
            ['Global Economic Outlook - June 2026', 'Special Report'],
            ['Bank Rating Criteria', 'Criteria'],
          ].map(([t, tag]) => (
            <div key={t} style={{ borderBottom: '1px solid rgba(31,31,31,0.08)', paddingBottom: 12 }}>
              <div className="__s9cmpx-body3-short" style={{ marginBottom: 6 }}>{t}</div>
              <Tag size="small">{tag}</Tag>
            </div>
          ))}
        </div>
      </Drawer>
    </div>
  );
}

export const Playground: Story = {
  render: (args) => <DrawerDemo {...args} />,
};
