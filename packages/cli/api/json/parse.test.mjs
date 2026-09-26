// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated tests for parse.mjs — the CONSUMER-FACING JSON helpers
 * exported as `@astryxdesign/cli/json`. These lock the contract downstream
 * consumers depend on:
 *   - parseResponse JSON-parses a string but passes a non-string through
 *     by reference (idempotent on already-parsed envelopes),
 *   - parseResponse propagates a SyntaxError on malformed JSON,
 *   - isError is a safe type-guard that is true only for objects carrying an
 *     `error` key (never throws on null/undefined/primitives),
 *   - assertResponse returns the envelope on a type match, throws the CLI's
 *     error string on an error envelope, and throws a descriptive message on
 *     a type mismatch.
 */

import {describe, it, expect} from 'vitest';
import {parseResponse, isError, assertResponse} from './parse.mjs';

describe('parseResponse', () => {
  it('parses a JSON string into an object', () => {
    expect(parseResponse('{"type":"t","data":1}')).toEqual({
      type: 't',
      data: 1,
    });
  });

  it('passes a non-string value through by reference (idempotent)', () => {
    const already = {type: 't', data: 1};
    expect(parseResponse(already)).toBe(already);
    expect(parseResponse(null)).toBeNull();
  });

  it('throws a SyntaxError on malformed JSON', () => {
    expect(() => parseResponse('{not json')).toThrow(SyntaxError);
  });
});

describe('isError', () => {
  it('is true only for an object with an `error` key', () => {
    expect(isError({error: 'boom'})).toBe(true);
    expect(isError({type: 'ok'})).toBe(false);
  });

  it('never throws on null / undefined / primitives', () => {
    expect(isError(null)).toBe(false);
    expect(isError(undefined)).toBe(false);
    expect(isError('error')).toBe(false);
    expect(isError(5)).toBe(false);
    expect(isError(true)).toBe(false);
  });
});

describe('assertResponse', () => {
  it('returns the parsed envelope when the type matches', () => {
    expect(assertResponse('{"type":"foo","data":42}', 'foo')).toEqual({
      type: 'foo',
      data: 42,
    });
  });

  it('accepts an already-parsed object', () => {
    const env = {type: 'foo', data: 1};
    expect(assertResponse(env, 'foo')).toBe(env);
  });

  it('throws the CLI error string on an error envelope', () => {
    expect(() => assertResponse('{"error":"boom"}', 'foo')).toThrow('boom');
  });

  it('throws a descriptive message on a type mismatch', () => {
    expect(() => assertResponse('{"type":"bar"}', 'foo')).toThrow(
      'Expected type "foo", got "bar"',
    );
  });
});
