import { describe, expect, it } from 'vitest';
import {
  decadeTicks, blendValues, clamp, colorAt, colorForValue, easeInOut, formatGlobeValue, keyToAction, lerpColor,
  labelBoxesOverlap, normalizeValue, parseColor, pickLabelCandidates, placeLabels, relativeLuminance, rotationStep,
} from './globeMath';

const SCALE: Array<[number, string]> = [[0, '#000000'], [0.5, '#ff0000'], [1, '#ffffff']];

describe('parseColor / lerpColor / colorAt', () => {
  it('parses hex and rgb forms, rejects the rest', () => {
    expect(parseColor('#fc0')).toEqual([255, 204, 0]);
    expect(parseColor('#ffeda0')).toEqual([255, 237, 160]);
    expect(parseColor('#ffeda0cc')).toEqual([255, 237, 160]);
    expect(parseColor('rgb(1, 2, 3)')).toEqual([1, 2, 3]);
    expect(parseColor('var(--x)')).toBeNull();
  });
  it('interpolates channel-wise and falls back on unparseable input', () => {
    expect(lerpColor('#000000', '#ffffff', 0.5)).toBe('#808080');
    expect(lerpColor('var(--a)', '#ffffff', 0.2)).toBe('var(--a)');
  });
  it('samples a multi-stop scale, clamping outside 0-1', () => {
    expect(colorAt(SCALE, 0)).toBe('#000000');
    expect(colorAt(SCALE, 0.25)).toBe('#800000');
    expect(colorAt(SCALE, 0.5)).toBe('#ff0000');
    expect(colorAt(SCALE, 2)).toBe('#ffffff');
    expect(colorAt(SCALE, -1)).toBe('#000000');
  });
});

describe('normalizeValue / colorForValue', () => {
  it('is log10-linear across the range when zLog', () => {
    expect(normalizeValue(1, [0.01, 100], true)).toBeCloseTo(0.5, 10);
    expect(normalizeValue(1000, [0.01, 100], true)).toBe(1);
    expect(normalizeValue(0.001, [0.01, 100], true)).toBe(0);
  });
  it('has no position for non-positive values on a log axis or a degenerate range', () => {
    expect(normalizeValue(0, [0.01, 100], true)).toBeNull();
    expect(normalizeValue(5, [0, 100], true)).toBeNull();
    expect(normalizeValue(5, [10, 10], false)).toBeNull();
  });
  it('is linear when not zLog', () => {
    expect(normalizeValue(25, [0, 100], false)).toBe(0.25);
  });
  it('returns null (no data) for null/NaN/non-positive-on-log values', () => {
    expect(colorForValue(null, [0.01, 100], SCALE, true)).toBeNull();
    expect(colorForValue(Number.NaN, [0.01, 100], SCALE, true)).toBeNull();
    expect(colorForValue(-1, [0.01, 100], SCALE, true)).toBeNull();
    expect(colorForValue(1, [0.01, 100], SCALE, true)).toBe('#ff0000');
  });
});

describe('blendValues', () => {
  it('interpolates when both frames have data', () => {
    expect(blendValues(10, 20, 0.5)).toBe(15);
    expect(blendValues(10, 20, 0)).toBe(10);
  });
  it('snaps at the midpoint when only one frame has data', () => {
    expect(blendValues(null, 20, 0.4)).toBeNull();
    expect(blendValues(null, 20, 0.6)).toBe(20);
    expect(blendValues(10, null, 0.4)).toBe(10);
    expect(blendValues(10, null, 0.6)).toBeNull();
    expect(blendValues(null, null, 0.6)).toBeNull();
  });
  it('easeInOut is 0/1 at the ends and clamps', () => {
    expect(easeInOut(0)).toBe(0);
    expect(easeInOut(1)).toBe(1);
    expect(easeInOut(0.5)).toBe(0.5);
    expect(easeInOut(3)).toBe(1);
  });
});

