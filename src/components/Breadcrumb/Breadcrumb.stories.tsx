import type { Meta, StoryObj } from '@storybook/react-vite';
import { Breadcrumb } from './Breadcrumb';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  args: {
    items: [
      { label: 'Home', href: '#' },
      { label: 'Entities', href: '#' },
      { label: 'A.P. Moller - Maersk A/S' },
    ],
  },
};
export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const Playground: Story = {};
