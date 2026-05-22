// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {computeBoundaries, computeSegments} from './streaming';

describe('computeBoundaries', () => {
  it('pushes a new boundary when text grows', () => {
    expect(computeBoundaries([], 10, 5)).toEqual([10]);
    expect(computeBoundaries([10], 20, 5)).toEqual([10, 20]);
    expect(computeBoundaries([10, 20], 30, 5)).toEqual([10, 20, 30]);
  });

  it('does not push when text has not grown', () => {
    const prev = [10, 20];
    expect(computeBoundaries(prev, 20, 5)).toBe(prev);
    expect(computeBoundaries(prev, 15, 5)).toBe(prev);
  });

  it('evicts oldest boundaries when exceeding maxSpans', () => {
    expect(computeBoundaries([10, 20, 30], 40, 3)).toEqual([20, 30, 40]);
    expect(computeBoundaries([10, 20, 30, 40], 50, 3)).toEqual([30, 40, 50]);
  });

  it('handles maxSpans of 1', () => {
    expect(computeBoundaries([10], 20, 1)).toEqual([20]);
  });

  it('returns same reference when nothing changes', () => {
    const prev = [5, 10, 15];
    const result = computeBoundaries(prev, 10, 5);
    expect(result).toBe(prev);
  });
});

describe('computeSegments', () => {
  it('returns null when no boundaries', () => {
    expect(computeSegments('Hello world', 0, [], 0)).toBeNull();
  });

  it('returns null when text is entirely before oldest boundary', () => {
    expect(computeSegments('Hello', 0, [10, 20], 0)).toBeNull();
  });

  it('splits text at boundary into settled + fading', () => {
    const result = computeSegments('Hello world', 0, [5], 0);
    expect(result).toEqual([
      {key: 'settled-0', text: 'Hello', fading: false},
      {key: 'fade-0-b5', text: ' world', fading: true},
    ]);
  });

  it('splits across multiple boundaries', () => {
    const result = computeSegments('Hello beautiful world', 0, [5, 15], 0);
    expect(result).toEqual([
      {key: 'settled-0', text: 'Hello', fading: false},
      {key: 'fade-0-b5', text: ' beautiful', fading: true},
      {key: 'fade-0-b15', text: ' world', fading: true},
    ]);
  });

  it('handles text starting after the oldest boundary', () => {
    // Text node starts at offset 10, boundaries at [5, 15]
    const result = computeSegments('world!', 10, [5, 15], 1);
    expect(result).toEqual([
      {key: 'fade-1-b5', text: 'world', fading: true},
      {key: 'fade-1-b15', text: '!', fading: true},
    ]);
  });

  it('produces stable keys across renders as text grows', () => {
    // Simulate streaming: text grows tick by tick
    // Tick 1: "Hel" with boundaries [0]
    const r1 = computeSegments('Hel', 0, [0], 0);
    expect(r1).toEqual([{key: 'fade-0-b0', text: 'Hel', fading: true}]);

    // Tick 2: "Hello" with boundaries [0, 3]
    const r2 = computeSegments('Hello', 0, [0, 3], 0);
    expect(r2).toEqual([
      {key: 'fade-0-b0', text: 'Hel', fading: true},
      {key: 'fade-0-b3', text: 'lo', fading: true},
    ]);

    // Key 'fade-0-b0' is the SAME across tick 1 and tick 2
    expect(r1![0].key).toBe(r2![0].key);

    // Tick 3: "Hello wo" with boundaries [0, 3, 5]
    const r3 = computeSegments('Hello wo', 0, [0, 3, 5], 0);
    expect(r3).toEqual([
      {key: 'fade-0-b0', text: 'Hel', fading: true},
      {key: 'fade-0-b3', text: 'lo', fading: true},
      {key: 'fade-0-b5', text: ' wo', fading: true},
    ]);

    // All previous keys preserved
    expect(r2![0].key).toBe(r3![0].key);
    expect(r2![1].key).toBe(r3![1].key);
  });

  it('graduated text gets stable settled key', () => {
    // When boundary [0] gets evicted, its text merges into settled
    // boundaries = [3, 5, 8] — text before 3 is settled
    const r = computeSegments('Hello world', 0, [3, 5, 8], 0);
    expect(r![0]).toEqual({key: 'settled-0', text: 'Hel', fading: false});

    // If boundaries shift to [5, 8, 10] — more text settles but key stays the same
    const r2 = computeSegments('Hello world', 0, [5, 8, 10], 0);
    expect(r2![0]).toEqual({key: 'settled-0', text: 'Hello', fading: false});
    expect(r2![0].key).toBe(r![0].key); // Same key — no remount
  });

  it('boundary span key never changes as content grows inside it', () => {
    // Last boundary's span grows each tick but keeps the same key
    const r1 = computeSegments('AB', 0, [0], 0);
    const r2 = computeSegments('ABCD', 0, [0], 0);
    const r3 = computeSegments('ABCDEF', 0, [0], 0);

    expect(r1![0].key).toBe('fade-0-b0');
    expect(r2![0].key).toBe('fade-0-b0');
    expect(r3![0].key).toBe('fade-0-b0');

    // Content grows but key is stable
    expect(r1![0].text).toBe('AB');
    expect(r2![0].text).toBe('ABCD');
    expect(r3![0].text).toBe('ABCDEF');
  });

  it('evicted boundary text merges into settled without key collision', () => {
    // Step 1: boundaries = [0, 5, 10]
    const r1 = computeSegments('Hello World!!!', 0, [0, 5, 10], 0);
    expect(r1!.map(s => s.key)).toEqual([
      'fade-0-b0',
      'fade-0-b5',
      'fade-0-b10',
    ]);

    // Step 2: boundary 0 evicted → boundaries = [5, 10, 14]
    const r2 = computeSegments('Hello World!!!', 0, [5, 10, 14], 0);
    expect(r2!.map(s => s.key)).toEqual([
      'settled-0',
      'fade-0-b5',
      'fade-0-b10',
    ]);

    // 'fade-0-b5' and 'fade-0-b10' kept their keys — no remount
    expect(r1![1].key).toBe(r2![1].key);
    expect(r1![2].key).toBe(r2![2].key);
  });
});
