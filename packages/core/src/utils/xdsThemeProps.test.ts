// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {xdsThemeDataAttributes, xdsThemeProps} from './xdsThemeProps';

describe('xdsThemeProps', () => {
  it('returns base class for component', () => {
    expect(xdsThemeProps('card').className).toBe('xds-card');
  });

  it('adds variant classes', () => {
    expect(
      xdsThemeProps('button', {variant: 'secondary', size: 'sm'}).className,
    ).toBe('xds-button secondary sm');
  });

  it('prefixes numeric values with prop name', () => {
    expect(xdsThemeProps('heading', {level: 1}).className).toBe(
      'xds-heading level-1',
    );
  });

  it('skips null and undefined props', () => {
    expect(
      xdsThemeProps('button', {variant: 'primary', size: undefined}).className,
    ).toBe('xds-button primary');
  });

  it('works with no props', () => {
    expect(xdsThemeProps('divider').className).toBe('xds-divider');
  });

  it('handles string numeric values', () => {
    expect(xdsThemeProps('heading', {level: '3'}).className).toBe(
      'xds-heading level-3',
    );
  });

  it('reflects visual props as data attributes', () => {
    expect(
      xdsThemeDataAttributes({variant: 'secondary', size: 'sm', level: 2}),
    ).toEqual({
      'data-variant': 'secondary',
      'data-size': 'sm',
      'data-level': '2',
    });
  });

  it('kebab-cases data attribute names', () => {
    expect(xdsThemeDataAttributes({listStyle: 'ordered'})).toEqual({
      'data-list-style': 'ordered',
    });
  });

  it('omits nullish data attributes', () => {
    expect(xdsThemeDataAttributes({variant: 'primary', size: null})).toEqual({
      'data-variant': 'primary',
    });
  });

  it('returns class and data attributes together', () => {
    expect(xdsThemeProps('button', {variant: 'primary', size: 'sm'})).toEqual({
      className: 'xds-button primary sm',
      'data-variant': 'primary',
      'data-size': 'sm',
    });
  });
});
