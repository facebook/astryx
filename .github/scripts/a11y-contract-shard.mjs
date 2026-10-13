#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Which accessibility contract spec files one release shard runs.
 * @input --shard <i>/<n>; the contract suite as `playwright test --list`
 *   reports it (or, in tests, an already-parsed listing).
 * @output One anchored file pattern per line, for `pnpm test:a11y-contract`.
 * @position Used by the a11y-contracts-shard legs in ci.yml. Playwright's own
 *   `--shard` splits files in path order by test count, so the exhaustive
 *   binding specs (one "every expectation is exercised" test that runs for
 *   minutes) all landed in the last leg. Those files are dealt round-robin
 *   first, then every other file goes to the leg with the fewest tests. Every
 *   listed file is assigned to exactly one leg.
 */

import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';

const EXHAUSTIVE = /^every expectation is exercised/;

/**
 * @param {{suites?: object[]}} listing Playwright JSON reporter output.
 * @returns {{file: string, tests: number, exhaustive: boolean}[]} in path order
 */
export function contractFiles(listing) {
  /** @type {Map<string, {file: string, tests: number, exhaustive: boolean}>} */
  const files = new Map();
  const visit = (suite, file) => {
    const owner = suite.file ?? file;
    for (const spec of suite.specs ?? []) {
      const entry = files.get(spec.file ?? owner) ?? {
        file: spec.file ?? owner,
        tests: 0,
        exhaustive: false,
      };
      entry.tests += (spec.tests ?? []).length || 1;
      entry.exhaustive ||= EXHAUSTIVE.test(spec.title ?? '');
      files.set(entry.file, entry);
    }
    for (const child of suite.suites ?? []) visit(child, owner);
  };
  for (const suite of listing.suites ?? []) visit(suite, suite.file);
  return [...files.values()].sort((a, b) => a.file.localeCompare(b.file));
}

/**
 * @param {{file: string, tests: number, exhaustive: boolean}[]} files
 * @param {number} count
 * @returns {string[][]} each leg's files, in path order
 */
export function partitionContractFiles(files, count) {
  const legs = Array.from({length: count}, () => ({files: [], tests: 0}));
  files
    .filter(entry => entry.exhaustive)
    .forEach((entry, index) => {
      const leg = legs[index % count];
      leg.files.push(entry.file);
      leg.tests += entry.tests;
    });
  for (const entry of files.filter(item => !item.exhaustive)) {
    const leg = legs.reduce((least, next) => (next.tests < least.tests ? next : least));
    leg.files.push(entry.file);
    leg.tests += entry.tests;
  }
  return legs.map(leg => leg.files.sort());
}

/** An exact, anchored pattern for one file (Playwright filters are regexes). */
export function filePattern(file) {
  return `${file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`;
}

function parseShard(value) {
  const match = /^(\d+)\/(\d+)$/.exec(value ?? '');
  const index = match ? Number(match[1]) : NaN;
  const count = match ? Number(match[2]) : NaN;
  if (!Number.isInteger(index) || !Number.isInteger(count) || index < 1 || index > count) {
    throw new Error(`--shard must be <index>/<count>, got ${value ?? 'nothing'}`);
  }
  return {index, count};
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const shard = parseShard(args[args.indexOf('--shard') + 1]);
  const listing = JSON.parse(
    execFileSync(
      'npx',
      ['playwright', 'test', '--config', 'playwright.config.ts', '--project', 'chromium', '--list', '--reporter=json'],
      {encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'inherit']},
    ),
  );
  const files = contractFiles(listing);
  if (files.length === 0) throw new Error('The contract suite lists no spec files.');
  const legs = partitionContractFiles(files, shard.count);
  const mine = legs[shard.index - 1];
  if (mine.length === 0) throw new Error(`Contract shard ${shard.index}/${shard.count} has no files.`);
  console.error(
    `Contract shard ${shard.index}/${shard.count}: ${mine.length} of ${files.length} files`,
  );
  process.stdout.write(`${mine.map(filePattern).join('\n')}\n`);
}
