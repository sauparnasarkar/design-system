import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { AppSwitcher } from './AppSwitcher';
import syenaMark from '../../assets/logos/syena-mark.png';

const meta: Meta<typeof AppSwitcher> = {
  title: 'Shell/AppSwitcher',
  component: AppSwitcher,
  args: {
    apps: [
      { id: 'default', markSrc: syenaMark, wordmark: 'Syena', name: 'Syena Primary' },
      { id: 'green', markSrc: syenaMark, wordmark: 'Syena', accent: 'Green', accentColor: '#0f5c5c', name: 'Syena Green' },
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
  play: async ({ canvasElement, args }) => {
    // Regression guard for design-system#1: AppSwitcher used to hardcode the old
    // LogoProduct enum into AppSwitcherApp; it must now render each app's own
    // per-app markSrc/wordmark/name via the generic Logo props, not a shared default.
    const tiles = canvasElement.querySelectorAll('.__s9cmpx-app-launcher-tile');
    await expect(tiles).toHaveLength(args.apps!.length);
    for (const app of args.apps!) {
      await expect(canvasElement).toHaveTextContent(app.name);
    }
    const images = canvasElement.querySelectorAll('.__s9cmpx-app-launcher-tile img');
    await expect(images).toHaveLength(args.apps!.length);
  },
};
