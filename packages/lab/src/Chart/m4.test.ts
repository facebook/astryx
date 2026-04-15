import {describe, it, expect} from 'vitest';
import {m4Reduce, type M4Point} from './m4';

describe('m4Reduce', () => {
  it('returns empty for empty input', () => {
    expect(m4Reduce([], 100)).toEqual([]);
  });

  it('returns data as-is when small enough', () => {
    const data: M4Point[] = [
      {x: 0, y: 1},
      {x: 1, y: 2},
      {x: 2, y: 3},
    ];
    expect(m4Reduce(data, 100)).toEqual(data);
  });

  it('reduces large dataset', () => {
    // 10k points into 100px width = at most 400 output points
    const data: M4Point[] = Array.from({length: 10000}, (_, i) => ({
      x: i,
      y: Math.sin(i * 0.01) * 100,
    }));
    const reduced = m4Reduce(data, 100);
    expect(reduced.length).toBeLessThanOrEqual(400);
    expect(reduced.length).toBeGreaterThan(0);
  });

  it('preserves min and max values', () => {
    // Create data with a known spike
    const data: M4Point[] = Array.from({length: 1000}, (_, i) => ({
      x: i,
      y: i === 500 ? 999 : 0,
    }));
    const reduced = m4Reduce(data, 10);
    const maxY = Math.max(...reduced.map(p => p.y));
    expect(maxY).toBe(999); // spike must be preserved
  });

  it('preserves first and last points', () => {
    const data: M4Point[] = Array.from({length: 1000}, (_, i) => ({
      x: i,
      y: i,
    }));
    const reduced = m4Reduce(data, 10);
    expect(reduced[0].x).toBe(0);
    expect(reduced[reduced.length - 1].x).toBe(999);
  });

  it('handles single point', () => {
    const data: M4Point[] = [{x: 5, y: 10}];
    expect(m4Reduce(data, 100)).toEqual([{x: 5, y: 10}]);
  });

  it('respects custom xDomain', () => {
    const data: M4Point[] = Array.from({length: 1000}, (_, i) => ({
      x: i + 500,
      y: i,
    }));
    const reduced = m4Reduce(data, 10, [500, 1499]);
    expect(reduced.length).toBeLessThanOrEqual(40);
    expect(reduced.length).toBeGreaterThan(0);
  });
});
