import React from 'react';
import { cx } from '../../lib/cx';

export interface RangeSliderProps {
  min?: number;
  max?: number;
  step?: number;
  value?: [number, number];
  onChange?: (value: [number, number]) => void;
  disabled?: boolean;
  /** Show tick marks at each step */
  showTicks?: boolean;
  label?: React.ReactNode;
  /** Show the current [lower, upper] value next to the label */
  showValue?: boolean;
  /** Accessible names for the two thumbs, e.g. ["Minimum year", "Maximum year"] — falls
   * back to "{label} minimum"/"{label} maximum" when `label` is a plain string, or generic
   * "Minimum"/"Maximum" otherwise, since two thumbs sharing one visible label would
   * otherwise be indistinguishable to a screen reader. */
  thumbLabels?: [string, string];
  className?: string;
}

type ThumbIndex = 0 | 1;

export function RangeSlider({
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  disabled = false,
  showTicks = false,
  label,
  showValue = true,
  thumbLabels,
  className,
}: RangeSliderProps) {
  const [internal, setInternal] = React.useState<[number, number]>([min, max]);
  const current = value ?? internal;
  const [lower, upper] = current;
  const lowerPct = max > min ? ((lower - min) / (max - min)) * 100 : 0;
  const upperPct = max > min ? ((upper - min) / (max - min)) * 100 : 0;
  const trackRef = React.useRef<HTMLDivElement>(null);
  const lowerThumbRef = React.useRef<HTMLSpanElement>(null);
  const upperThumbRef = React.useRef<HTMLSpanElement>(null);
  const draggingThumbRef = React.useRef<ThumbIndex | null>(null);

  const lowerLabel = thumbLabels?.[0] ?? (typeof label === 'string' ? `${label} minimum` : 'Minimum');
  const upperLabel = thumbLabels?.[1] ?? (typeof label === 'string' ? `${label} maximum` : 'Maximum');

  // Clamps a candidate value for `index` against [min, max] AND against the other thumb's
  // current value, so the two thumbs can meet (a single-point selection) but never cross.
  const commit = (index: ThumbIndex, raw: number) => {
    const snapped = min + Math.round((raw - min) / step) * step;
    const bounded = Math.max(min, Math.min(max, snapped));
    const next: [number, number] =
      index === 0
        ? [Math.min(bounded, upper), upper]
        : [lower, Math.max(bounded, lower)];
    setInternal(next);
    onChange?.(next);
  };

  const setFromClientX = (index: ThumbIndex, clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    commit(index, min + ratio * (max - min));
  };

  const onTrackPointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    const target = e.target as Node;
    let index: ThumbIndex;
    if (lowerThumbRef.current?.contains(target)) {
      index = 0;
    } else if (upperThumbRef.current?.contains(target)) {
      index = 1;
    } else {
      // Clicked the track itself (not a thumb) — move whichever thumb is positionally closer.
      const rect = trackRef.current?.getBoundingClientRect();
      const ratio = rect && rect.width > 0 ? Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) : 0;
      const clickValue = min + ratio * (max - min);
      index = Math.abs(clickValue - lower) <= Math.abs(clickValue - upper) ? 0 : 1;
    }
    try {
      (e.target as Element).setPointerCapture?.(e.pointerId);
    } catch {
      // synthetic or already-released pointers can't be captured; dragging still works
    }
    draggingThumbRef.current = index;
    setFromClientX(index, e.clientX);
  };

  const onTrackPointerMove = (e: React.PointerEvent) => {
    if (disabled || e.buttons !== 1 || draggingThumbRef.current === null) return;
    setFromClientX(draggingThumbRef.current, e.clientX);
  };

  const onTrackPointerUp = () => {
    draggingThumbRef.current = null;
  };

  const onThumbKeyDown = (index: ThumbIndex) => (e: React.KeyboardEvent) => {
    if (disabled) return;
    const own = index === 0 ? lower : upper;
    const ownMin = index === 0 ? min : lower;
    const ownMax = index === 0 ? upper : max;
    let next = own;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = Math.min(ownMax, own + step);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = Math.max(ownMin, own - step);
    else if (e.key === 'Home') next = ownMin;
    else if (e.key === 'End') next = ownMax;
    else return;
    e.preventDefault();
    commit(index, next);
  };

  const tickCount = showTicks ? Math.floor((max - min) / step) + 1 : 0;

  return (
    <div className={className} style={{ minWidth: 220 }}>
      {(label || showValue) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          {label && <span className="__s9cmpx-label3">{label}</span>}
          {showValue && (
            <span className="__s9cmpx-label3" style={{ color: 'var(--__s9cmpx-static-text-weak)' }}>
              {lower}–{upper}
            </span>
          )}
        </div>
      )}
      <div
        className={cx('__s9cmpx-slider', disabled && '__s9cmpx-slider--disabled')}
        style={{ display: 'flex', opacity: disabled ? 0.5 : 1 }}
        onPointerDown={onTrackPointerDown}
        onPointerMove={onTrackPointerMove}
        onPointerUp={onTrackPointerUp}
        onPointerCancel={onTrackPointerUp}
      >
        <div ref={trackRef} className="__s9cmpx-slider__track" style={{ width: '100%' }}>
          <div
            className="__s9cmpx-slider__track-fill"
            style={{ left: `${lowerPct}%`, width: `${Math.max(0, upperPct - lowerPct)}%` }}
          />
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
            ref={lowerThumbRef}
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-valuemin={min}
            aria-valuemax={upper}
            aria-valuenow={lower}
            aria-label={lowerLabel}
            aria-disabled={disabled}
            className="__s9cmpx-slider__thumb"
            style={{ left: `${lowerPct}%`, top: '50%' }}
            onKeyDown={onThumbKeyDown(0)}
          />
          <span
            ref={upperThumbRef}
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-valuemin={lower}
            aria-valuemax={max}
            aria-valuenow={upper}
            aria-label={upperLabel}
            aria-disabled={disabled}
            className="__s9cmpx-slider__thumb"
            style={{ left: `${upperPct}%`, top: '50%' }}
            onKeyDown={onThumbKeyDown(1)}
          />
        </div>
      </div>
    </div>
  );
}
