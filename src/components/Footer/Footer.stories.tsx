import type { Meta, StoryObj } from '@storybook/react-vite';
import { Footer } from './Footer';

const meta: Meta<typeof Footer> = {
  title: 'Shell/Footer',
  component: Footer,
  parameters: { layout: 'fullscreen' },
  // copyright has no built-in default (white-label: this is consumer branding) —
  // passed explicitly here with Syena's own text, like any other consumer would.
  args: {
    copyright: 'Copyright 2026 Syena Systems.',
  },
};
export default meta;
type Story = StoryObj<typeof Footer>;

export const Playground: Story = {};
