import React from 'react';
import { cx } from '../../lib/cx';
import { Icon } from '../Icon/Icon';

export type TableSize = 'small' | 'default' | 'large';
export type TableStripe = 'none' | 'even' | 'odd';
export type SortDirection = 'asc' | 'desc' | null;

export interface TableColumn<Row> {
  key: string;
  header: React.ReactNode;
  render?: (row: Row) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  /** Wrap cell content across lines instead of the default single-line
   * ellipsis truncation — for columns whose value is genuinely important to
   * read in full (a URL, a long description), not just a label. */
  wrap?: boolean;
}

export interface TableProps<Row> {
  columns: TableColumn<Row>[];
  rows: Row[];
  size?: TableSize;
  striped?: TableStripe;
  rowBorders?: boolean;
  columnBorders?: boolean;
  withBorder?: boolean;
  caption?: React.ReactNode;
  className?: string;
}

export function Table<Row extends Record<string, unknown>>({
  columns,
  rows,
  size = 'default',
  striped = 'none',
  rowBorders = true,
  columnBorders = false,
  withBorder = false,
  caption,
  className,
}: TableProps<Row>) {
  const [sort, setSort] = React.useState<{ key: string; dir: SortDirection }>({ key: '', dir: null });

  const sorted = React.useMemo(() => {
    if (!sort.key || !sort.dir) return rows;
    return [...rows].sort((a, b) => {
      const av = a[sort.key], bv = b[sort.key];
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  }, [rows, sort]);

  const toggleSort = (key: string) =>
    setSort((s) => ({
      key,
      dir: s.key !== key ? 'asc' : s.dir === 'asc' ? 'desc' : s.dir === 'desc' ? null : 'asc',
    }));

  return (
    // overflow-x:auto as a last-resort safety net — the primary fix is
    // overflow-wrap on the cells below, so unbroken long strings (URLs, IDs)
    // wrap within their own cell instead of forcing this table, and the page
    // body around it, wider than the viewport.
    <div style={{ overflowX: 'auto' }}>
    <table
      className={cx(
        '__s9cmpx-simple-table',
        size === 'small' && '__s9cmpx-simple-table--small',
        size === 'large' && '__s9cmpx-simple-table--large',
        striped === 'even' && '__s9cmpx-simple-table--striped-even',
        striped === 'odd' && '__s9cmpx-simple-table--striped-odd',
        rowBorders && '__s9cmpx-simple-table--row-borders',
        columnBorders && '__s9cmpx-simple-table--column-borders',
        withBorder && '__s9cmpx-simple-table--has-border',
        className,
      )}
      // table-layout: fixed is what actually makes overflow-wrap effective —
      // without it, the browser's automatic table layout sizes each column to
      // its content's *unwrapped* width first, so a long unbroken string (a
      // URL, an ID) still grows the column/table past its container no matter
      // what wrapping rules the cells themselves have.
      style={{ borderCollapse: 'collapse', width: '100%', tableLayout: 'fixed' }}
    >
      {caption && <caption className="__s9cmpx-simple-table__caption __s9cmpx-label3">{caption}</caption>}
      <thead>
        <tr className="__s9cmpx-simple-table-row __s9cmpx-simple-table-row--header">
          {columns.map((c) => (
            <th
              key={c.key}
              className={cx('__s9cmpx-simple-table-cell', '__s9cmpx-simple-table-cell--header', c.align && `__s9cmpx-simple-table-cell--${c.align}`, '__s9cmpx-label2')}
              style={{ padding: '8px 12px', textAlign: c.align ?? 'left', overflowWrap: 'anywhere' }}
              aria-sort={sort.key === c.key && sort.dir ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
            >
              {c.sortable ? (
                <button
                  type="button"
                  className="__s9cmpx-table-header"
                  onClick={() => toggleSort(c.key)}
                  style={{ display: 'inline-flex', alignItems: 'center', background: 'none', border: 0, cursor: 'pointer', font: 'inherit', color: 'inherit', padding: 0 }}
                >
                  {c.header}
                  <span className="__s9cmpx-table-header__sort-wrapper">
                    <span className={cx('__s9cmpx-table-header__icon', (sort.key !== c.key || !sort.dir) && '__s9cmpx-table-header__icon--none')}>
                      <Icon name={sort.key === c.key && sort.dir === 'desc' ? 'chevron-down' : 'chevron-up'} size={14} />
                    </span>
                  </span>
                </button>
              ) : (
                c.header
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sorted.map((row, ri) => (
          <tr key={ri} className="__s9cmpx-simple-table-row">
            {columns.map((c) => (
              <td
                key={c.key}
                className={cx('__s9cmpx-simple-table-cell', c.align && `__s9cmpx-simple-table-cell--${c.align}`, c.wrap && '__s9cmpx-simple-table-cell--wrap-text', '__s9cmpx-body3-short')}
                style={{ padding: '8px 12px', textAlign: c.align ?? 'left', overflowWrap: 'anywhere' }}
              >
                {c.render ? c.render(row) : (row[c.key] as React.ReactNode)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}
