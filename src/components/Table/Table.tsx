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
    <table
      className={cx(
        'sy-simple-table',
        size === 'small' && 'sy-simple-table--small',
        size === 'large' && 'sy-simple-table--large',
        striped === 'even' && 'sy-simple-table--striped-even',
        striped === 'odd' && 'sy-simple-table--striped-odd',
        rowBorders && 'sy-simple-table--row-borders',
        columnBorders && 'sy-simple-table--column-borders',
        withBorder && 'sy-simple-table--has-border',
        className,
      )}
      style={{ borderCollapse: 'collapse', width: '100%' }}
    >
      {caption && <caption className="sy-simple-table__caption sy-label3">{caption}</caption>}
      <thead>
        <tr className="sy-simple-table-row sy-simple-table-row--header">
          {columns.map((c) => (
            <th
              key={c.key}
              className={cx('sy-simple-table-cell', 'sy-simple-table-cell--header', c.align && `sy-simple-table-cell--${c.align}`, 'sy-label2')}
              style={{ padding: '8px 12px', textAlign: c.align ?? 'left' }}
              aria-sort={sort.key === c.key && sort.dir ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
            >
              {c.sortable ? (
                <button
                  type="button"
                  className="sy-table-header"
                  onClick={() => toggleSort(c.key)}
                  style={{ display: 'inline-flex', alignItems: 'center', background: 'none', border: 0, cursor: 'pointer', font: 'inherit', color: 'inherit', padding: 0 }}
                >
                  {c.header}
                  <span className="sy-table-header__sort-wrapper">
                    <span className={cx('sy-table-header__icon', (sort.key !== c.key || !sort.dir) && 'sy-table-header__icon--none')}>
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
          <tr key={ri} className="sy-simple-table-row">
            {columns.map((c) => (
              <td
                key={c.key}
                className={cx('sy-simple-table-cell', c.align && `sy-simple-table-cell--${c.align}`, 'sy-body3-short')}
                style={{ padding: '8px 12px', textAlign: c.align ?? 'left' }}
              >
                {c.render ? c.render(row) : (row[c.key] as React.ReactNode)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
