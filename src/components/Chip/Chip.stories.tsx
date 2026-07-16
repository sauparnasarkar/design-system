import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Chip } from './Chip';

const meta: Meta<typeof Chip> = {
  title: 'Components/Chip',
  component: Chip,
  args: {
    children: 'Corporates',
    active: false,
    grey: false,
    disabled: false,
  },
};
export default meta;
type Story = StoryObj<typeof Chip>;

export const Playground: Story = {};

export const FilterBar: Story = {
  render: () => {
    const [selected, setSelected] = React.useState<Set<string>>(new Set(['Outlook']));
    const filters = ['Outlook', 'Rating Action', 'Special Report', 'Criteria', 'Data Comparator'];
    return (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {filters.map((f) => (
          <Chip
            key={f}
            active={selected.has(f)}
            onClick={() =>
              setSelected((prev) => {
                const next = new Set(prev);
                if (next.has(f)) next.delete(f);
                else next.add(f);
                return next;
              })
            }
          >
            {f}
          </Chip>
        ))}
        <Chip grey onRemove={() => {}}>Removable</Chip>
        <Chip disabled>Disabled</Chip>
      </div>
    );
  },
};
