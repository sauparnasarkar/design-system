import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
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

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    // Regression guard for the white-label rename (design-system#1): DataTable's
    // className and the AG Grid theme's CSS selector must stay in lockstep, or the
    // grid silently loses all AG Grid theming.
    const agThemeEl = canvasElement.querySelector('.ag-theme-s9cmpx');
    await expect(agThemeEl).not.toBeNull();
    await expect(canvasElement.querySelector('.__s9cmpx-table')).not.toBeNull();
  },
};

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
      { field: 'rating', headerName: 'Rating', maxWidth: 120, headerClass: '__s9cmpx-header-cell--highlight', cellClass: '__s9cmpx-table-highlight-cell' },
      { field: 'outlook', headerName: 'Outlook', maxWidth: 130 },
    ],
  },
};

export const ScrollHint: Story = {
  // Reported live: AG Grid's own horizontal scrollbar is unreliable/undiscoverable on macOS
  // (its hover-to-reveal listener is bound to the exact element visibility:hidden excludes
  // from hit-testing, confirmed live), so this button is DataTable's actual, guaranteed way to
  // scroll on a mouse-only desktop -- not just a discoverability hint. 14 wide columns force
  // horizontal overflow regardless of viewport width to exercise it.
  args: {
    columns: Array.from({ length: 14 }, (_, i) => ({
      colId: `col-${i}`,
      headerName: `Column ${i + 1}`,
      minWidth: 220,
      valueGetter: () => ROWS[0].entity,
    })),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = await waitFor(() => canvas.getByRole('button', { name: /scroll table right/i }));
    const scrollEl = canvasElement.querySelector<HTMLElement>('.ag-body-horizontal-scroll-viewport')!;
    expect(scrollEl.scrollLeft).toBe(0);

    await userEvent.click(button);
    await waitFor(() => expect(scrollEl.scrollLeft).toBeGreaterThan(0));

    // Simulate having reached the end (however the user got there -- click, trackpad,
    // keyboard) -- the button should disappear once there's nothing left to scroll, unlike the
    // old one-time hint that vanished after the very first scroll movement regardless of how
    // much content remained.
    scrollEl.scrollLeft = scrollEl.scrollWidth;
    scrollEl.dispatchEvent(new Event('scroll'));
    await waitFor(() => expect(canvas.queryByRole('button', { name: /scroll table right/i })).toBeNull());
  },
};

// Mimics DataExplorerPage's own pattern (columns computed via useState/useMemo, changing
// array reference on toggle) to verify the "Scroll for more" button appears when a column is
// added to an already-mounted, not-yet-overflowing grid -- confirmed live to have broken twice
// (once from a stale cached-node ref, once from a MutationObserver that structurally can't see
// a pure box-size change) before landing on the ResizeObserver+MutationObserver combination
// DataTable.tsx now uses. The static-args ScrollHint story above can't catch either failure
// mode, since its columns never change after mount.
function DynamicColumnsHarness() {
  const [wide, setWide] = useState(false);
  const columns = wide
    ? [
        { field: 'entity' as const, headerName: 'Entity', minWidth: 220 },
        { field: 'country' as const, headerName: 'Country', minWidth: 220 },
        { field: 'sector' as const, headerName: 'Sector', minWidth: 220 },
        { field: 'rating' as const, headerName: 'Rating', minWidth: 220 },
        { field: 'outlook' as const, headerName: 'Outlook', minWidth: 220 },
        { field: 'date' as const, headerName: 'Date', minWidth: 220 },
      ]
    : [{ field: 'entity' as const, headerName: 'Entity', minWidth: 220 }];
  return (
    <div style={{ width: 300 }}>
      <button type="button" onClick={() => setWide(true)} style={{ marginBottom: 8 }}>
        Add columns
      </button>
      <DataTable columns={columns} rows={ROWS} height={300} />
    </div>
  );
}

export const DynamicColumns: Story = {
  render: () => <DynamicColumnsHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', { name: /scroll table right/i })).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: /add columns/i }));

    const scrollButton = await waitFor(() => canvas.getByRole('button', { name: /scroll table right/i }));
    const scrollEl = canvasElement.querySelector<HTMLElement>('.ag-body-horizontal-scroll-viewport')!;
    expect(scrollEl.scrollLeft).toBe(0);

    await userEvent.click(scrollButton);
    await waitFor(() => expect(scrollEl.scrollLeft).toBeGreaterThan(0));
  },
};
