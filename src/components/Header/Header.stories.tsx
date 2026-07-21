import type { Meta, StoryObj } from '@storybook/react-vite';
import { Header } from './Header';
import { Logo } from '../Logo/Logo';
import syenaMark from '../../assets/logos/syena-mark.png';

const meta: Meta<typeof Header> = {
  title: 'Shell/Header',
  component: Header,
  parameters: { layout: 'fullscreen' },
  args: {
    logo: <Logo markSrc={syenaMark} wordmark="Syena" accent="Green" accentColor="var(--__s9cmpx-color-teal-600, #187272)" />,
    searchPlaceholder: 'Search Entities, Reports and Instruments...',
    showNotifications: true,
    showAppSwitcher: true,
    showUserMenu: true,
  },
};
export default meta;
type Story = StoryObj<typeof Header>;

export const Playground: Story = {};

export const SyenaRatings: Story = {
  args: {
    logo: <Logo markSrc={syenaMark} wordmark="Syena" />,
    searchPlaceholder: 'Search Research, Entities, Issues, and Sectors',
  },
};
