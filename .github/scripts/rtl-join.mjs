#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

import {pathToFileURL} from 'node:url';

/**
 * @file Fail-closed join policy for the pull-request RTL package matrix.
 * @input --check-components <result> --shards <result> --should-run <boolean>
 * @output A successful exit only when classification succeeded and every
 *   applicable shard succeeded (or every shard correctly skipped).
 * @position Stable `pr-rtl` required-context join.
 */

export function evaluateRtlJoin({
  checkComponentsResult,
  shardResult,
  shouldRun,
}) {
  if (checkComponentsResult !== 'success') {
    return {
      ok: false,
      message: `component classification did not succeed: ${checkComponentsResult}`,
    };
  }
  if (shouldRun) {
    return shardResult === 'success'
      ? {ok: true, message: 'All five canonical RTL package shards succeeded.'}
      : {
          ok: false,
          message: `RTL package shards did not all succeed: ${shardResult}`,
        };
  }
  return shardResult === 'skipped'
    ? {ok: true, message: 'No RTL-owned scope; package shards correctly skipped.'}
    : {
        ok: false,
        message: `RTL shards unexpectedly ran for an out-of-scope change: ${shardResult}`,
      };
}

function arg(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : null;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = evaluateRtlJoin({
    checkComponentsResult: arg('check-components'),
    shardResult: arg('shards'),
    shouldRun: arg('should-run') === 'true',
  });
  (result.ok ? console.log : console.error)(result.message);
  if (!result.ok) process.exitCode = 1;
}