describe('formatting, rotation, keys, labels', () => {
  it('formats with 2 decimals under 10 and grouped integers otherwise, unit optional', () => {
    expect(formatGlobeValue(0.004)).toBe('0.00');
    expect(formatGlobeValue(9.876, 'Mt')).toBe('9.88 Mt');
    expect(formatGlobeValue(12289.037)).toBe('12,289');
  });
  it('advances longitude proportionally to elapsed time and never for a non-positive period', () => {
    expect(rotationStep(1000, 4000)).toBe(90);
    expect(rotationStep(1000, 0)).toBe(0);
  });
  it('maps keys to actions and ignores others', () => {
    expect(keyToAction('ArrowLeft')?.dLon).toBe(-15);
    expect(keyToAction('ArrowUp')?.dLat).toBe(10);
    expect(keyToAction('+')?.dZoom).toBe(0.5);
    expect(keyToAction('-')?.dZoom).toBe(-0.5);
    expect(keyToAction('0')?.reset).toBe(true);
    expect(keyToAction('a')).toBeNull();
  });
  it('picks the largest visible-hemisphere candidates only', () => {
    const out = pickLabelCandidates([
      { index: 0, value: 5, dist: 0.2 },
      { index: 1, value: 50, dist: 1.5 }, // far side
      { index: 2, value: 20, dist: 0.9 },
      { index: 3, value: 0, dist: 0.1 }, // no value
      { index: 4, value: 9, dist: 1.0 },
    ], 2);
    expect(out.map((c) => c.index)).toEqual([2, 4]);
  });
  it('labelBoxesOverlap: overlapping and padded-close boxes collide, clear ones do not', () => {
    const a = { x: 0, y: 0, w: 50, h: 16 };
    expect(labelBoxesOverlap(a, { x: 40, y: 8, w: 50, h: 16 })).toBe(true);
    expect(labelBoxesOverlap(a, { x: 51, y: 0, w: 50, h: 16 })).toBe(true); // 1 px apart, inside the 2 px pad
    expect(labelBoxesOverlap(a, { x: 53, y: 0, w: 50, h: 16 })).toBe(false);
    expect(labelBoxesOverlap(a, { x: 0, y: 40, w: 50, h: 16 })).toBe(false);
  });
  it('placeLabels keeps the largest first, skips a colliding one and lets the next-largest fill in, up to n', () => {
    const c = (id: string, x: number, y: number) => ({ id, box: { x, y, w: 60, h: 16 } });
    // Ordered largest first: A and B overlap, C is clear of A, D overlaps C.
    const out = placeLabels([c('A', 0, 0), c('B', 30, 4), c('C', 0, 60), c('D', 20, 62), c('E', 0, 120)], 3);
    expect(out.map((l) => l.id)).toEqual(['A', 'C', 'E']);
    expect(placeLabels([c('A', 0, 0), c('B', 0, 60)], 1).map((l) => l.id)).toEqual(['A']);
    expect(placeLabels([], 5)).toEqual([]);
  });
  it('luminance orders dark below light; clamp bounds', () => {
    expect(relativeLuminance('#061e28')).toBeLessThan(relativeLuminance('#f4f7f9'));
    expect(clamp(5, 0, 3)).toBe(3);
  });
});

describe('decadeTicks', () => {
  it('lists decades inside a log range with positions matching normalizeValue', () => {
    const t = decadeTicks([0.004, 12289], true);
    expect(t.map((x) => x.label)).toEqual(['0.01', '0.1', '1', '10', '100', '1k', '10k']);
    expect(t[0].pos).toBeGreaterThan(0);
    expect(t[t.length - 1].pos).toBeLessThan(100);
    expect(t[3].pos).toBeCloseTo((Math.log10(10) - Math.log10(0.004)) / (Math.log10(12289) - Math.log10(0.004)) * 100, 6);
  });
  it('returns three linear ticks otherwise and none for a degenerate/invalid range', () => {
    expect(decadeTicks([0, 100], false).map((x) => x.pos)).toEqual([0, 50, 100]);
    expect(decadeTicks([5, 5], true)).toEqual([]);
    expect(decadeTicks([0, 100], true)).toEqual([]);
  });
});
