import type { Meta, StoryObj } from '@storybook/react-vite';
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
