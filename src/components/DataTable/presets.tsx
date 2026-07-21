import React from 'react';
import type { ColDef } from 'ag-grid-community';
import { cx } from '../../lib/cx';

export type Sentiment = 'positive' | 'neutral' | 'negative';

/** Map trend labels (Better/Neutral/Worse etc.) to sentiments; extend per column as needed. */
export const DEFAULT_SENTIMENT_MAP: Record<string, Sentiment> = {
  Better: 'positive',
  Neutral: 'neutral',
  Worse: 'negative',
  Positive: 'positive',
  Stable: 'neutral',
  Negative: 'negative',
};

const SENTIMENT_BG: Record<Sentiment, string> = {
  positive: 'var(--__s9cmpx-static-background-sentiment-positive, #ceeee3)',
  neutral: 'var(--__s9cmpx-static-background-sentiment-notice, #fff0d4)',
  negative: 'var(--__s9cmpx-static-background-sentiment-negative, #fadcdf)',
};

export interface TrendCellProps {
  value?: string | null;
  map?: Record<string, Sentiment>;
}

/**
 * Full-cell sentiment fill (Sensitivity Monitor's Leverage/FCF/Capex Trend
 * columns): Better = green, Neutral = yellow, Worse = red.
 */
export function TrendCell({ value, map = DEFAULT_SENTIMENT_MAP }: TrendCellProps) {
  const sentiment = value ? map[value] : undefined;
  return (
    <div
      className="__s9cmpx-table-trend-cell __s9cmpx-body3-short"
      style={{
        background: sentiment ? SENTIMENT_BG[sentiment] : undefined,
        margin: '0 -16px',
        padding: '0 16px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {value ?? '--'}
    </div>
  );
}

/** ColDef preset for a sentiment trend column. */
export function trendColumn<Row>(field: ColDef<Row>['field'], headerName: string, map?: Record<string, Sentiment>): ColDef<Row> {
  return {
    field,
    headerName,
    cellRenderer: (p: { value?: string | null }) => <TrendCell value={p.value} map={map} />,
    cellStyle: { padding: 0, paddingLeft: 16, paddingRight: 16 },
  };
}

export interface HeatCellProps {
  /** 0–1 fraction; null/undefined renders the em-dash placeholder */
  value?: number | null;
  /** d3-ish display: percent with 1 decimal by default */
  format?: (v: number) => string;
}

/**
 * Transition-matrix heat cell (`__s9cmpx-table-highlight-cell` treatment): tinted
 * background + emphasized value when present, "-" placeholder otherwise.
 */
export function HeatCell({ value, format = (v) => `${(v * 100).toFixed(1)}%` }: HeatCellProps) {
  if (value === null || value === undefined) {
    return <span style={{ color: 'var(--__s9cmpx-static-text-weak)' }}>-</span>;
  }
  return (
    <div
      className={cx('__s9cmpx-table-heat-cell', '__s9cmpx-body3-short')}
      style={{
        background: `color-mix(in srgb, var(--__s9cmpx-color-blue-100, #cadefc) ${Math.round(40 + Math.min(value, 1) * 60)}%, transparent)`,
        color: 'var(--__s9cmpx-static-text-sentiment-info, #083a91)',
        margin: '0 -16px',
        padding: '0 16px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        fontWeight: 500,
      }}
    >
      {format(value)}
    </div>
  );
}

/** ColDef preset for a matrix heat column (right-aligned percentages). */
export function heatColumn<Row>(field: ColDef<Row>['field'], headerName: string): ColDef<Row> {
  return {
    field,
    headerName,
    cellRenderer: (p: { value?: number | null }) => <HeatCell value={p.value} />,
    cellStyle: { padding: 0, paddingLeft: 16, paddingRight: 16, textAlign: 'right' },
    minWidth: 84,
    sortable: false,
  };
}

export interface TableToolbarProps {
  /** Left-aligned title block (e.g. "Sensitivity Monitor" + info icon) */
  title?: React.ReactNode;
  /** Toolbar actions — compose from Button (ghost, iconLeft) and DropdownMenu */
  children?: React.ReactNode;
  className?: string;
}

/** Grid toolbar row (Filter / Export / Manage Columns / Select Portfolio…) as used above the data-tool grids. */
export function TableToolbar({ title, children, className }: TableToolbarProps) {
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      {title && <span className="__s9cmpx-headline6" style={{ marginRight: 'auto' }}>{title}</span>}
      {children}
    </div>
  );
}
