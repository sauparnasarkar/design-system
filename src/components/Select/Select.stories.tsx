import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from './Select';

const OPTIONS = [
  { value: 'all', label: 'All Sectors' },
  { value: 'corporates', label: 'Corporates' },
  { value: 'sovereigns', label: 'Sovereigns' },
  { value: 'fi', label: 'Financial Institutions' },
  { value: 'sf', label: 'Structured Finance', disabled: true },
];

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  argTypes: {
    size: { control: 'select', options: ['small', 'medium', 'large'] },
  },
  args: {
    options: OPTIONS,
    placeholder: 'Select sector',
    size: 'medium',
    borderless: false,
    error: false,
    disabled: false,
    label: 'Sector',
  },
};
export default meta;
type Story = StoryObj<typeof Select>;

export const Playground: Story = {};
