// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx discover` against an integration whose manifest fails to load.
 *
 * A manifest authored against a removed API throws on import, contributes
 * nothing, and used to leave discover reporting "No integrations configured."
 * — the package simply vanished. These drive the real CLI in-process against a
 * hermetic project (astryx.config.mjs + a throwing astryx.integration.mjs under
 * node_modules) and pin the loud behavior.
 */

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {runCli} from '../../../test-utils/run-cli.mjs';

let tmpDir;
let project;

/**
 * Configure `@test/broken` with a manifest that throws at import. Calling an
 * undeclared factory stands in for the real failure this came from: a 0.2.x
 * manifest still calling `createIntegration`, which 0.3.0 removed.
 */
function buildBrokenIntegration() {
  const intDir = path.join(project, 'node_modules', '@test', 'broken');
  fs.mkdirSync(path.join(intDir, 'components'), {recursive: true});
  fs.writeFileSync(
    path.join(intDir, 'package.json'),
    JSON.stringify({name: '@test/broken', version: '1.2.3'}),
  );
  fs.writeFileSync(
    path.join(intDir, 'astryx.integration.mjs'),
    `export default createIntegration({components: './components'});\n`,
  );
  fs.writeFileSync(
    path.join(project, 'astryx.config.mjs'),
    `export default {integrations: ['@test/broken']};\n`,
  );
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-discover-broken-'));
  project = path.join(tmpDir, 'project');
  fs.mkdirSync(project, {recursive: true});
  fs.writeFileSync(
    path.join(project, 'package.json'),
    JSON.stringify({name: 'proj', version: '1.0.0'}),
  );
  buildBrokenIntegration();
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('astryx discover with a manifest that fails to load', () => {
  it('warns on stderr and does not claim nothing is configured', async () => {
    const {status, stdout, stderr} = await runCli(['discover'], {cwd: project});

    expect(status).toBe(0);
    expect(stderr).toContain(
      'Warning: @test/broken has 1 integration issue(s). ' +
        'Run: astryx validate-integration @test/broken',
    );
    expect(stdout).not.toContain('No integrations configured.');
    expect(stdout).toContain('No external components found in configured integrations.');
  });

  it('reports meta.configured=true in --json, with the nudge suppressed', async () => {
    const {status, stdout, stderr} = await runCli(['discover', '--json'], {
      cwd: project,
    });

    expect(status).toBe(0);
    expect(JSON.parse(stdout).meta).toEqual({configured: true});
    expect(stderr).not.toContain('integration issue');
  });
});
