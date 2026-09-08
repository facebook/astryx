// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CLI coverage for the structured result summary on DebugEvent.
 *
 * @input real search and build command responses
 * @output result counts, kinds, empty-state, and direct-match telemetry
 * @position packages/cli/clients/cli/commands — debug result integration
 */

import {afterEach, describe, expect, it} from 'vitest';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {runCli} from '../../../test-utils/run-cli.mjs';
import {
  begin,
  finish,
  resetRecorder,
  setEventHandler,
} from '../../../foundation/debug/recorder.mjs';

const REPO = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../../..',
);
const SLOW = 30_000;

/** @param {string[]} args */
async function runWithDebug(args) {
  resetRecorder();
  begin({argv: args, cliVersion: 'test'});
  const run = await runCli(args, REPO);
  /** @type {any[]} */
  const events = [];
  setEventHandler(event => events.push(event));
  finish({exitCode: run.status});
  expect(events).toHaveLength(1);
  return {run, event: events[0]};
}

afterEach(() => resetRecorder());

describe('DebugEvent result summary', () => {
  it(
    'distinguishes a successful search with no results',
    async () => {
      const {event} = await runWithDebug([
        'search',
        'zzqqxx_definitely_no_match',
      ]);
      expect(event.outcome).toBe('ok');
      expect(event.output).toMatchObject({
        resultCount: 0,
        emptyResult: true,
        resultKind: null,
        directMatch: null,
      });
    },
    SLOW,
  );

  it(
    'records the match total, not the --limit cap, for a filtered search',
    async () => {
      const {run, event} = await runWithDebug([
        '--json',
        'search',
        'button',
        '--type',
        'component',
        '--limit',
        '2',
      ]);
      const response = JSON.parse(run.stdout);
      // The regression: the recorded count was the length of the LIMITED list,
      // so every capped run filed "2" and no usage query could tell a query
      // that matched twice from one that matched fifty.
      expect(response.data.results).toHaveLength(2);
      expect(response.data.matchCount).toBeGreaterThan(2);
      expect(event.output).toMatchObject({
        resultCount: response.data.matchCount,
        emptyResult: false,
        resultKind: 'component',
        directMatch: null,
      });
    },
    SLOW,
  );

  it(
    'records build count, kind, and direct-match state',
    async () => {
      const {run, event} = await runWithDebug(['--json', 'build', 'dashboard']);
      const response = JSON.parse(run.stdout);
      const results = [
        ...response.data.pages,
        ...response.data.blocks,
        ...response.data.domain,
      ];
      const domains = new Set(results.map(result => result.domain));
      const resultKind =
        domains.size === 0
          ? null
          : domains.size === 1
            ? domains.values().next().value
            : 'mixed';
      expect(event.output).toMatchObject({
        resultCount: response.data.matchCount,
        emptyResult: !response.data.hasResults,
        resultKind,
        directMatch: response.data.directMatch,
      });
    },
    SLOW,
  );

  it(
    'keeps text build nonempty when raw matches are filtered from the kit',
    async () => {
      const {run, event} = await runWithDebug([
        'build',
        'color',
        '--type',
        'doc',
      ]);
      expect(run.status).toBe(0);
      expect(run.stdout).toContain('Build kit for');
      expect(event.output).toMatchObject({
        emptyResult: false,
        resultKind: null,
        directMatch: false,
      });
      expect(event.output.resultCount).toBeGreaterThan(0);
    },
    SLOW,
  );
});
