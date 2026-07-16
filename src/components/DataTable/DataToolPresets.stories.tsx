import type { Meta, StoryObj } from '@storybook/react-vite';
import { DataTable } from './DataTable';
import { trendColumn, heatColumn, TableToolbar } from './presets';
import { Button } from '../Button/Button';
import { DropdownMenu } from '../DropdownMenu/DropdownMenu';

const meta: Meta = {
  title: 'Components/DataTable/DataToolPresets',
  parameters: { layout: 'padded' },
};
export default meta;

interface SensitivityRow {
  company: string;
  sector: string;
  idr: string;
  metric: string;
  leverageTrend: string;
  fcfTrend: string;
  capexTrend: string;
}

const SENSITIVITY_ROWS: SensitivityRow[] = [
  { company: 'BAE Systems plc', sector: 'Aerospace & Defense', idr: 'A-', metric: 'EBITDA Leverage (x)', leverageTrend: 'Neutral', fcfTrend: 'Better', capexTrend: 'Neutral' },
  { company: 'Dynasty Acquisition Co., Inc.', sector: 'Aerospace & Defense', idr: 'BB+', metric: 'EBITDA Leverage (x)', leverageTrend: 'Better', fcfTrend: 'Better', capexTrend: 'Neutral' },
  { company: 'HEICO Corporation', sector: 'Aerospace & Defense', idr: 'BBB+', metric: 'EBITDA Leverage (x)', leverageTrend: 'Worse', fcfTrend: 'Neutral', capexTrend: 'Neutral' },
  { company: 'Howmet Aerospace Inc.', sector: 'Aerospace & Defense', idr: 'A-', metric: 'EBITDA Leverage (x)', leverageTrend: 'Worse', fcfTrend: 'Neutral', capexTrend: 'Neutral' },
  { company: 'Leonardo S.p.A.', sector: 'Aerospace & Defense', idr: 'BBB', metric: 'EBITDA Leverage (x)', leverageTrend: 'Neutral', fcfTrend: 'Neutral', capexTrend: 'Worse' },
  { company: 'Lockheed Martin Corporation', sector: 'Aerospace & Defense', idr: 'A', metric: 'EBITDA Leverage (x)', leverageTrend: 'Neutral', fcfTrend: 'Worse', capexTrend: 'Worse' },
  { company: 'Northrop Grumman Corporation', sector: 'Aerospace & Defense', idr: 'BBB+', metric: 'EBITDA Leverage (x)', leverageTrend: 'Better', fcfTrend: 'Worse', capexTrend: 'Worse' },
];

/** Sensitivity-Monitor-style grid: toolbar + sentiment trend cells. */
export const SensitivityMonitor: StoryObj = {
  render: () => (
    <div>
      <TableToolbar title="Sensitivity Monitor">
        <Button variant="ghost" size="s" iconLeft="search">Filter</Button>
        <DropdownMenu
          trigger={<Button variant="ghost" size="s" iconLeft="download" iconRight="chevron-down">Export</Button>}
          items={[{ id: 'xlsx', label: 'XLSX' }, { id: 'csv', label: 'CSV' }]}
        />
        <Button variant="ghost" size="s" iconLeft="grid">Manage Columns</Button>
        <Button variant="ghost" size="s" iconLeft="user">Select Portfolio</Button>
      </TableToolbar>
      <DataTable<SensitivityRow>
        height={360}
        striped={false}
        columns={[
          { field: 'company', headerName: 'Company Name', minWidth: 240 },
          { field: 'idr', headerName: 'IDR', maxWidth: 90 },
          { field: 'metric', headerName: 'Leverage Metric', minWidth: 180 },
          trendColumn<SensitivityRow>('leverageTrend', 'Leverage Trend'),
          trendColumn<SensitivityRow>('fcfTrend', 'FCF Trend'),
          trendColumn<SensitivityRow>('capexTrend', 'Capex Trend'),
        ]}
        rows={SENSITIVITY_ROWS}
      />
    </div>
  ),
};

interface MatrixRow {
  count: number;
  from: string;
  [to: string]: number | string | null;
}

const RATINGS = ['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'D'];
const MATRIX_ROWS: MatrixRow[] = RATINGS.map((from, i) => {
  const row: MatrixRow = { count: [14, 106, 197, 260, 194, 60, 13, 1][i], from };
  RATINGS.forEach((to, j) => {
    if (i === j) row[to] = 0.9 + (i % 3) * 0.03;
    else if (Math.abs(i - j) === 1) row[to] = 0.04 - Math.abs(i - j) * 0.005;
    else row[to] = null;
  });
  return row;
});

/** Transition-and-Default-style matrix with heat cells. */
export const TransitionMatrix: StoryObj = {
  render: () => (
    <DataTable<MatrixRow>
      height={380}
      striped={false}
      columns={[
        { field: 'count', headerName: 'No.', maxWidth: 80, sortable: false },
        { field: 'from', headerName: 'From / To', maxWidth: 110, sortable: false, cellStyle: { fontWeight: 600 } },
        ...RATINGS.map((r) => heatColumn<MatrixRow>(r, r)),
      ]}
      rows={MATRIX_ROWS}
    />
  ),
};
