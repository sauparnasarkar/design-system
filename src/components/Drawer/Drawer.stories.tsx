import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // While closed, aria-hidden + inert correctly remove it from the accessibility
    // tree entirely — getByRole('dialog') would not find it, by design.
    await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();

    const trigger = canvas.getByRole('button', { name: 'Open drawer' });
    await userEvent.click(trigger);

    const dialog = await canvas.findByRole('dialog');
    await expect(dialog).toHaveAccessibleName('Notifications');

    const closeButton = canvas.getByRole('button', { name: 'Close' });
    await waitFor(() => expect(closeButton).toHaveFocus());

    // Tab wraps from the last focusable element (footer button) back to the first.
    const footerButton = canvas.getByRole('button', { name: 'Mark all as read' });
    await userEvent.tab({ shift: true });
    await expect(footerButton).toHaveFocus();
    await userEvent.tab();
    await expect(closeButton).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
