import React from 'react';
import { cx } from '../../lib/cx';

export interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  /** Show tick marks at each step */
  showTicks?: boolean;
  label?: React.ReactNode;
  /** Show the current value next to the label */
  showValue?: boolean;
  className?: string;
}

export function Slider({
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  disabled = false,
  showTicks = false,
  label,
  showValue = true,
  className,
}: SliderProps) {
  const [internal, setInternal] = React.useState(min);
  const current = value ?? internal;
  const pct = max > min ? ((current - min) / (max - min)) * 100 : 0;
  const trackRef = React.useRef<HTMLDivElement>(null);

  const setFromClientX = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const raw = min + ratio * (max - min);
    const snapped = Math.round(raw / step) * step;
    const next = Math.max(min, Math.min(max, snapped));
    setInternal(next);
    onChange?.(next);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    try {
      (e.target as Element).setPointerCapture?.(e.pointerId);
    } catch {
      // synthetic or already-released pointers can't be captured; dragging still works
    }
    setFromClientX(e.clientX);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    let next = current;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = Math.min(max, current + step);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = Math.max(min, current - step);
    else return;
    e.preventDefault();
    setInternal(next);
    onChange?.(next);
  };

  const tickCount = showTicks ? Math.floor((max - min) / step) + 1 : 0;

  return (
    <div className={className} style={{ minWidth: 220 }}>
      {(label || showValue) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          {label && <span className="sy-label3">{label}</span>}
          {showValue && <span className="sy-label3" style={{ color: 'var(--sy-static-text-weak)' }}>{current}</span>}
        </div>
      )}
      <div
        className={cx('sy-slider', disabled && 'sy-slider--disabled')}
        style={{ display: 'flex', opacity: disabled ? 0.5 : 1 }}
        onPointerDown={onPointerDown}
        onPointerMove={(e) => e.buttons === 1 && !disabled && setFromClientX(e.clientX)}
      >
        <div ref={trackRef} className="sy-slider__track" style={{ width: '100%' }}>
          <div className="sy-slider__track-fill" style={{ width: `${pct}%` }} />
          {showTicks && tickCount > 1 && (
            <div className="sy-slider__ticks" style={{ position: 'absolute', inset: 0 }}>
              {Array.from({ length: tickCount }, (_, i) => (
                <span
                  key={i}
                  className="sy-slider__ticks-mark"
                  style={{
                    position: 'absolute',
                    left: `${(i / (tickCount - 1)) * 100}%`,
                    top: '50%',
                    width: 1,
                    height: 6,
                    transform: 'translate(-50%, -50%)',
                    background: 'var(--sy-interactive-fill-tertiary-default)',
                  }}
                />
              ))}
            </div>
          )}
          <span
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={current}
            aria-disabled={disabled}
            className="sy-slider__thumb"
            style={{ left: `${pct}%`, top: '50%' }}
            onKeyDown={onKeyDown}
          />
        </div>
      </div>
    </div>
  );
}
