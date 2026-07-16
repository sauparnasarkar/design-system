import type { Meta, StoryObj } from '@storybook/react-vite';
import { DataTable } from './DataTable';
import { Tag } from '../Tag/Tag';

interface EntityRow {
  entity: string;
  country: string;
  sector: string;
  rating: string;
  outlook: string;
  date: string;
}

const ROWS: EntityRow[] = [
  { entity: 'A.P. Moller - Maersk A/S', country: 'Denmark', sector: 'Corporates', rating: 'BBB+', outlook: 'Stable', date: '2026-06-04' },
  { entity: 'A2A S.p.A.', country: 'Italy', sector: 'Utilities', rating: 'BBB', outlook: 'Stable', date: '2026-06-26' },
  { entity: 'AB "Ignitis Grupe"', country: 'Lithuania', sector: 'Utilities', rating: 'BBB+', outlook: 'Stable', date: '2026-06-08' },
  { entity: 'AB SKF', country: 'Sweden', sector: 'Corporates', rating: 'BBB+', outlook: 'Negative', date: '2026-04-17' },
  { entity: 'ABANCA Corporacion Bancaria', country: 'Spain', sector: 'Banks', rating: 'BBB-', outlook: 'Positive', date: '2026-06-19' },
  { entity: 'Accor SA', country: 'France', sector: 'Corporates', rating: 'BBB-', outlook: 'Stable', date: '2026-05-11' },
  { entity: 'Achmea B.V.', country: 'Netherlands', sector: 'Insurance', rating: 'A', outlook: 'Stable', date: '2026-03-02' },
  { entity: 'Adevinta ASA', country: 'Norway', sector: 'Corporates', rating: 'B+', outlook: 'Stable', date: '2026-02-14' },
  { entity: 'Aegon Ltd.', country: 'Bermuda', sector: 'Insurance', rating: 'A-', outlook: 'Stable', date: '2026-06-30' },
  { entity: 'Aeroporti di Roma SpA', country: 'Italy', sector: 'Infrastructure', rating: 'BBB', outlook: 'Stable', date: '2026-01-22' },
];

const meta: Meta<typeof DataTable<EntityRow>> = {
  title: 'Components/DataTable',
  component: DataTable,
  parameters: { layout: 'padded' },
  args: {
    height: 400,
    striped: true,
    floatingFilters: false,
    rows: ROWS,
    columns: [
      { field: 'entity', headerName: 'Entity', minWidth: 240 },
      { field: 'country', headerName: 'Country' },
      { field: 'sector', headerName: 'Sector' },
      { field: 'rating', headerName: 'Rating', maxWidth: 120 },
      { field: 'outlook', headerName: 'Outlook', maxWidth: 130 },
      { field: 'date', headerName: 'Last Action', sort: 'desc' },
    ],
  },
};
export default meta;
type Story = StoryObj<typeof DataTable<EntityRow>>;

export const Playground: Story = {};

export const WithFloatingFilters: Story = {
  args: { floatingFilters: true, height: 460 },
};

export const CustomCells: Story = {
  args: {
    columns: [
      { field: 'entity', headerName: 'Entity', minWidth: 240 },
      {
        field: 'sector',
        headerName: 'Sector',
        cellRenderer: (p: { value: string }) => <Tag size="small">{p.value}</Tag>,
      },
      { field: 'rating', headerName: 'Rating', maxWidth: 120, headerClass: 'sy-header-cell--highlight', cellClass: 'sy-table-highlight-cell' },
      { field: 'outlook', headerName: 'Outlook', maxWidth: 130 },
    ],
  },
};
