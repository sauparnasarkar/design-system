import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('combobox');
    await userEvent.click(control);
    await userEvent.keyboard('{ArrowDown}{Enter}');

    // Enter toggles the highlighted option into the selection but — unlike Select —
    // must NOT close the menu, since MultiSelect supports picking several in a row.
    await expect(canvas.getByRole('listbox')).toBeInTheDocument();
    await expect(canvas.getByRole('option', { name: 'Sovereigns' })).toHaveAttribute('aria-selected', 'true');

    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByRole('listbox')).not.toBeInTheDocument();
  },
};

export const Preselected: Story = {
  args: { value: ['corporates', 'sovereigns'] },
  render: (args) => (
    <div style={{ minHeight: 360 }}>
      <MultiSelect {...args} />
    </div>
  ),
};
