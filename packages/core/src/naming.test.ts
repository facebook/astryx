// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {
  NAMESPACE,
  classPrefix,
  dataAttrNamespace,
  cssVarNamespace,
  stableClassName,
  dataAttr,
  cssVar,
} from './naming';

describe('naming constants', () => {
  it('exposes the namespace prefix', () => {
    expect(NAMESPACE).toBe('astryx');
  });

  it('derives per-surface prefixes from the namespace', () => {
    expect(classPrefix).toBe('astryx');
    expect(dataAttrNamespace).toBe('astryx');
    expect(cssVarNamespace).toBe('astryx');
  });
});

describe('stableClassName', () => {
  it('builds namespace class tokens', () => {
    expect(stableClassName('button')).toBe('astryx-button');
    expect(stableClassName('card')).toBe('astryx-card');
  });
});

describe('dataAttr', () => {
  it('builds namespace data attribute names', () => {
    expect(dataAttr('theme')).toBe('data-astryx-theme');
    expect(dataAttr('media')).toBe('data-astryx-media');
  });
});

describe('cssVar', () => {
  it('builds namespace custom property names', () => {
    expect(cssVar('card-padding')).toBe('--astryx-card-padding');
  });
});
