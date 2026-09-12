// Copyright (c) Meta Platforms, Inc. and affiliates.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {countShardReports, evaluateRtlJoin} from './rtl-join.mjs';

describe('RTL matrix join', () => {
  it.each([
    ['success', 'success', true, 1, true],
    ['success', 'success', true, 0, false],
    ['success', 'failure', true, 1, false],
    ['success', 'cancelled', true, 1, false],
    ['success', 'skipped', true, 0, false],
    ['success', 'skipped', false, 0, true],
    ['success', 'success', false, 1, false],
    ['failure', 'skipped', false, 0, false],
    ['cancelled', 'skipped', false, 0, false],
    ['skipped', 'skipped', false, 0, false],
  ])(
    'classification=%s shards=%s shouldRun=%s reports=%i -> ok=%s',
    (checkComponentsResult, shardResult, shouldRun, reportCount, ok) => {
      expect(
        evaluateRtlJoin({
          checkComponentsResult,
          shardResult,
          shouldRun,
          reportCount,
        }),
      ).toMatchObject({ok});
    },
  );

  it('rejects all-skipped shards when trusted scope requires work', () => {
    expect(
      evaluateRtlJoin({
        checkComponentsResult: 'success',
        shardResult: 'success',
        shouldRun: true,
        reportCount: 0,
      }),
    ).toEqual({
      ok: false,
      message: 'RTL scope required work, but every package shard skipped.',
    });
  });

  it('counts nested package report artifacts for the all-skipped guard', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rtl-join-reports-'));
    try {
      fs.mkdirSync(path.join(dir, 'rtl-audit-report-charts'));
      fs.mkdirSync(path.join(dir, 'unrelated'));
      fs.writeFileSync(
        path.join(dir, 'rtl-audit-report-charts', 'rtl-audit-report.json'),
        '{}',
      );
      fs.writeFileSync(
        path.join(dir, 'unrelated', 'notes.txt'),
        'not a report',
      );
      expect(countShardReports(dir)).toBe(1);
      expect(countShardReports(path.join(dir, 'missing'))).toBe(0);
    } finally {
      fs.rmSync(dir, {recursive: true, force: true});
    }
  });

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
