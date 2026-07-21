import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { TableFilter } from './TableFilter';

const meta: Meta<typeof TableFilter> = {
  title: 'Components/TableFilter',
  component: TableFilter,
  args: {
    label: 'Sector',
    suppressSearch: false,
    options: [
      { value: 'corporates', label: 'Corporates' },
      { value: 'sovereigns', label: 'Sovereigns' },
      { value: 'banks', label: 'Banks' },
      { value: 'insurance', label: 'Insurance' },
      { value: 'utilities', label: 'Utilities' },
      { value: 'infrastructure', label: 'Infrastructure' },
    ],
  },
};
export default meta;
type Story = StoryObj<typeof TableFilter>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ minHeight: 380 }}>
      <TableFilter {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Sector' });
    await userEvent.click(trigger);

    // Opening auto-focuses the search input, so a keyboard user can start typing
    // immediately without an extra Tab.
    const search = canvas.getByPlaceholderText('Search…');
    await waitFor(() => expect(search).toHaveFocus());

    await userEvent.type(search, 'ban');
    await expect(canvas.getByRole('option', { name: 'Banks' })).toBeInTheDocument();
    await expect(canvas.queryByRole('option', { name: 'Corporates' })).not.toBeInTheDocument();

    // Arrow-key nav + Enter toggles the (only, now-filtered) option — previously
    // impossible entirely from the keyboard (no keydown handling existed at all).
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(canvas.getByRole('option', { name: 'Banks' })).toHaveAttribute('aria-selected', 'true');

    await userEvent.click(canvas.getByRole('button', { name: 'Apply' }));
    await expect(canvas.getByRole('button', { name: 'Sector: 1 selected' })).toBeInTheDocument();
  },
};

export const FilterRow: Story = {
  render: (args) => (
    <div style={{ minHeight: 380, display: 'flex', gap: 8 }}>
      <TableFilter {...args} label="Sector" />
      <TableFilter
        {...args}
        label="Rating"
        suppressSearch
        options={['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC'].map((r) => ({ value: r, label: r }))}
      />
      <TableFilter
        {...args}
        label="Outlook"
        suppressSearch
        options={['Stable', 'Positive', 'Negative', 'Watch'].map((r) => ({ value: r, label: r }))}
      />
    </div>
  ),
};
