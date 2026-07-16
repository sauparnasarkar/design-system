import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchInput } from './SearchInput';

const meta: Meta<typeof SearchInput> = {
  title: 'Components/SearchInput',
  component: SearchInput,
  argTypes: {
    variant: { control: 'select', options: ['classic', 'full'] },
  },
  args: {
    placeholder: 'Search Entities, Reports and Instruments...',
    variant: 'classic',
  },
};
export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Playground: Story = {};
