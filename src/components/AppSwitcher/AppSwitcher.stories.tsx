import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppSwitcher } from './AppSwitcher';

const meta: Meta<typeof AppSwitcher> = {
  title: 'Shell/AppSwitcher',
  component: AppSwitcher,
  args: {
    apps: [
      { id: 'default', product: 'default', name: 'Syena Primary' },
      { id: 'green', product: 'green', name: 'Syena Green' },
      { id: 'blue', product: 'blue', name: 'Syena Blue' },
      { id: 'connect', product: 'default', name: 'Syena Premium', noPermission: true },
    ],
    message: 'You do not have access to Apps shown in gray. Contact Syena Systems for access.',
    tileSize: 'default',
  },
};
export default meta;
type Story = StoryObj<typeof AppSwitcher>;

export const Playground: Story = {
  render: (args) => <AppSwitcher {...args} onClose={() => {}} />,
};
