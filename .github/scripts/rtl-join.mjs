#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

/**
 * @file Fail-closed join policy for the pull-request RTL package matrix.
 * @input --check-components <result> --shards <result> --should-run <boolean>
 *   --reports-dir <path>
 * @output A successful exit only when classification succeeded and every
 *   applicable shard succeeded (or every shard correctly skipped).
 * @position Stable `pr-rtl` required-context join.
 */

export function countShardReports(reportsDir) {
  if (!reportsDir || !fs.existsSync(reportsDir)) return 0;
  let count = 0;
  for (const entry of fs.readdirSync(reportsDir, {withFileTypes: true})) {
    if (entry.isFile() && entry.name === 'rtl-audit-report.json') count += 1;
    if (!entry.isDirectory()) continue;
    count += fs
      .readdirSync(path.join(reportsDir, entry.name), {withFileTypes: true})
      .filter(
        child => child.isFile() && child.name === 'rtl-audit-report.json',
      ).length;
  }
  return count;
}

export function evaluateRtlJoin({
  checkComponentsResult,
  shardResult,
  shouldRun,
  reportCount = 0,
}) {
  if (checkComponentsResult !== 'success') {
    return {
      ok: false,
      message: `component classification did not succeed: ${checkComponentsResult}`,
    };
  }
  if (shouldRun) {
    if (shardResult !== 'success') {
      return {
        ok: false,
        message: `RTL package shards did not all succeed: ${shardResult}`,
      };
    }
    return reportCount > 0
      ? {
          ok: true,
          message: 'All applicable RTL package shards produced reports.',
        }
      : {
          ok: false,
          message: 'RTL scope required work, but every package shard skipped.',
        };
  }
  return shardResult === 'skipped'
    ? {
        ok: true,
        message: 'No RTL-owned scope; package shards correctly skipped.',
      }
    : {
        ok: false,
        message: `RTL shards unexpectedly ran for an out-of-scope change: ${shardResult}`,
      };
}

function arg(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : null;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const result = evaluateRtlJoin({
    checkComponentsResult: arg('check-components'),
    shardResult: arg('shards'),
    shouldRun: arg('should-run') === 'true',
    reportCount: countShardReports(arg('reports-dir')),
  });
  (result.ok ? console.log : console.error)(result.message);
  if (!result.ok) process.exitCode = 1;
}
