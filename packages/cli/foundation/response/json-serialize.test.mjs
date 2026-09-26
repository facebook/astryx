// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Supplemental unit tests for lib/json.mjs — serialization-failure
 * discipline.
 *
 * json-contract.test.mjs already locks envelope shape, apiVersion stamping,
 * humanLog/humanWarn suppression, and the toErrorEnvelope code/suggestions
 * rules. This file adds the case that guards the contract when serialization
 * itself can fail:
 *
 *   jsonOut() must SERIALIZE before it marks the emission handled. If
 *   JSON.stringify throws (a circular reference or a BigInt in `data` — an
 *   author bug in a command's return value), the process-wide
 *   `__xdsJsonHandled` flag must remain UNSET, so the bin error boundary is
 *   still free to emit a JSON error envelope. If the flag were set first, the
 *   boundary would go silent and a --json consumer would get EMPTY stdout with
 *   exit 1 — an unparseable non-envelope.
 */

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {jsonOut} from './json.mjs';

describe('jsonOut — serialization-failure discipline', () => {
  beforeEach(() => {
    process.__xdsJsonHandled = false;
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
    process.__xdsJsonHandled = false;
  });

  it('does NOT print when data has a circular reference', () => {
    const circular = {};
    circular.self = circular;
    expect(() => jsonOut({type: 'x', data: circular})).toThrow(/circular/i);
    expect(console.log).not.toHaveBeenCalled();
  });

  it('leaves __xdsJsonHandled unset when serialization throws (boundary can still emit)', () => {
    const circular = {};
    circular.self = circular;
    try {
      jsonOut({type: 'x', data: circular});
    } catch {
      /* expected */
    }
    expect(process.__xdsJsonHandled).toBe(false);
  });

  it('leaves __xdsJsonHandled unset when data contains a BigInt', () => {
    try {
      jsonOut({type: 'x', data: {n: 10n}});
    } catch {
      /* expected: BigInt is not JSON-serializable */
    }
    expect(process.__xdsJsonHandled).toBe(false);
  });

  it('marks handled and prints on a successful emission', () => {
    jsonOut({type: 'ok', data: {a: 1}});
    expect(process.__xdsJsonHandled).toBe(true);
    expect(console.log).toHaveBeenCalledTimes(1);
  });
});
