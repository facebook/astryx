// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `build "<idea>"` text output names only fields the `build.kit`
 * envelope carries — on the kit itself or on its entries.
 */

import {describe, it, expect} from 'vitest';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {runCli} from '../../../test-utils/run-cli.mjs';

// Run against the monorepo root so @astryxdesign/core is discoverable.
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const SLOW = 60_000;

describe('build kit text fields mirror the JSON keys', () => {
  it('prints no field the envelope lacks', async () => {
    const json = await runCli(['build', 'analytics dashboard', '--json', '--verbose'], REPO);
    expect(json.status).toBe(0);
    const {data} = JSON.parse(json.stdout);
    const keys = new Set([
      ...Object.keys(data),
      ...[...data.pages, ...data.blocks, ...data.domain].flatMap(e => Object.keys(e)),
    ]);

    const human = await runCli(['build', 'analytics dashboard', '--verbose'], REPO);
    expect(human.status).toBe(0);
    const fields = [
      ...new Set(
        human.stdout
          .split('\n')
          .map(line => /^([A-Za-z]+):\s/.exec(line)?.[1])
          .filter(Boolean),
      ),
    ];
    expect(fields).toContain('frame');
    for (const field of fields) expect(keys).toContain(field);
  }, SLOW);
});
