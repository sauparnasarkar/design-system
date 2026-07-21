import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppSwitcher } from './AppSwitcher';
import syenaMark from '../../assets/logos/syena-mark.png';

const meta: Meta<typeof AppSwitcher> = {
  title: 'Shell/AppSwitcher',
  component: AppSwitcher,
  args: {
    apps: [
      { id: 'default', markSrc: syenaMark, wordmark: 'Syena', name: 'Syena Primary' },
      { id: 'green', markSrc: syenaMark, wordmark: 'Syena', accent: 'Green', accentColor: 'var(--__s9cmpx-color-teal-600, #187272)', name: 'Syena Green' },
      { id: 'blue', markSrc: syenaMark, wordmark: 'Syena', accent: 'Blue', accentColor: 'var(--__s9cmpx-color-blue-600, #1c5ece)', name: 'Syena Blue' },
      { id: 'connect', markSrc: syenaMark, wordmark: 'Syena', name: 'Syena Premium', noPermission: true },
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
