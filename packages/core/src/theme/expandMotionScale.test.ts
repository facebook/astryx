import {describe, it, expect} from 'vitest';
import {expandMotionScale} from './expandMotionScale';

describe('expandMotionScale', () => {
  it('computes default XDS motion scale', () => {
    const tokens = expandMotionScale({fast: 175, medium: 410, ratio: 0.75});

    expect(tokens['--duration-fast-min']).toBe('130ms'); // 175 × 0.75 = 131.25 → 130
    expect(tokens['--duration-fast']).toBe('175ms');
    expect(tokens['--duration-fast-max']).toBe('235ms'); // 175 / 0.75 = 233.3 → 235
    expect(tokens['--duration-medium-min']).toBe('310ms'); // 410 × 0.75 = 307.5 → 310
    expect(tokens['--duration-medium']).toBe('410ms');
    expect(tokens['--duration-medium-max']).toBe('545ms'); // 410 / 0.75 = 546.6 → 545
  });

  it('computes snappy motion scale', () => {
    const tokens = expandMotionScale({fast: 100, medium: 250, ratio: 0.75});

    expect(tokens['--duration-fast-min']).toBe('75ms');
    expect(tokens['--duration-fast']).toBe('100ms');
    expect(tokens['--duration-fast-max']).toBe('135ms');
    expect(tokens['--duration-medium-min']).toBe('190ms');
    expect(tokens['--duration-medium']).toBe('250ms');
    expect(tokens['--duration-medium-max']).toBe('335ms');
  });

  it('computes cinematic motion scale', () => {
    const tokens = expandMotionScale({fast: 200, medium: 500, ratio: 0.7});

    expect(tokens['--duration-fast-min']).toBe('140ms');
    expect(tokens['--duration-fast']).toBe('200ms');
    expect(tokens['--duration-fast-max']).toBe('285ms');
    expect(tokens['--duration-medium-min']).toBe('350ms');
    expect(tokens['--duration-medium']).toBe('500ms');
    expect(tokens['--duration-medium-max']).toBe('715ms');
  });

  it('does not include easing token when not specified', () => {
    const tokens = expandMotionScale({fast: 175, medium: 410, ratio: 0.75});

    expect(tokens['--easing-standard']).toBeUndefined();
  });

  it('includes easing override when specified', () => {
    const tokens = expandMotionScale({
      fast: 175,
      medium: 410,
      ratio: 0.75,
      easing: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    });

    expect(tokens['--easing-standard']).toBe('cubic-bezier(0.0, 0.0, 0.2, 1)');
  });

  it('produces exactly 6 duration tokens', () => {
    const tokens = expandMotionScale({fast: 175, medium: 410, ratio: 0.75});
    const durationKeys = Object.keys(tokens).filter(k =>
      k.startsWith('--duration-'),
    );

    expect(durationKeys).toHaveLength(6);
  });

  it('maintains ordering: min < base < max', () => {
    const tokens = expandMotionScale({fast: 175, medium: 410, ratio: 0.75});

    const fastMin = parseInt(tokens['--duration-fast-min']);
    const fast = parseInt(tokens['--duration-fast']);
    const fastMax = parseInt(tokens['--duration-fast-max']);
    const medMin = parseInt(tokens['--duration-medium-min']);
    const med = parseInt(tokens['--duration-medium']);
    const medMax = parseInt(tokens['--duration-medium-max']);

    expect(fastMin).toBeLessThan(fast);
    expect(fast).toBeLessThan(fastMax);
    expect(medMin).toBeLessThan(med);
    expect(med).toBeLessThan(medMax);
    expect(fastMax).toBeLessThan(medMin);
  });
});
