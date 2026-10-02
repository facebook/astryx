// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {docs} from './docs.mjs';

const SLOW = 60_000;

/**
 * @param {import('./docs.type.mjs').DocsTreeNode} node
 * @param {string} route
 * @returns {import('./docs.type.mjs').DocsTreeNode | undefined}
 */
function findRoute(node, route) {
  if (node.route === route) return node;
  for (const slot of node.slots) {
    for (const child of slot.children) {
      const found = findRoute(child, route);
      if (found) return found;
    }
  }
  return undefined;
}

describe('docs() namespace flattening', () => {
  it('returns every descendant with its full body in tree order', async () => {
    const result = await docs('cli/api', undefined, {flatten: true});

    expect(result.type).toBe('docs.tree');
    expect(result.data).toMatchObject({
      route: 'cli/api',
      kind: 'namespace',
    });
    expect(result.data.slots.flatMap(slot => slot.children.map(child => child.route))).toEqual([
      'cli/api/functions',
      'cli/api/schemas',
      'cli/api/enums',
    ]);

    const search = findRoute(result.data, 'cli/api/functions/search');
    expect(search).toMatchObject({kind: 'function', title: 'search()'});
    expect(JSON.stringify(search?.content)).toContain(
      '`astryx search` runs it. Read it with `astryx docs cli/commands/search`.',
    );
  }, SLOW);

  it('rejects every flatten request that would otherwise do nothing', async () => {
    await expect(docs(undefined, undefined, {flatten: true})).rejects.toMatchObject({
      code: 'ERR_INVALID_ARGUMENT',
    });
    await expect(
      docs('does-not-exist', undefined, {flatten: true}),
    ).rejects.toMatchObject({
      code: 'ERR_UNKNOWN_TOPIC',
      message: expect.stringContaining('Unknown topic'),
    });
    await expect(docs('theme', undefined, {flatten: true})).rejects.toMatchObject({
      code: 'ERR_INVALID_ARGUMENT',
    });
    await expect(
      docs('cli/api/functions/search', undefined, {flatten: true}),
    ).rejects.toMatchObject({code: 'ERR_INVALID_ARGUMENT'});
    await expect(
      docs('cli/api', undefined, {flatten: true, index: true}),
    ).rejects.toMatchObject({code: 'ERR_INVALID_ARGUMENT'});
    await expect(docs('cli/api', 'functions', {flatten: true})).rejects.toMatchObject({
      code: 'ERR_INVALID_ARGUMENT',
    });
  }, SLOW);
});
