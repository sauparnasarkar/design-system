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
  /** Pass a function to react to the expand/restore toggle (e.g. a taller chart when expanded) — only meaningful with `expandable` */
  children: React.ReactNode | ((isExpanded: boolean) => React.ReactNode);
  className?: string;
  /** Heading level for the title, to keep page-level heading order valid in context; defaults to h5 */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Adds an expand/restore control to the header; while expanded, the card renders in a
   * safe-area-aware fixed overlay instead of its normal in-flow position (SPEC.md §5.11) */
  expandable?: boolean;
}

/** Chart panel chrome as used on the sector pages: Card header with controls + download, chart body, "Data as of" caption. */
export function ChartCard({ title, actions, onDownload, asOf, children, className, headingLevel, expandable = false }: ChartCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const content = typeof children === 'function' ? children(isExpanded) : children;

  const card = (
    <Card
      className={className}
      withBorder
      header={
        <CardHeader
          title={title}
          headingLevel={headingLevel}
          actions={
            <>
              {actions}
              {expandable && (
                <button
                  type="button"
                  className="__s9cmpx-button __s9cmpx-button--ghost __s9cmpx-button--s __s9cmpx-button--icon-only"
                  aria-label={isExpanded ? 'Restore chart' : 'Expand chart'}
                  onClick={() => setIsExpanded((v) => !v)}
                >
                  <Icon name={isExpanded ? 'collapse' : 'expand'} size={16} />
                </button>
              )}
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
      {content}
      {asOf && (
        <div className="__s9cmpx-label3" style={{ color: 'var(--__s9cmpx-static-text-weak)', marginTop: 8 }}>
          Data as of {asOf}
        </div>
      )}
    </Card>
  );

  if (!expandable || !isExpanded) return card;

  return (
    <div
      style={{
        position: 'fixed',
        // A fixed-position overlay is positioned relative to the viewport, not any padded
        // ancestor -- the app shell's own safe-area padding never applies here, so each side
        // needs its own env(safe-area-inset-*) added on top of the 16px margin (confirmed live,
        // Release 5 / SPEC.md §5.10).
        top: 'calc(16px + env(safe-area-inset-top, 0px))',
        right: 'calc(16px + env(safe-area-inset-right, 0px))',
        bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
        left: 'calc(16px + env(safe-area-inset-left, 0px))',
        // Must clear the sidebar nav's own z-index (--__s9cmpx-c-sidebar-z-index, 310) --
        // confirmed live that a plain z-index:50 here left the sidebar painted on top of the
        // overlay's left edge, since position:fixed escapes the app shell's flex layout and
        // this box's left edge lands under the sidebar's screen region regardless of DOM
        // order (SPEC.md §5.11). The modal tier is the semantically-closest existing token for
        // a full-content-covering overlay.
        zIndex: 'var(--__s9cmpx-z-index-modal)',
        background: 'var(--__s9cmpx-static-background-weak)',
        overflow: 'auto',
        padding: 8,
        borderRadius: 8,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      {card}
    </div>
  );
}
