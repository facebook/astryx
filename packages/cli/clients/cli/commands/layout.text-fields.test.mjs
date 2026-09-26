// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `layout expand` text output names its fields after the JSON keys, so
 * the two views stay greppable against each other.
 */

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {runCli} from '../../../test-utils/run-cli.mjs';

const SLOW = 60_000;

describe('layout expand text fields mirror the JSON keys', () => {
  let cwd;
  beforeEach(() => {
    // Inside the workspace so @astryxdesign/core resolves.
    cwd = fs.mkdtempSync(path.join(process.cwd(), '.xle-text-fields-'));
  });
  afterEach(() => fs.rmSync(cwd, {recursive: true, force: true}));

  it('labels every record field with a key of the layout.expand data', async () => {
    const expr = 'V > B + {not-a-real-block}';
    const json = await runCli(['layout', 'expand', expr, './a', '--loose', '--json'], cwd);
    expect(json.status).toBe(0);
    const {data} = JSON.parse(json.stdout);
    expect(data.todos.length).toBeGreaterThan(0);

    const human = await runCli(['layout', 'expand', expr, './b', '--loose'], cwd);
    expect(human.status).toBe(0);
    const fields = human.stdout
      .split('\n')
      .map(line => /^([A-Za-z]+):\s/.exec(line)?.[1])
      .filter(Boolean);
    expect(fields).toEqual(['componentsUsed', 'todos']);
    for (const field of fields) expect(Object.keys(data)).toContain(field);
  }, SLOW);
});
