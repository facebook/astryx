// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {
  LEGACY_NAMESPACE,
  NAMESPACE,
  classPrefix,
  legacyClassPrefix,
  dataAttrNamespace,
  legacyDataAttrNamespace,
  cssVarNamespace,
  legacyCssVarNamespace,
  stableClassName,
  legacyStableClassName,
  dataAttr,
  legacyDataAttr,
  cssVar,
  legacyCssVar,
} from './naming';

describe('naming constants', () => {
  it('exposes the legacy and new namespace prefixes', () => {
    expect(LEGACY_NAMESPACE).toBe('xds');
    expect(NAMESPACE).toBe('astryx');
  });

  it('derives per-surface prefixes from the namespaces', () => {
    expect(classPrefix).toBe('astryx');
    expect(legacyClassPrefix).toBe('xds');
    expect(dataAttrNamespace).toBe('astryx');
    expect(legacyDataAttrNamespace).toBe('xds');
    expect(cssVarNamespace).toBe('astryx');
    expect(legacyCssVarNamespace).toBe('xds');
  });
});

describe('stableClassName', () => {
  it('builds new-namespace class tokens', () => {
    expect(stableClassName('button')).toBe('astryx-button');
    expect(stableClassName('card')).toBe('astryx-card');
  });

  it('builds legacy class tokens preserving the current contract', () => {
    expect(legacyStableClassName('button')).toBe('xds-button');
    expect(legacyStableClassName('card')).toBe('xds-card');
  });
});

describe('dataAttr', () => {
  it('builds new-namespace data attribute names', () => {
    expect(dataAttr('theme')).toBe('data-astryx-theme');
    expect(dataAttr('media')).toBe('data-astryx-media');
  });

  it('builds legacy data attribute names', () => {
    expect(legacyDataAttr('theme')).toBe('data-xds-theme');
    expect(legacyDataAttr('media')).toBe('data-xds-media');
  });
});

describe('cssVar', () => {
  it('builds new-namespace custom property names', () => {
    expect(cssVar('card-padding')).toBe('--astryx-card-padding');
  });

  it('builds legacy custom property names', () => {
    expect(legacyCssVar('card-padding')).toBe('--xds-card-padding');
  });
});
