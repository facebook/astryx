import {describe, expect, test} from 'vitest';
import {versions, getTransformsBetween} from '../registry.mjs';

describe('registry', () => {
  describe('versions', () => {
    test('are sorted in ascending semver order across digit boundaries', () => {
      expect(versions).toEqual(['0.0.2', '0.0.6', '0.0.7', '0.0.8', '0.0.10', '0.0.12', '0.0.13']);
    });
  });

  describe('getTransformsBetween', () => {
    test('returns v0.0.10 transforms for range 0.0.9 to 0.0.10', async () => {
      const results = await getTransformsBetween('0.0.9', '0.0.10');
      expect(results.map((r) => r.version)).toEqual(['0.0.10']);
    });

    test('returns v0.0.6, v0.0.7, v0.0.8 for range 0.0.2 to 0.0.8', async () => {
      const results = await getTransformsBetween('0.0.2', '0.0.8');
      expect(results.map((r) => r.version)).toEqual([
        '0.0.6',
        '0.0.7',
        '0.0.8',
      ]);
    });

    test('returns empty array when from equals to', async () => {
      const results = await getTransformsBetween('0.0.6', '0.0.6');
      expect(results).toEqual([]);
    });

    test('returns empty array when from is greater than to', async () => {
      const results = await getTransformsBetween('0.0.8', '0.0.2');
      expect(results).toEqual([]);
    });
  });
});
