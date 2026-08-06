import { describe, expect, it } from 'vitest';
import { logColorbarTicks, noDataHovertemplate, withAlpha } from './chartMath';

describe('withAlpha', () => {
  it('converts a 6-digit hex color to rgba with the given alpha', () => {
    expect(withAlpha('#187254', 0.25)).toBe('rgba(24, 114, 84, 0.25)');
  });

  it('is case-insensitive for hex digits', () => {
    expect(withAlpha('#AABBCC', 0.5)).toBe('rgba(170, 187, 204, 0.5)');
  });

  it('falls back to the raw color for non-hex input (e.g. a CSS var or named color)', () => {
    expect(withAlpha('var(--__s9cmpx-chart-categorical-default-01)', 0.25)).toBe(
      'var(--__s9cmpx-chart-categorical-default-01)',
    );
    expect(withAlpha('crimson', 0.5)).toBe('crimson');
  });

  it('falls back for a shorthand 3-digit hex (only 6-digit is matched)', () => {
    expect(withAlpha('#fff', 0.5)).toBe('#fff');
  });
});

describe('logColorbarTicks', () => {
  it('returns empty ticks when there are no positive values', () => {
    expect(logColorbarTicks([])).toEqual({ tickvals: [], ticktext: [] });
    expect(logColorbarTicks([null, null])).toEqual({ tickvals: [], ticktext: [] });
    expect(logColorbarTicks([0, -5, null])).toEqual({ tickvals: [], ticktext: [] });
  });

  it('spans floor(log10(min)) to ceil(log10(max)) in whole-decade steps', () => {
    // min=5 -> floor(log10(5))=0, max=500 -> ceil(log10(500))=3
    expect(logColorbarTicks([5, 500])).toEqual({
      tickvals: [0, 1, 2, 3],
      ticktext: ['1', '10', '100', '1k'],
    });
  });

  it('ignores null and non-positive entries when computing the span', () => {
    expect(logColorbarTicks([null, 0, -10, 5, 500])).toEqual({
      tickvals: [0, 1, 2, 3],
      ticktext: ['1', '10', '100', '1k'],
    });
  });

  it('formats values at or above 1000 with a "k" suffix, below with the raw number', () => {
    const { ticktext } = logColorbarTicks([1, 1_000_000]);
    expect(ticktext).toEqual(['1', '10', '100', '1k', '10k', '100k', '1,000k']);
  });

  it('handles a single value (degenerate single-point span)', () => {
    expect(logColorbarTicks([42])).toEqual({ tickvals: [1, 2], ticktext: ['10', '100'] });
  });
});

describe('noDataHovertemplate', () => {
  it('defaults to "No data reported" when no override is given', () => {
    expect(noDataHovertemplate()).toBe('%{location}<br>No data reported<extra></extra>');
  });

  it('uses the caller-supplied text when provided', () => {
    expect(noDataHovertemplate('Not yet reported')).toBe(
      '%{location}<br>Not yet reported<extra></extra>',
    );
  });
});
