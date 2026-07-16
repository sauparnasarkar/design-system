import type { Meta, StoryObj } from '@storybook/react-vite';
import { Table } from './Table';
import { Tag } from '../Tag/Tag';
import { Link } from '../Link/Link';

const ROWS = [
  { entity: 'A.P. Moller - Maersk A/S', country: 'Denmark', sector: 'Corporates', rating: 'BBB+', date: '04 Jun 2026' },
  { entity: 'A2A S.p.A.', country: 'Italy', sector: 'Utilities', rating: 'BBB', date: '26 Jun 2026' },
  { entity: 'AB "Ignitis Grupe"', country: 'Lithuania', sector: 'Utilities', rating: 'BBB+', date: '08 Jun 2026' },
  { entity: 'AB SKF', country: 'Sweden', sector: 'Corporates', rating: 'BBB+', date: '17 Apr 2026' },
  { entity: 'ABANCA Corporacion Bancaria', country: 'Spain', sector: 'Banks', rating: 'BBB-', date: '19 Jun 2026' },
];

const meta: Meta<typeof Table> = {
  title: 'Components/Table',
  component: Table,
  argTypes: {
    size: { control: 'select', options: ['small', 'default', 'large'] },
    striped: { control: 'select', options: ['none', 'even', 'odd'] },
  },
  args: {
    size: 'default',
    striped: 'none',
    rowBorders: true,
    columnBorders: false,
    withBorder: false,
    columns: [
      { key: 'entity', header: 'Entity', sortable: true },
      { key: 'country', header: 'Country', sortable: true },
      { key: 'sector', header: 'Sector' },
      { key: 'rating', header: 'Rating', align: 'center' },
      { key: 'date', header: 'Last Action', align: 'right', sortable: true },
    ],
    rows: ROWS,
  },
};
export default meta;
type Story = StoryObj<typeof Table>;

export const Playground: Story = {};

export const ResearchList: Story = {
  args: {
    striped: 'even',
    columns: [
      {
        key: 'entity',
        header: 'Report',
        sortable: true,
        render: (r) => <Link href="#" variant="default" size={2}>{String(r.entity)}</Link>,
      },
      { key: 'sector', header: 'Sector', render: (r) => <Tag size="small">{String(r.sector)}</Tag> },
      { key: 'date', header: 'Published', align: 'right', sortable: true },
    ],
  },
};
