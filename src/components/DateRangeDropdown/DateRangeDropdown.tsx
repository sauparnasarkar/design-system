import React from 'react';
import { cx } from '../../lib/cx';
import { Icon } from '../Icon/Icon';

export interface DateRange {
  from?: string;
  to?: string;
  /** Preset id, or "custom" */
  preset: string;
}

export interface DateRangePreset {
  id: string;
  label: string;
  /** Days back from today; used to compute from/to when picked */
  days?: number;
}

const DEFAULT_PRESETS: DateRangePreset[] = [
  { id: 'any', label: 'Any Time' },
  { id: '7d', label: 'Last 7 Days', days: 7 },
  { id: '30d', label: 'Last 30 Days', days: 30 },
  { id: '90d', label: 'Last 90 Days', days: 90 },
  { id: '1y', label: 'Last Year', days: 365 },
];

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export interface DateRangeDropdownProps {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  presets?: DateRangePreset[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Date filter dropdown (`sy-date-range-dropdown`): preset ranges with a
 * divider-separated "Custom Range" entry that reveals from/to date inputs.
 */
export function DateRangeDropdown({
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  placeholder = 'Select Date',
  disabled = false,
  className,
}: DateRangeDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const [internal, setInternal] = React.useState<DateRange | undefined>(undefined);
  const [customFrom, setCustomFrom] = React.useState('');
  const [customTo, setCustomTo] = React.useState('');
  const rootRef = React.useRef<HTMLDivElement>(null);
  const current = value ?? internal;

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const commit = (range: DateRange) => {
    setInternal(range);
    onChange?.(range);
  };

  const currentLabel =
    current?.preset === 'custom'
      ? `${current.from ?? '…'} – ${current.to ?? '…'}`
      : presets.find((p) => p.id === current?.preset)?.label;

  return (
    <div ref={rootRef} className={cx('sy-date-range-dropdown', className)} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        className="sy-button sy-button--secondary sy-button--m"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name="calendar" size={16} />
        {currentLabel ?? placeholder}
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={14} />
      </button>
      {open && (
        <div className="sy-dropdown-menu sy-dropdown-menu--medium sy-dropdown-menu--with-border" style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, zIndex: 20, minWidth: 220 }}>
          <div className="sy-dropdown-menu__list">
            <ul className="sy-date-range-dropdown__list sy-dropdown-menu__list-content" role="listbox" style={{ listStyle: 'none', margin: 0 }}>
              {presets.map((p) => (
                <li key={p.id} role="option" aria-selected={current?.preset === p.id}>
                  <button
                    type="button"
                    className="sy-dropdown-menu__list-item sy-body3-short"
                    onClick={() => {
                      commit({
                        preset: p.id,
                        from: p.days ? isoDaysAgo(p.days) : undefined,
                        to: p.days ? isoDaysAgo(0) : undefined,
                      });
                      setOpen(false);
                    }}
                    style={{ display: 'block', width: '100%', background: 'none', border: 0, borderRadius: 3, cursor: 'pointer', textAlign: 'left', fontWeight: current?.preset === p.id ? 600 : undefined }}
                  >
                    {p.label}
                  </button>
                </li>
              ))}
              <li role="option" aria-selected={current?.preset === 'custom'}>
                <div className="sy-dropdown-menu__list-item" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span className="sy-label3" style={{ fontWeight: current?.preset === 'custom' ? 600 : undefined }}>Custom Range</span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="date"
                      aria-label="From"
                      className="sy-input__input sy-body3-short"
                      value={customFrom}
                      onChange={(e) => setCustomFrom(e.target.value)}
                      style={{ borderRadius: 3, padding: '4px 6px' }}
                    />
                    <span className="sy-label3">–</span>
                    <input
                      type="date"
                      aria-label="To"
                      className="sy-input__input sy-body3-short"
                      value={customTo}
                      onChange={(e) => setCustomTo(e.target.value)}
                      style={{ borderRadius: 3, padding: '4px 6px' }}
                    />
                  </div>
                  <button
                    type="button"
                    className="sy-button sy-button--primary sy-button--s"
                    disabled={!customFrom || !customTo}
                    onClick={() => {
                      commit({ preset: 'custom', from: customFrom, to: customTo });
                      setOpen(false);
                    }}
                  >
                    Apply
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
