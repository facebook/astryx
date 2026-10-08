// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file vegaLiteConfig.test.ts
 * @input Uses vitest, buildVegaLiteConfig and its exported layout constants
 * @output Functional tests for the Astryx-themed Vega-Lite config builder
 * @position Colocated test for vegaLiteConfig.ts
 */

import {describe, it, expect} from 'vitest';
import {
  buildVegaLiteConfig,
  DEFAULT_STROKE_WIDTH,
  DEFAULT_POINT_SIZE,
  DEFAULT_LEGEND_ORIENT,
  LEGEND_OFFSET,
  TITLE_OFFSET,
} from './vegaLiteConfig';

/** Resolver that makes every resolved token traceable to its name. */
const token = (name: string) => `resolved(${name})`;

describe('buildVegaLiteConfig', () => {
  it('resolves chart chrome colors through the provided token resolver', () => {
    const config = buildVegaLiteConfig(token);
    expect(config.axis?.domainColor).toBe('resolved(--color-icon-primary)');
    expect(config.axis?.labelColor).toBe('resolved(--color-text-secondary)');
    expect(config.background).toBe('resolved(--color-background-card)');
    expect(config.text?.color).toBe('resolved(--color-text-primary)');
    expect(config.point?.fill).toBe('resolved(--color-background-card)');
    expect(config.legend?.labelFont).toBe('resolved(--font-family-body)');
    expect(config.title?.subtitleColor).toBe(
      'resolved(--color-text-secondary)',
    );
  });

  it('orders the categorical palette across the ten categorical data tokens', () => {
    const config = buildVegaLiteConfig(token);
    expect(config.range?.category).toEqual([
      'resolved(--color-data-categorical-blue)',
      'resolved(--color-data-categorical-orange)',
      'resolved(--color-data-categorical-purple)',
      'resolved(--color-data-categorical-green)',
      'resolved(--color-data-categorical-pink)',
      'resolved(--color-data-categorical-cyan)',
      'resolved(--color-data-categorical-red)',
      'resolved(--color-data-categorical-teal)',
      'resolved(--color-data-categorical-brown)',
      'resolved(--color-data-categorical-indigo)',
    ]);
  });

  it('builds the diverging range as a blue-to-red ramp around a gray midpoint', () => {
    const config = buildVegaLiteConfig(token);
    expect(config.range?.diverging).toEqual([
      'resolved(--color-data-blue-5)',
      'resolved(--color-data-blue-4)',
      'resolved(--color-data-blue-3)',
      'resolved(--color-data-blue-2)',
      'resolved(--color-data-blue-1)',
      'resolved(--color-data-gray-1)',
      'resolved(--color-data-red-1)',
      'resolved(--color-data-red-2)',
      'resolved(--color-data-red-3)',
      'resolved(--color-data-red-4)',
      'resolved(--color-data-red-5)',
    ]);
    // Sequential ranges are ascending blues.
    expect(config.range?.heatmap).toEqual([
      'resolved(--color-data-blue-1)',
      'resolved(--color-data-blue-2)',
      'resolved(--color-data-blue-3)',
      'resolved(--color-data-blue-4)',
      'resolved(--color-data-blue-5)',
    ]);
  });

  it('serializes concrete custom-theme values without ambient CSS', () => {
    const concreteToken = (name: string): string => {
      if (name === '--color-data-categorical-blue') {
        return '#005A4E';
      }
      if (name.startsWith('--font-family-')) {
        return 'Arial, sans-serif';
      }
      return '#112233';
    };

    const config = buildVegaLiteConfig(concreteToken);
    const roundTripped = JSON.parse(JSON.stringify(config));

    expect(roundTripped).toEqual(config);
    expect(roundTripped.range.category[0]).toBe('#005A4E');
    expect(JSON.stringify(roundTripped)).not.toContain('var(');
  });

  it('rejects CSS references that would make detached output depend on ambient styles', () => {
    expect(() =>
      buildVegaLiteConfig(name =>
        name === '--color-data-categorical-blue'
          ? 'var(--brand-chart)'
          : '#112233',
      ),
    ).toThrow(
      'Vega-Lite config requires a concrete value for --color-data-categorical-blue',
    );
  });

  it('applies the structural mark and layout constants', () => {
    const config = buildVegaLiteConfig(token);
    expect(config.line?.strokeWidth).toBe(DEFAULT_STROKE_WIDTH);
    expect(config.line?.strokeWidth).toBe(2);
    expect(config.point?.size).toBe(DEFAULT_POINT_SIZE);
    expect(config.point?.size).toBe(64);
    expect(config.legend?.orient).toBe(DEFAULT_LEGEND_ORIENT);
    expect(config.legend?.orient).toBe('right');
    expect(config.legend?.offset).toBe(LEGEND_OFFSET);
    expect(config.legend?.offset).toBe(16);
    expect(config.title?.offset).toBe(TITLE_OFFSET);
    expect(config.title?.offset).toBe(16);
    expect(config.padding).toBe(16);
    expect(config.scale?.bandPaddingInner).toBe(0.1);
    expect(config.view?.stroke).toBeNull();
  });
});
