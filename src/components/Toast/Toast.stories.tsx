import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toast } from './Toast';
import { Button } from '../Button/Button';

const meta: Meta<typeof Toast> = {
  title: 'Components/Toast',
  component: Toast,
  argTypes: {
    variant: { control: 'select', options: ['default', 'success', 'warning', 'error'] },
  },
  args: {
    children: 'Report added to your portfolio.',
    variant: 'success',
    long: false,
    withoutCloseIcon: false,
  },
};
export default meta;
type Story = StoryObj<typeof Toast>;

export const Playground: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Toast variant="default">Your export is being prepared.</Toast>
      <Toast variant="success">Report added to your portfolio.</Toast>
      <Toast variant="warning">Your session expires in 5 minutes.</Toast>
      <Toast variant="error">Download failed. Please try again.</Toast>
    </div>
  ),
};

export const LongWithActions: Story = {
  args: {
    long: true,
    variant: 'default',
    children:
      'The entity "A.P. Moller - Maersk A/S" was removed from your watchlist. You can undo this action within the next 30 seconds.',
  },
  render: (args) => (
    <Toast {...args} actions={<Button variant="ghost-blue" size="s">Undo</Button>} />
  ),
};
