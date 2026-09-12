#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

import fs from 'node:fs';
import {pathToFileURL} from 'node:url';

/**
 * @file Hard completion contract for one RTL package-shard report.
 * @input --report <path> --package <canonical-name> --filter <csv-or-empty>
 * @output Exit zero only when requested scope and planned/completed scans match.
 * @position Boundary between soft RTL findings and the required `pr-rtl` join.
 */

function expectedFilters(filter) {
  return (filter ?? '')
    .split(',')
    .map(value => value.trim().toLowerCase())
    .filter(Boolean);
}

export function validateRtlReport(report, {packageName, filter = ''}) {
  const fail = message => ({ok: false, message});
  if (report == null || typeof report !== 'object' || Array.isArray(report)) {
    return fail('RTL shard report is not a JSON object');
  }
  if (
    !Array.isArray(report.scope?.packages) ||
    report.scope.packages.length !== 1 ||
    report.scope.packages[0] !== packageName
  ) {
    return fail(`RTL shard report package does not match ${packageName}`);
  }
  const filters = expectedFilters(filter);
  if (
    !Array.isArray(report.scope?.filters) ||
    JSON.stringify(report.scope.filters) !== JSON.stringify(filters)
  ) {
    return fail('RTL shard report filter scope does not match the request');
  }
  const completion = report.completion;
  if (
    !Number.isInteger(completion?.plannedComponentScans) ||
    completion.plannedComponentScans <= 0 ||
    completion.completedComponentScans !== completion.plannedComponentScans
  ) {
    return fail('RTL component scan count is missing or incomplete');
  }
  if (
    !Number.isInteger(completion?.plannedStoryScans) ||
    completion.plannedStoryScans <= 0 ||
    completion.completedPositionalScans !== completion.plannedStoryScans ||
    completion.completedDecorationScans !== completion.plannedStoryScans
  ) {
    return fail('RTL story scan count is missing, zero, or incomplete');
  }
  if (!Number.isInteger(report.coverage?.total) || report.coverage.total <= 0) {
    return fail('RTL coverage roster is empty');
  }
  if (report.coverage.registryError != null) {
    return fail(
      `RTL coverage registry failed: ${report.coverage.registryError}`,
    );
  }
  return {ok: true, message: `Completed RTL evidence for ${packageName}.`};
}

function arg(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : null;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  let report;
  try {
    report = JSON.parse(fs.readFileSync(arg('report'), 'utf8'));
  } catch (error) {
    console.error(`Could not read RTL shard report: ${error.message}`);
    process.exitCode = 1;
  }
  if (report !== undefined) {
    const result = validateRtlReport(report, {
      packageName: arg('package'),
      filter: arg('filter') ?? '',
    });
    (result.ok ? console.log : console.error)(result.message);
    if (!result.ok) process.exitCode = 1;
  }
}
