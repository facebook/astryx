// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {gothicPalettes} from './gothicPalettes';

const stops = [
  0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95,
  100,
] as const;

const families = [
  'neutral',
  'blue',
  'cyan',
  'green',
  'orange',
  'pink',
  'purple',
  'red',
  'teal',
  'yellow',
] as const;

describe('gothic palette artifact', () => {
  it('preserves the existing public shape with every reviewed dark stop', () => {
    expect(Object.keys(gothicPalettes)).toEqual(families);
    for (const familyName of families) {
      const family = gothicPalettes[familyName];
      expect(typeof family.hue).toBe('number');
      expect(typeof family.chroma).toBe('number');
      for (const stop of stops) {
        expect(family[stop]).toMatch(/^#[0-9a-f]{6}$/i);
      }
      expect(family[0]).toBe('#000000');
      expect(family[100]).toBe('#ffffff');
    }
  });

  it('keeps Gothic semantic, categorical, and syntax anchors exact', () => {
    expect(gothicPalettes.neutral[10]).toBe('#101314');
    expect(gothicPalettes.neutral[20]).toBe('#24292d');
    expect(gothicPalettes.neutral[40]).toBe('#495056');
    expect(gothicPalettes.neutral[75]).toBe('#96a0ab');
    expect(gothicPalettes.neutral[95]).toBe('#e8f1f6');

    expect(gothicPalettes.purple[80]).toBe('#c39adb');
    expect(gothicPalettes.green[70]).toBe('#a3c987');
    expect(gothicPalettes.blue[65]).toBe('#8aa1d8');
    expect(gothicPalettes.yellow[65]).toBe('#e6b85e');
    expect(gothicPalettes.yellow[70]).toBe('#dec074');
    expect(gothicPalettes.pink[65]).toBe('#d97580');
    expect(gothicPalettes.teal[70]).toBe('#7cc5b3');

    for (const familyName of families.filter(family => family !== 'neutral')) {
      const family = gothicPalettes[familyName];
      expect(family[20]).toMatch(/^#[0-9a-f]{6}$/i);
      expect(family[30]).toMatch(/^#[0-9a-f]{6}$/i);
      expect(family[60]).toMatch(/^#[0-9a-f]{6}$/i);
      expect(family[75]).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});
