// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file layerViewportInset.test.ts
 * @input Uses vitest and layerViewportInset
 * @output Contract tests for the per-edge viewport gutter expressions
 * @position Testing; validates layerViewportInset.ts
 */

import {describe, expect, it} from 'vitest';
import {
  layerInsetVars,
  layerViewportGutter,
  layerViewportGutterFallback,
} from './layerViewportInset.stylex';

describe('layerViewportInset', () => {
  it('names one documented custom property per viewport edge', () => {
    expect(layerInsetVars).toEqual({
      blockStart: '--astryx-layer-inset-block-start',
      blockEnd: '--astryx-layer-inset-block-end',
      inlineStart: '--astryx-layer-inset-inline-start',
      inlineEnd: '--astryx-layer-inset-inline-end',
    });
  });

  it('adds the edge inset on top of the safe-area gutter, reading 0px when unset', () => {
    expect(layerViewportGutter.blockEnd).toBe(
      'calc(max(var(--spacing-4), env(safe-area-inset-bottom, 0px)) + var(--astryx-layer-inset-block-end, 0px))',
    );
    expect(layerViewportGutter.blockStart).toBe(
      'calc(max(var(--spacing-4), env(safe-area-inset-top, 0px)) + var(--astryx-layer-inset-block-start, 0px))',
    );
    expect(layerViewportGutter.inlineStart).toContain(
      'env(safe-area-inset-left, 0px)) + var(--astryx-layer-inset-inline-start, 0px)',
    );
    expect(layerViewportGutter.inlineEnd).toContain(
      'env(safe-area-inset-right, 0px)) + var(--astryx-layer-inset-inline-end, 0px)',
    );
  });

  it('reserves the larger inline inset when the edge is decided at paint time', () => {
    expect(layerViewportGutter.inline).toBe(
      'calc(max(var(--spacing-4), env(safe-area-inset-left, 0px), env(safe-area-inset-right, 0px)) + max(var(--astryx-layer-inset-inline-start, 0px), var(--astryx-layer-inset-inline-end, 0px)))',
    );
  });

  it('keeps the insets in the env()-less fallbacks', () => {
    for (const edge of Object.keys(
      layerViewportGutterFallback,
    ) as (keyof typeof layerViewportGutterFallback)[]) {
      expect(layerViewportGutterFallback[edge]).not.toContain('env(');
      expect(layerViewportGutterFallback[edge]).toContain(
        '--astryx-layer-inset-',
      );
    }
  });
});
