import React from 'react';
import { cx } from '../../lib/cx';

export interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  /** Increment for Page Up/Page Down. Defaults to `step * 10`. */
  pageStep?: number;
  value?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  /** Show tick marks at each step */
  showTicks?: boolean;
  label?: React.ReactNode;
  /** Show the current value next to the label */
  showValue?: boolean;
  /** Show `min`/`max` as static labels at the track's two ends */
  showRangeLabels?: boolean;
  /**
   * Show a small floating label directly above the thumb, tracking its position live as the
   * value changes -- whether from dragging, keyboard input, or a programmatic value change
   * (e.g. autoplay). Distinct from `showValue`, which is a static line above the track; this
   * one moves with the thumb, useful when the track spans a wide range and a value at either
   * end would otherwise sit far from the fixed showValue text.
   */
  showThumbValue?: boolean;
  className?: string;
}

export function Slider({
  min = 0,
  max = 100,
  step = 1,
  pageStep,
  value,
  onChange,
  disabled = false,
  showTicks = false,
  label,
  showValue = true,
  showRangeLabels = false,
  showThumbValue = false,
  className,
}: SliderProps) {
  const [internal, setInternal] = React.useState(min);
  const current = value ?? internal;
  const pct = max > min ? ((current - min) / (max - min)) * 100 : 0;
  const trackRef = React.useRef<HTMLDivElement>(null);
  const labelId = React.useId();

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
    const page = pageStep ?? step * 10;
    let next = current;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = Math.min(max, current + step);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = Math.max(min, current - step);
    else if (e.key === 'PageUp') next = Math.min(max, current + page);
    else if (e.key === 'PageDown') next = Math.max(min, current - page);
    else if (e.key === 'Home') next = min;
    else if (e.key === 'End') next = max;
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
          {label && <span id={labelId} className="__s9cmpx-label3">{label}</span>}
          {showValue && <span className="__s9cmpx-label3" style={{ color: 'var(--__s9cmpx-static-text-weak)' }}>{current}</span>}
        </div>
      )}
      <div
        className={cx('__s9cmpx-slider', disabled && '__s9cmpx-slider--disabled')}
        style={{ display: 'flex', opacity: disabled ? 0.5 : 1 }}
        onPointerDown={onPointerDown}
        onPointerMove={(e) => e.buttons === 1 && !disabled && setFromClientX(e.clientX)}
      >
        <div ref={trackRef} className="__s9cmpx-slider__track" style={{ width: '100%', position: 'relative' }}>
          <div className="__s9cmpx-slider__track-fill" style={{ width: `${pct}%` }} />
          {showThumbValue && (
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: `${pct}%`,
                top: 0,
                transform: 'translate(-50%, calc(-100% - 10px))',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                padding: '2px 7px',
                borderRadius: 4,
                fontSize: 11,
                fontFamily: 'var(--__s9cmpx-font-families-primary)',
                color: 'var(--__s9cmpx-static-text-standard)',
                background: 'var(--__s9cmpx-static-layer-standard)',
                border: '1px solid var(--__s9cmpx-static-divider-weak)',
              }}
            >
              {current}
            </span>
          )}
          {showTicks && tickCount > 1 && (
            <div className="__s9cmpx-slider__ticks" style={{ position: 'absolute', inset: 0 }}>
              {Array.from({ length: tickCount }, (_, i) => (
                <span
                  key={i}
                  className="__s9cmpx-slider__ticks-mark"
                  style={{
                    position: 'absolute',
                    left: `${(i / (tickCount - 1)) * 100}%`,
                    top: '50%',
                    width: 1,
                    height: 6,
                    transform: 'translate(-50%, -50%)',
                    background: 'var(--__s9cmpx-interactive-fill-tertiary-default)',
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
            aria-labelledby={label ? labelId : undefined}
            aria-disabled={disabled}
            className="__s9cmpx-slider__thumb"
            style={{ left: `${pct}%`, top: '50%' }}
            onKeyDown={onKeyDown}
          />
        </div>
      </div>
      {showRangeLabels && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span className="__s9cmpx-label3" style={{ color: 'var(--__s9cmpx-static-text-weak)' }}>{min}</span>
          <span className="__s9cmpx-label3" style={{ color: 'var(--__s9cmpx-static-text-weak)' }}>{max}</span>
        </div>
      )}
    </div>
  );
}
