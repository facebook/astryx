// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated tests for `parseIntegration` — the load-boundary validator for
 * `astryx.integration.*`. Zod is sealed inside the parser; these exercise the
 * public contract (validated value out / readable error thrown) with the same
 * accept/reject set the old `AstryxIntegrationSchema` had.
 */

import {describe, it, expect} from 'vitest';
import {parseIntegration} from './parse.mjs';

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

  it('rejects unknown keys (strict)', () => {
    expect(reason({name: '@acme/widgets'})).toContain('Unrecognized key');
  });

  it('rejects a non-URL issuesUrl', () => {
    expect(reason({issuesUrl: 'nope'})).toContain('issuesUrl');
  });
});
