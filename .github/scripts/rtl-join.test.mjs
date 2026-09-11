// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {evaluateRtlJoin} from './rtl-join.mjs';

describe('RTL matrix join', () => {
  it.each([
    ['success', 'success', true, true],
    ['success', 'failure', true, false],
    ['success', 'cancelled', true, false],
    ['success', 'skipped', true, false],
    ['success', 'skipped', false, true],
    ['success', 'success', false, false],
    ['failure', 'skipped', false, false],
    ['cancelled', 'skipped', false, false],
    ['skipped', 'skipped', false, false],
  ])(
    'classification=%s shards=%s shouldRun=%s -> ok=%s',
    (checkComponentsResult, shardResult, shouldRun, ok) => {
      expect(
        evaluateRtlJoin({checkComponentsResult, shardResult, shouldRun}),
      ).toMatchObject({ok});
    },
  );

  it('names classification failure before considering empty scope outputs', () => {
    expect(
      evaluateRtlJoin({
        checkComponentsResult: 'failure',
        shardResult: 'skipped',
        shouldRun: false,
      }),
    ).toEqual({
      ok: false,
      message: 'component classification did not succeed: failure',
    });
  });
});
