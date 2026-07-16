import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
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
};

export const Small: Story = {
  args: { small: true, title: 'Remove filter?' },
  render: (args) => <ModalDemo {...args} />,
};
