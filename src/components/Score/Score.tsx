import { cx } from '../../lib/cx';

export type ScoreSize = 'small' | 'medium' | 'large' | 'auto';

export interface ScoreProps {
  /** Filled segments, 1..max (0 = empty) */
  value: number;
  /** Total segments */
  max?: number;
  size?: ScoreSize;
  vertical?: boolean;
  /** Show the segment number under each box */
  showNumbers?: boolean;
  /** Accessible name for the meter (e.g. "ESG Entity Score") — no visible label is rendered by this component itself; pass a more specific value when the surrounding context doesn't already convey what's being scored. */
  label?: string;
  className?: string;
}

/** Clamps `value` to [0, max] — exported for unit testing (Score.test.ts). */
export function clampScore(value: number, max: number): number {
  return Math.max(0, Math.min(value, max));
}

/**
 * Maps a clamped score (1..max, or 0 for empty) onto the 15-step
 * --__s9cmpx-chart-esgscore ramp's step number (1 = green, 15 = red). Exported for unit
 * testing (Score.test.ts) — the CSS var itself isn't resolvable outside a real DOM/theme.
 */
export function mapToEsgStep(clamped: number, max: number): number {
  return max > 1 ? Math.round(((clamped - 1) / (max - 1)) * 14) + 1 : 1;
}

/**
 * ESG-style score bar. Filled boxes take the color of the score value mapped
 * onto the 15-step --__s9cmpx-chart-esgscore ramp (green 1 → red 15), matching how
 * the Green theme products render entity/instrument scores.
 */
export function Score({
  value,
  max = 5,
  size = 'medium',
  vertical = false,
  showNumbers = true,
  label = 'ESG Score',
  className,
}: ScoreProps) {
  const clamped = clampScore(value, max);
  const esgStep = mapToEsgStep(clamped, max);
  const fillColor = `var(--__s9cmpx-chart-esgscore-esg${esgStep})`;
  return (
    <div
      className={cx('__s9cmpx-score', `__s9cmpx-score--${size}`, vertical && '__s9cmpx-score--vertical', clamped === 0 && '__s9cmpx-score--empty', className)}
      role="meter"
      aria-label={label}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      {Array.from({ length: max }, (_, i) => {
        const n = i + 1;
        const filled = n <= clamped;
        return (
          <div key={n} className="__s9cmpx-score__partition">
            <div className="__s9cmpx-score__box-container">
              <div
                className="__s9cmpx-score__box"
                style={filled ? { background: fillColor } : undefined}
              />
            </div>
            {showNumbers && (
              <div className="__s9cmpx-score__number __s9cmpx-label3" style={{ color: 'var(--__s9cmpx-static-text-weak)' }}>{n}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
