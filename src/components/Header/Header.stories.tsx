import type { Meta, StoryObj } from '@storybook/react-vite';
import { Header } from './Header';
import { Logo } from '../Logo/Logo';

const meta: Meta<typeof Header> = {
  title: 'Shell/Header',
  component: Header,
  parameters: { layout: 'fullscreen' },
  args: {
    logo: <Logo product="green" />,
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
    logo: <Logo product="default" />,
    searchPlaceholder: 'Search Research, Entities, Issues, and Sectors',
  },
};
