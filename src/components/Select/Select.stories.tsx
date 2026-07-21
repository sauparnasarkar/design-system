import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
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

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('combobox', { name: 'Sector' });
    await userEvent.click(control);
    const listbox = canvas.getByRole('listbox');
    await expect(listbox).toBeInTheDocument();

    // ArrowDown twice from the first option should land on "Sovereigns" (3rd item),
    // skipping nothing since none of the first three are disabled.
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await expect(control).toHaveAttribute('aria-activedescendant', canvas.getByRole('option', { name: 'Sovereigns' }).id);

    await userEvent.keyboard('{Enter}');
    await expect(control).toHaveTextContent('Sovereigns');
    await expect(canvas.queryByRole('listbox')).not.toBeInTheDocument();
  },
};

export const KeyboardSkipsDisabledOption: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('combobox', { name: 'Sector' });
    await userEvent.click(control);
    // Move to the last option (disabled "Structured Finance") then one more —
    // ArrowDown must wrap around and skip it, landing back on "All Sectors".
    await userEvent.keyboard('{ArrowUp}{ArrowDown}');
    const allSectors = canvas.getByRole('option', { name: 'All Sectors' });
    await expect(control).toHaveAttribute('aria-activedescendant', allSectors.id);
  },
};
