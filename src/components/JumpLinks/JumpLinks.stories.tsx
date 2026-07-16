import type { Meta, StoryObj } from '@storybook/react-vite';
import { JumpLinks } from './JumpLinks';

const ITEMS = [
  { id: 'overview', label: 'Overview', href: '#overview' },
  { id: 'ratings', label: 'Ratings', href: '#ratings' },
  { id: 'research', label: 'Research', href: '#research' },
  { id: 'esg', label: 'ESG Scores', href: '#esg' },
  { id: 'instruments', label: 'Instruments', href: '#instruments' },
];

const meta: Meta<typeof JumpLinks> = {
  title: 'Components/JumpLinks',
  component: JumpLinks,
  args: { items: ITEMS, vertical: false },
};
export default meta;
type Story = StoryObj<typeof JumpLinks>;

export const Playground: Story = {};

export const Vertical: Story = {
  args: { vertical: true },
};
