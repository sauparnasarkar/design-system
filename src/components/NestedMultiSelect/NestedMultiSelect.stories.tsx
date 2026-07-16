import type { Meta, StoryObj } from '@storybook/react-vite';
import { NestedMultiSelect } from './NestedMultiSelect';

const GROUPS = [
  {
    value: 'emea',
    label: 'EMEA',
    children: [
      { value: 'uk', label: 'United Kingdom' },
      { value: 'de', label: 'Germany' },
      { value: 'fr', label: 'France' },
      { value: 'sa', label: 'Saudi Arabia' },
    ],
  },
  {
    value: 'apac',
    label: 'APAC',
    children: [
      { value: 'cn', label: 'China (Mainland)' },
      { value: 'jp', label: 'Japan' },
      { value: 'vn', label: 'Vietnam' },
    ],
  },
  {
    value: 'americas',
    label: 'Americas',
    children: [
      { value: 'us', label: 'United States' },
      { value: 'br', label: 'Brazil' },
      { value: 'mx', label: 'Mexico', disabled: true },
    ],
  },
];

const meta: Meta<typeof NestedMultiSelect> = {
  title: 'Components/NestedMultiSelect',
  component: NestedMultiSelect,
  argTypes: {
    size: { control: 'select', options: ['small', 'medium', 'large'] },
  },
  args: {
    groups: GROUPS,
    label: 'Geography',
    placeholder: 'Filter by geography',
    size: 'medium',
    error: false,
    disabled: false,
  },
};
export default meta;
type Story = StoryObj<typeof NestedMultiSelect>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ minHeight: 440 }}>
      <NestedMultiSelect {...args} />
    </div>
  ),
};
