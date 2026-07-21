import React from 'react';
import { Card, CardHeader } from '../Card/Card';
import { Icon } from '../Icon/Icon';

export interface ChartCardProps {
  title: React.ReactNode;
  /** Header controls (Selects, SegmentedControl, …); a download button is added automatically */
  actions?: React.ReactNode;
  onDownload?: () => void;
  /** "Data as of …" caption under the chart */
  asOf?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/** Chart panel chrome as used on the sector pages: Card header with controls + download, chart body, "Data as of" caption. */
export function ChartCard({ title, actions, onDownload, asOf, children, className }: ChartCardProps) {
  return (
    <Card
      className={className}
      withBorder
      header={
        <CardHeader
          title={title}
          actions={
            <>
              {actions}
              {onDownload && (
                <button
                  type="button"
                  className="__s9cmpx-button __s9cmpx-button--ghost __s9cmpx-button--s __s9cmpx-button--icon-only"
                  aria-label="Download chart data"
                  onClick={onDownload}
                >
                  <Icon name="download" size={16} />
                </button>
              )}
            </>
          }
        />
      }
    >
      {children}
      {asOf && (
        <div className="__s9cmpx-label3" style={{ color: 'var(--__s9cmpx-static-text-weak)', marginTop: 8 }}>
          Data as of {asOf}
        </div>
      )}
    </Card>
  );
}
