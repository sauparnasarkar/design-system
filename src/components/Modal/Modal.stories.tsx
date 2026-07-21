import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Modal } from './Modal';
import { Button } from '../Button/Button';

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  parameters: { layout: 'fullscreen' },
  args: {
    title: 'Download Report',
    small: false,
    overlayTop: false,
  },
};
export default meta;
type Story = StoryObj<typeof Modal>;

function ModalDemo(args: React.ComponentProps<typeof Modal>) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ padding: 24, minHeight: 320 }}>
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal
        {...args}
        open={open}
        onClose={() => setOpen(false)}
        actions={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button iconLeft="download" onClick={() => setOpen(false)}>Download</Button>
          </>
        }
      >
        You are about to download <strong>Global Credit Outlook 2026 - Mid-Year Update</strong> (PDF,
        2.4 MB). The report will open in a new tab.
      </Modal>
    </div>
  );
}

export const Playground: Story = {
  render: (args) => <ModalDemo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open modal' });
    await userEvent.click(trigger);

    const dialog = await canvas.findByRole('dialog');
    await expect(dialog).toHaveAccessibleName('Download Report');

    // Focus trap: focus moves into the dialog on open (its first focusable
    // descendant, the close button) rather than staying on the trigger.
    const closeButton = canvas.getByRole('button', { name: 'Close' });
    await waitFor(() => expect(closeButton).toHaveFocus());

    // Shift+Tab from the first focusable element wraps to the last.
    const downloadButton = canvas.getByRole('button', { name: 'Download' });
    await userEvent.tab({ shift: true });
    await expect(downloadButton).toHaveFocus();

    // Tab from the last wraps back to the first.
    await userEvent.tab();
    await expect(closeButton).toHaveFocus();

    // Escape closes it and restores focus to the element that opened it.
    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const Small: Story = {
  args: { small: true, title: 'Remove filter?' },
  render: (args) => <ModalDemo {...args} />,
};
