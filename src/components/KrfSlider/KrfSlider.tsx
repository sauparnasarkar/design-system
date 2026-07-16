import React from 'react';
import { cx } from '../../lib/cx';

export type KrfMarkSentiment = 'default' | 'positive' | 'negative';

export interface KrfOption {
  value: string;
  label: React.ReactNode;
  sentiment?: KrfMarkSentiment;
  disabled?: boolean;
}

export interface KrfSliderProps {
  /** Discrete labeled notches, left to right (e.g. rating factor levels aaa…d) */
  options: KrfOption[];
  value?: string;
  onChange?: (value: string) => void;
  /** Helper text under the slider */
  description?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

/**
 * Key Rating Factor slider (`sy-krf-slider`): a discrete notch selector with a
 * progress track, as used in Ratings Navigator-style factor panels. Not a
 * dual-thumb range — the vendor block is a labeled mark row.
 */
export function KrfSlider({
  options,
  value,
  onChange,
  description,
  disabled = false,
  className,
}: KrfSliderProps) {
  const [internal, setInternal] = React.useState(options[0]?.value);
  const current = value ?? internal;
  const activeIndex = Math.max(0, options.findIndex((o) => o.value === current));
  const pct = options.length > 1 ? (activeIndex / (options.length - 1)) * 100 : 0;

  const select = (v: string) => {
    setInternal(v);
    onChange?.(v);
  };

  return (
    <div className={cx('sy-krf-slider', className)}>
      <div
        className={cx('sy-krf-slider__slider', disabled && 'sy-krf-slider__slider--disabled')}
        style={{ position: 'relative' }}
        role="radiogroup"
      >
        {/* track + filled progress up to the active mark */}
        <div
          aria-hidden="true"
          style={{ position: 'absolute', left: '4%', right: '4%', top: 17, height: 2, background: 'var(--sy-color-brand-100, #ebebeb)', borderRadius: 2, pointerEvents: 'none' }}
        />
        <div
          className="sy-krf-slider__progress"
          aria-hidden="true"
          style={{ position: 'absolute', left: '4%', width: `calc(${pct} * 0.92%)`, top: 17, height: 2, background: 'var(--sy-interactive-fill-primary-default, #1f1f1f)', borderRadius: 2, pointerEvents: 'none', margin: 0 }}
        />
        {/* thumb at the active mark */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: `calc(4% + ${pct} * 0.92%)`,
            top: 18,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: 'var(--sy-static-background-standard, #fff)',
            border: '1px solid var(--sy-interactive-fill-primary-default, #1f1f1f)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />
        <div className="sy-krf-slider__marks-wrapper">
          {options.map((o, i) => {
            const active = i === activeIndex;
            return (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={disabled || o.disabled}
                className={cx(
                  'sy-krf-slider__mark',
                  active && 'sy-krf-slider__mark--active',
                  !active && o.sentiment === 'positive' && 'sy-krf-slider__mark--positive',
                  !active && o.sentiment === 'negative' && 'sy-krf-slider__mark--negative',
                )}
                onClick={() => select(o.value)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight' && activeIndex < options.length - 1) select(options[activeIndex + 1].value);
                  if (e.key === 'ArrowLeft' && activeIndex > 0) select(options[activeIndex - 1].value);
                }}
                style={{
                  flex: 1,
                  position: 'relative',
                  border: 0,
                  background: active ? 'var(--sy-interactive-fill-primary-default, #1f1f1f)' : 'transparent',
                  color: active ? 'var(--sy-interactive-fill-primary-onprimary, #fff)' : undefined,
                  paddingTop: 34,
                }}
              >
                <span className="sy-krf-slider__label sy-label3">{o.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      {description && (
        <div className="sy-krf-slider__description-wrapper" style={{ marginTop: 8 }}>
          <span className="sy-krf-slider__description sy-label3" style={{ color: 'var(--sy-static-text-weak)' }}>
            {description}
          </span>
        </div>
      )}
    </div>
  );
}
