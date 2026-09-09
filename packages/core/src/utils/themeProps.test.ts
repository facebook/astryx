// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {themeDataAttributes, themeProps} from './themeProps';

describe('themeProps', () => {
  it('returns the stable target class for a component', () => {
    expect(themeProps('card').className).toBe('astryx-card');
  });

  it('does not emit bare prop-value classes', () => {
    expect(
      themeProps('button', {variant: 'secondary', size: 'sm'}).className,
    ).toBe('astryx-button');
    expect(themeProps('heading', {level: 1}).className).toBe('astryx-heading');
  });

  it('continues to emit deprecated target-name aliases when requested', () => {
    expect(
      themeProps('progress-bar', undefined, {
        legacyNames: ['progressbar'],
      }).className,
    ).toBe('astryx-progress-bar astryx-progressbar');
  });

  it('reflects visual props as data attributes', () => {
    expect(
      themeDataAttributes({variant: 'secondary', size: 'sm', level: 2}),
    ).toEqual({
      'data-variant': 'secondary',
      'data-size': 'sm',
      'data-level': '2',
    });
  });

  it('kebab-cases data attribute names', () => {
    expect(themeDataAttributes({listStyle: 'ordered'})).toEqual({
      'data-list-style': 'ordered',
    });
  });

  it('omits nullish data attributes', () => {
    expect(themeDataAttributes({variant: 'primary', size: null})).toEqual({
      'data-variant': 'primary',
    });
  });

  it('returns the target class and data attributes together', () => {
    expect(themeProps('button', {variant: 'primary', size: 'sm'})).toEqual({
      className: 'astryx-button',
      'data-variant': 'primary',
      'data-size': 'sm',
    });
  });
});
