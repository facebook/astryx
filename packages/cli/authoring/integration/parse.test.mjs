// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated tests for `parseIntegration` — the load-boundary validator for
 * `astryx.integration.*`. Zod is sealed inside the parser; these exercise the
 * public contract (validated value out / readable error thrown) with the same
 * accept/reject set the old `AstryxIntegrationSchema` had.
 */

import {describe, it, expect} from 'vitest';
import {parseIntegration} from './parse.mjs';
import {integrationSchema, unknownIntegrationKeys} from './schema.mjs';

/** Run parseIntegration and return the thrown message (asserting it throws). */
function reason(value, label = 'integration') {
  try {
    parseIntegration(value, label);
  } catch (err) {
    return err instanceof Error ? err.message : String(err);
  }
  throw new Error('expected parseIntegration to throw');
}

describe('parseIntegration (load boundary)', () => {
  it('accepts an empty manifest and a valid one', () => {
    expect(parseIntegration({})).toEqual({});
    expect(parseIntegration({components: './src'})).toEqual({
      components: './src',
    });
    expect(parseIntegration({docs: './docs'})).toEqual({docs: './docs'});
    expect(() =>
      parseIntegration({components: './c', issuesUrl: 'https://example.com/i'}),
    ).not.toThrow();
  });

  it('ignores a key it does not know, and keeps the rest of the manifest', () => {
    // A key from a NEWER CLI is the common case, not an authoring mistake: the
    // integration is published once and installed against many CLI versions.
    // Rejecting the manifest took the whole package's contributions down with
    // it, silently, on every older consumer (#5119).
    expect(parseIntegration({components: './src', futureRoot: './future'})).toEqual({
      components: './src',
    });
    expect(unknownIntegrationKeys({components: './src', futureRoot: './future'})).toEqual([
      'futureRoot',
    ]);
    expect(unknownIntegrationKeys({components: './src'})).toEqual([]);
    // Not a manifest at all — nothing to report, and the parser owns the error.
    expect(unknownIntegrationKeys(null)).toEqual([]);
    expect(unknownIntegrationKeys([1, 2])).toEqual([]);
  });

  it('reports no known key as unknown, whatever the schema grows', () => {
    // The census is read off the schema, so this holds for keys that do not
    // exist yet. A hand-maintained list would pass today and start warning
    // falsely about a supported field the day someone forgot to update it.
    const everyKnownKey = Object.fromEntries(
      Object.keys(integrationSchema.shape).map(key => [key, './x']),
    );
    expect(unknownIntegrationKeys(everyKnownKey)).toEqual([]);
  });

  it('still rejects a known key of the wrong type', () => {
    // The relaxation is about keys this CLI has never heard of. A key it DOES
    // know, holding the wrong type, is a real authoring mistake.
    expect(reason({components: 42})).toContain('components');
  });

  it('rejects a non-URL issuesUrl', () => {
    expect(reason({issuesUrl: 'nope'})).toContain('issuesUrl');
  });
});
