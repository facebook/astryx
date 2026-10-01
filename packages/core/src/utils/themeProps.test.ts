// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {themeDataAttributes, themeProps} from './themeProps';

describe('themeProps', () => {
  it('returns the stable target class for a component', () => {
    expect(themeProps('card').className).toBe('astryx-card');
  });

  it('continues to emit released bare prop and state classes through 0.7.0', () => {
    expect(
      themeProps('button', {variant: 'secondary', size: 'sm'}).className,
    ).toBe('astryx-button secondary sm');
    expect(themeProps('switch', {checked: 'checked'}).className).toBe(
      'astryx-switch checked',
    );
  });

  it('prefixes numeric compatibility classes with the prop name', () => {
    expect(themeProps('heading', {level: 1}).className).toBe(
      'astryx-heading level-1',
    );
    expect(themeProps('heading', {level: '3'}).className).toBe(
      'astryx-heading level-3',
    );
  });

  it('skips nullish compatibility classes', () => {
    expect(
      themeProps('button', {variant: 'primary', size: undefined}).className,
    ).toBe('astryx-button primary');
  });

  it('continues to emit deprecated target-name aliases when requested', () => {
    expect(
      themeProps(
        'progress-bar',
        {variant: 'positive'},
        {legacyNames: ['progressbar']},
      ).className,
    ).toBe('astryx-progress-bar positive astryx-progressbar');
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

  it('returns compatibility classes and canonical data attributes together', () => {
    expect(themeProps('button', {variant: 'primary', size: 'sm'})).toEqual({
      className: 'astryx-button primary sm',
      'data-variant': 'primary',
      'data-size': 'sm',
    });
  });
});
