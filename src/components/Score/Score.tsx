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
  className?: string;
}

/**
 * ESG-style score bar. Filled boxes take the color of the score value mapped
 * onto the 15-step --sy-chart-esgscore ramp (green 1 → red 15), matching how
 * the Green theme products render entity/instrument scores.
 */
export function Score({
  value,
  max = 5,
  size = 'medium',
  vertical = false,
  showNumbers = true,
  className,
}: ScoreProps) {
  const clamped = Math.max(0, Math.min(value, max));
  const esgStep = max > 1 ? Math.round(((clamped - 1) / (max - 1)) * 14) + 1 : 1;
  const fillColor = `var(--sy-chart-esgscore-esg${esgStep})`;
  return (
    <div
      className={cx('sy-score', `sy-score--${size}`, vertical && 'sy-score--vertical', clamped === 0 && 'sy-score--empty', className)}
      role="meter"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      {Array.from({ length: max }, (_, i) => {
        const n = i + 1;
        const filled = n <= clamped;
        return (
          <div key={n} className="sy-score__partition">
            <div className="sy-score__box-container">
              <div
                className="sy-score__box"
                style={filled ? { background: fillColor } : undefined}
              />
            </div>
            {showNumbers && (
              <div className="sy-score__number sy-label3" style={{ color: 'var(--sy-static-text-weak)' }}>{n}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
