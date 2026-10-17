// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {stonePalettes} from './stonePalettes';

const stops = [
  0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95,
  100,
] as const;

const chromaticFamilies = [
  'red',
  'orange',
  'yellow',
  'green',
  'teal',
  'cyan',
  'blue',
  'purple',
  'pink',
] as const;

const exactMidpoints = {
  red: '#8a716d',
  orange: '#8f7154',
  yellow: '#927f25',
  green: '#528b49',
  teal: '#588174',
  cyan: '#507b86',
  blue: '#6c7888',
  purple: '#7b7486',
  pink: '#83727c',
} as const;

describe('stone palette artifact', () => {
  it('keeps every reviewed family and mode structurally complete', () => {
    expect(stonePalettes.black).toBe('#000000');
    expect(stonePalettes.white).toBe('#ffffff');
    expect(Object.keys(stonePalettes)).toEqual([
      'black',
      'white',
      'neutral',
      ...chromaticFamilies,
    ]);

    for (const familyName of ['neutral', ...chromaticFamilies] as const) {
      const family = stonePalettes[familyName];
      for (const stop of stops) {
        expect(family.light[stop]).toMatch(/^#[0-9a-f]{6}$/i);
        expect(family.dark[stop]).toMatch(/^#[0-9a-f]{6}$/i);
      }
      expect(family.light[0]).toBe(stonePalettes.black);
      expect(family.dark[0]).toBe(stonePalettes.black);
      expect(family.light[100]).toBe(stonePalettes.white);
      expect(family.dark[100]).toBe(stonePalettes.white);
      expect(family[0]).toBe(family.light[0]);
      expect(family[50]).toBe(family.light[50]);
      expect(family[100]).toBe(family.light[100]);
    }
  });

  it('preserves Stone exact anchors in both modes', () => {
    expect(stonePalettes.neutral.light[15]).toBe('#25252a');
    expect(stonePalettes.neutral.light[50]).toBe('#77777c');
    expect(stonePalettes.neutral.light[90]).toBe('#e2e2e8');
    expect(stonePalettes.neutral.dark[15]).toBe('#25252a');
    expect(stonePalettes.neutral.dark[50]).toBe('#77777c');
    expect(stonePalettes.neutral.dark[90]).toBe('#e2e2e8');

    for (const familyName of chromaticFamilies) {
      expect(stonePalettes[familyName].light[50]).toBe(
        exactMidpoints[familyName],
      );
      expect(stonePalettes[familyName].dark[50]).toBe(
        exactMidpoints[familyName],
      );
    }

    expect(stonePalettes.yellow.light[90]).toBe('#f4e1b7');
    expect(stonePalettes.yellow.dark[90]).toBe('#f1e1b9');
    expect(stonePalettes.orange.light[90]).toBe('#ffdcbb');
    expect(stonePalettes.orange.dark[90]).toBe('#ffdcbb');
    expect(stonePalettes.green.light[85]).toBe('#bfdfbb');
    expect(stonePalettes.green.dark[85]).toBe('#c3ddbf');
  });
});
