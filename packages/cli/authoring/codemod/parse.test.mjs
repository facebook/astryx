// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated tests for `parseCodemod` — the load-boundary validator run
 * against a codemod module's default export during `astryx upgrade`. Zod is
 * sealed inside the parser; authors write a plain object with a `type`
 * discriminant (no factory). Accept/reject set matches the old
 * `CodemodEnvelopeSchema`, including the `isOptional` load-time default.
 */

import {describe, it, expect} from 'vitest';
import {parseCodemod} from './parse.mjs';

/** Run parseCodemod and return the thrown message (asserting it throws). */
function reason(value, label = 'codemod') {
  try {
    parseCodemod(value, label);
  } catch (err) {
    return err instanceof Error ? err.message : String(err);
  }
  throw new Error('expected parseCodemod to throw');
}

describe('parseCodemod (load boundary)', () => {
  it('accepts a code codemod and applies the isOptional default', () => {
    const parsed = parseCodemod({
      type: 'code',
      title: 'Drop foo',
      transform: () => null,
    });
    expect(parsed.type).toBe('code');
    expect(parsed.isOptional).toBe(false);
  });

  it('accepts a code codemod with description, fileExtensions, explicit isOptional', () => {
    const parsed = parseCodemod({
      type: 'code',
      title: 'Rename',
      description: 'renames things',
      isOptional: true,
      fileExtensions: ['.tsx'],
      transform: () => null,
    });
    expect(parsed.isOptional).toBe(true);
    expect(parsed.fileExtensions).toEqual(['.tsx']);
  });

  it('accepts a stamped config codemod', () => {
    const parsed = parseCodemod({
      type: 'config',
      title: 'Bump',
      transform: () => null,
    });
    expect(parsed.type).toBe('config');
  });

  it('rejects a missing title', () => {
    expect(reason({type: 'code', transform: () => null})).toMatch(/title/i);
  });

  it('rejects a missing transform', () => {
    expect(reason({type: 'code', title: 'x'})).toMatch(/transform/i);
  });

  it('rejects a non-function transform', () => {
    expect(reason({type: 'code', title: 'x', transform: 'nope'})).toMatch(
      /transform/i,
    );
  });

  it('rejects a missing/invalid type discriminator', () => {
    expect(() => parseCodemod({title: 'x', transform: () => null})).toThrow();
    expect(() =>
      parseCodemod({type: 'bogus', title: 'x', transform: () => null}),
    ).toThrow();
  });

  it('rejects unknown keys (strict)', () => {
    expect(() =>
      parseCodemod({
        type: 'code',
        title: 'x',
        transform: () => null,
        bogus: true,
      }),
    ).toThrow();
  });

  it('rejects fileExtensions on a config codemod', () => {
    expect(() =>
      parseCodemod({
        type: 'config',
        title: 'x',
        transform: () => null,
        fileExtensions: ['.ts'],
      }),
    ).toThrow();
  });
});
