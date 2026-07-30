// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated unit tests for the discover.detail leaf. The leaf is a pure
 * projection over already-resolved packages, so these need no filesystem.
 */

import {describe, it, expect} from 'vitest';
import {detail} from './detail.mjs';
import {AstryxError} from '../../error.mjs';

/** Build a minimal ScannedPackage for projection tests. */
function pkg(name, components, extra = {}) {
  return {
    name,
    category: name,
    components,
    dir: '/virtual/' + name,
    astryx: {},
    docsDir: '/virtual/' + name + '/docs',
    ...extra,
  };
}

const PACKAGES = [
  pkg('@acme/widgets', ['Alpha', 'Beta'], {version: '1.2.3'}),
  pkg('@acme/gadgets', ['Gamma']),
];

describe('discover.detail leaf', () => {
  it('projects the matched package into a detail entry', () => {
    const res = detail(PACKAGES, '@acme/widgets');
    expect(res.type).toBe('discover.detail');
    expect(res.data).toEqual({
      name: '@acme/widgets',
      category: '@acme/widgets',
      components: ['Alpha', 'Beta'],
      version: '1.2.3',
    });
  });

  it('throws ERR_UNKNOWN_PACKAGE with the available packages as suggestions', () => {
    let err;
    try {
      detail(PACKAGES, '@acme/nope');
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(AstryxError);
    expect(err.code).toBe('ERR_UNKNOWN_PACKAGE');
    expect(err.message).toBe('Package "@acme/nope" not found');
    expect(err.suggestions).toEqual([
      {name: '@acme/widgets', reason: 'available package'},
      {name: '@acme/gadgets', reason: 'available package'},
    ]);
  });
});
