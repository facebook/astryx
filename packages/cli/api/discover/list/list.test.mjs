// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated unit tests for the discover.list leaf. The leaf is a pure
 * projection of already-resolved packages, so these need no filesystem.
 */

import {describe, it, expect} from 'vitest';
import {list} from './list.mjs';

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

describe('discover.list leaf', () => {
  it('projects packages into list entries (no meta when non-empty)', () => {
    const res = list(
      [pkg('@acme/widgets', ['Alpha', 'Beta'], {version: '1.2.3'})],
      {configured: true},
    );
    expect(res.type).toBe('discover.list');
    expect(res.meta).toBeUndefined();
    expect(res.data).toEqual([
      {
        name: '@acme/widgets',
        category: '@acme/widgets',
        components: ['Alpha', 'Beta'],
        version: '1.2.3',
      },
    ]);
  });

  it('returns the configured:true empty envelope when nothing was discovered', () => {
    const res = list([], {configured: true});
    expect(res).toEqual({
      type: 'discover.list',
      data: [],
      meta: {configured: true},
    });
  });

  it('returns the configured:false empty envelope when nothing is configured', () => {
    const res = list([], {configured: false});
    expect(res).toEqual({
      type: 'discover.list',
      data: [],
      meta: {configured: false},
    });
  });
});
