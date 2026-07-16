import type { Meta, StoryObj } from '@storybook/react-vite';
import { Footer } from './Footer';

const meta: Meta<typeof Footer> = {
  title: 'Shell/Footer',
  component: Footer,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof Footer>;

export const Playground: Story = {};
