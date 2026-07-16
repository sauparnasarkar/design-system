import type { Meta, StoryObj } from '@storybook/react-vite';
import { MultiSelect } from './MultiSelect';

const OPTIONS = [
  { value: 'corporates', label: 'Corporates' },
  { value: 'sovereigns', label: 'Sovereigns' },
  { value: 'fi', label: 'Financial Institutions' },
  { value: 'sf', label: 'Structured Finance' },
  { value: 'usp', label: 'U.S. Public Finance' },
  { value: 'infra', label: 'Infrastructure', disabled: true },
];

const meta: Meta<typeof MultiSelect> = {
  title: 'Components/MultiSelect',
  component: MultiSelect,
  argTypes: {
    size: { control: 'select', options: ['small', 'medium', 'large'] },
  },
  args: {
    options: OPTIONS,
    placeholder: 'Filter by sector',
    label: 'Sectors',
    size: 'medium',
    error: false,
    disabled: false,
  },
};
export default meta;
type Story = StoryObj<typeof MultiSelect>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ minHeight: 360 }}>
      <MultiSelect {...args} />
    </div>
  ),
};

export const Preselected: Story = {
  args: { value: ['corporates', 'sovereigns'] },
  render: (args) => (
    <div style={{ minHeight: 360 }}>
      <MultiSelect {...args} />
    </div>
  ),
};
