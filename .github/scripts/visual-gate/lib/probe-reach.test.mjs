// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';

import {emptyAccumulator, expectedColors, fold, hslToRgb} from './probe-reach.mjs';
import {paint, probeColor} from './probe-theme.mjs';

const rgbOf = seed => hslToRgb(probeColor(seed));
const textOf = seed => hslToRgb(paint(seed).color);

describe('hslToRgb', () => {
  it('matches the rgb() form getComputedStyle returns', () => {
    expect(hslToRgb('hsl(0 100% 50%)')).toBe('rgb(255, 0, 0)');
    expect(hslToRgb('hsl(120 100% 25%)')).toBe('rgb(0, 128, 0)');
  });

  it('round-trips a probe colour', () => {
    expect(rgbOf('badge')).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
  });
});

describe('expectedColors', () => {
  it('accepts the base colour when the element reflects no data', () => {
    expect(expectedColors('badge', [])).toContain(rgbOf('badge'));
  });

  it('covers every property the generator paints, not just the background', () => {
    expect(expectedColors('badge', [])).toContain(textOf('badge'));
  });

  it('also accepts a variant colour — a variant beating base is the cascade working', () => {
    const colors = expectedColors('badge', ['variant:info']);
    expect(colors).toContain(rgbOf('badge.variant:info'));
    expect(colors).toContain(rgbOf('badge'));
  });
});

describe('fold', () => {
  it('accepts proof from text or border, so an element with no background still counts', () => {
    const acc = fold(
      emptyAccumulator(),
      [{keys: ['icon'], data: [], bg: 'rgba(0, 0, 0, 0)', color: textOf('icon')}],
      's',
    );
    expect([...acc.verified]).toEqual(['icon']);
  });

  it('calls a target shadowed — not failed — when another target on the SAME element won', () => {
    const acc = fold(
      emptyAccumulator(),
      [{keys: ['date-input-toggle-icon', 'icon'], data: [], bg: rgbOf('icon')}],
      's',
    );
    expect([...acc.verified]).toEqual(['icon']);
    expect(acc.failures.size).toBe(0);
    expect(acc.shadowed.get('date-input-toggle-icon')).toMatchObject({
      sharesElementWith: ['icon'],
    });
  });

  it('promotes a shadowed target to verified once it wins somewhere else', () => {
    const acc = emptyAccumulator();
    fold(acc, [{keys: ['a', 'b'], data: [], bg: rgbOf('b')}], 'one');
    expect(acc.shadowed.has('a')).toBe(true);
    fold(acc, [{keys: ['a'], data: [], bg: rgbOf('a')}], 'two');
    expect(acc.shadowed.has('a')).toBe(false);
    expect(acc.verified.has('a')).toBe(true);
  });

  it('still fails a target when NOTHING probe-coloured won on its element', () => {
    const acc = fold(
      emptyAccumulator(),
      [{keys: ['card', 'surface'], data: [], bg: 'rgb(255, 255, 255)'}],
      's',
    );
    expect(acc.failures.has('card')).toBe(true);
    expect(acc.shadowed.size).toBe(0);
  });

  it('verifies a target whose override arrived', () => {
    const acc = fold(emptyAccumulator(), [{keys: ['badge'], data: [], bg: rgbOf('badge')}], 's');
    expect([...acc.verified]).toEqual(['badge']);
    expect(acc.failures.size).toBe(0);
  });

  it('fails a target showing the component colour instead of the override', () => {
    const acc = fold(emptyAccumulator(), [{keys: ['badge'], data: [], bg: 'rgb(0, 100, 224)'}], 's');
    expect(acc.verified.size).toBe(0);
    expect(acc.failures.get('badge')).toMatchObject({got: 'rgb(0, 100, 224)', storyId: 's'});
  });

  it('credits the variant colour on a variant element', () => {
    const acc = fold(
      emptyAccumulator(),
      [{keys: ['badge'], data: ['variant:info'], bg: rgbOf('badge.variant:info')}],
      's',
    );
    expect([...acc.verified]).toEqual(['badge']);
  });

  it('one proof is enough — a later element cannot un-verify a target', () => {
    const acc = emptyAccumulator();
    fold(acc, [{keys: ['badge'], data: [], bg: rgbOf('badge')}], 'a');
    fold(acc, [{keys: ['badge'], data: [], bg: 'rgb(1, 2, 3)'}], 'b');
    expect([...acc.verified]).toEqual(['badge']);
    expect(acc.failures.size).toBe(0);
  });

  it('clears an earlier failure once the target is proven elsewhere', () => {
    const acc = emptyAccumulator();
    fold(acc, [{keys: ['badge'], data: [], bg: 'rgb(1, 2, 3)'}], 'a');
    expect(acc.failures.has('badge')).toBe(true);
    fold(acc, [{keys: ['badge'], data: [], bg: rgbOf('badge')}], 'b');
    expect(acc.failures.has('badge')).toBe(false);
    expect([...acc.verified]).toEqual(['badge']);
  });

  it('keeps the first failing story, so the report can point somewhere real', () => {
    const acc = emptyAccumulator();
    fold(acc, [{keys: ['card'], data: [], bg: 'rgb(255, 255, 255)'}], 'first');
    fold(acc, [{keys: ['card'], data: [], bg: 'rgb(255, 255, 255)'}], 'second');
    expect(acc.failures.get('card').storyId).toBe('first');
  });
});
