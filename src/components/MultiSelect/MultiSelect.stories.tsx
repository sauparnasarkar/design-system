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

export const SearchFiltersOptions: Story = {
  render: (args) => (
    <div style={{ minHeight: 360 }}>
      <MultiSelect {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('combobox', { name: 'Sectors' }));

    // Typing a multi-word query (including a literal space) must filter the list down to
    // just the matching option(s), NOT toggle a selection — Space is a normal character in
    // the search box, unlike in the closed-control/suppressSearch keyboard path.
    const search = canvas.getByRole('combobox', { name: 'Search Sectors' });
    await expect(search).toHaveFocus();
    await userEvent.type(search, 'Public Finance');

    await expect(canvas.getByRole('option', { name: 'U.S. Public Finance' })).toBeInTheDocument();
    await expect(canvas.queryByRole('option', { name: 'Corporates' })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('option', { name: 'Structured Finance' })).not.toBeInTheDocument();

    // Selecting still works against the filtered list.
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('option', { name: 'U.S. Public Finance' })).toHaveAttribute('aria-selected', 'true');
  },
};

export const SearchNoMatches: Story = {
  render: (args) => (
    <div style={{ minHeight: 360 }}>
      <MultiSelect {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('combobox', { name: 'Sectors' }));
    await userEvent.type(canvas.getByRole('combobox', { name: 'Search Sectors' }), 'zzz-no-such-sector');

    // "No matches" is itself a (disabled, unselectable) role="option" placeholder row —
    // real countries/sectors are gone, only that placeholder remains.
    const noMatches = canvas.getByRole('option', { name: 'No matches' });
    await expect(noMatches).toHaveAttribute('aria-disabled', 'true');
    await expect(canvas.getAllByRole('option')).toHaveLength(1);
  },
};

export const SearchSuppressed: Story = {
  args: { suppressSearch: true },
  render: (args) => (
    <div style={{ minHeight: 360 }}>
      <MultiSelect {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('combobox', { name: 'Sectors' });
    await userEvent.click(control);

    await expect(canvas.queryByPlaceholderText('Search…')).not.toBeInTheDocument();

    // With no search box to move focus to, the control itself must still drive selection,
    // including the original Space-to-toggle keyboard shortcut.
    await expect(control).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}{ }');
    await expect(canvas.getByRole('option', { name: 'Sovereigns' })).toHaveAttribute('aria-selected', 'true');
  },
};
