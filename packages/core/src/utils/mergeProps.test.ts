// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {mergeProps} from './mergeProps';
import {xdsProps} from './xdsClassName';

describe('mergeProps', () => {
  it('preserves xds data attributes while merging classes', () => {
    expect(
      mergeProps(
        xdsProps('button', {variant: 'primary', size: 'sm'}),
        {className: 'stylex-class'},
        'consumer-class',
      ),
    ).toMatchObject({
      className: 'xds-button primary sm stylex-class consumer-class',
      'data-variant': 'primary',
      'data-size': 'sm',
    });
  });

  it('merges StyleX and consumer styles', () => {
    expect(
      mergeProps(
        xdsProps('card', {variant: 'muted'}),
        {className: 'stylex-class', style: {color: 'red', padding: 4}},
        undefined,
        {padding: 8},
      ),
    ).toMatchObject({
      className: 'xds-card muted stylex-class',
      'data-variant': 'muted',
      style: {color: 'red', padding: 8},
    });
  });

  it('supports xdsProps form with className and style positional args', () => {
    expect(
      mergeProps(xdsProps('badge', {variant: 'success'}), 'extra', {
        margin: 4,
      }),
    ).toMatchObject({
      className: 'xds-badge success extra',
      'data-variant': 'success',
      style: {margin: 4},
    });
  });

  it('supports object form with className and style positional args', () => {
    expect(
      mergeProps({className: 'stylex-class', style: {color: 'red'}}, 'extra', {
        color: 'blue',
      }),
    ).toEqual({
      className: 'stylex-class extra',
      style: {color: 'blue'},
    });
  });
});
