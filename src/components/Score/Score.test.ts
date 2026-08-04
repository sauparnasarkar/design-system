import { describe, expect, it } from 'vitest';
import { clampScore, mapToEsgStep } from './Score';

describe('clampScore', () => {
  it('passes through values already within range', () => {
    expect(clampScore(3, 5)).toBe(3);
  });

  it('clamps values below 0 up to 0', () => {
    expect(clampScore(-2, 5)).toBe(0);
  });

  it('clamps values above max down to max', () => {
    expect(clampScore(9, 5)).toBe(5);
  });
});

describe('mapToEsgStep', () => {
  it('maps the minimum score (1) to step 1 (green end)', () => {
    expect(mapToEsgStep(1, 5)).toBe(1);
  });

  it('maps the maximum score to step 15 (red end)', () => {
    expect(mapToEsgStep(5, 5)).toBe(15);
  });

  it('maps a mid-range score to a mid-range step', () => {
    // (3-1)/(5-1) * 14 + 1 = 8
    expect(mapToEsgStep(3, 5)).toBe(8);
  });

  it('maps 0 (empty) using the same formula as any other clamped value', () => {
    // (0-1)/(5-1) * 14 + 1 rounds to -2.5+1 = -2.5 -> -2 (never rendered, since 0 = empty)
    expect(mapToEsgStep(0, 5)).toBe(Math.round(((0 - 1) / (5 - 1)) * 14) + 1);
  });

  it('always maps to step 1 when max <= 1 (no meaningful range to spread across)', () => {
    expect(mapToEsgStep(1, 1)).toBe(1);
    expect(mapToEsgStep(0, 1)).toBe(1);
  });

  it('scales correctly for a non-default max (e.g. a 10-point scale)', () => {
    expect(mapToEsgStep(1, 10)).toBe(1);
    expect(mapToEsgStep(10, 10)).toBe(15);
  });
});
