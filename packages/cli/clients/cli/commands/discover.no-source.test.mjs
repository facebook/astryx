// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx discover` when no discover source is configured and no
 * integration provides one.
 *
 * In a fresh public app with no integrations, `discover --available` used to
 * print "No integrations configured. Add integration package names..." — a
 * message that told users to add names they had no way to find. These tests
 * pin the honest replacement.
 */

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {runCli} from '../../../test-utils/run-cli.mjs';

let tmpDir;
let project;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-discover-nosource-'));
  project = path.join(tmpDir, 'project');
  fs.mkdirSync(project, {recursive: true});
  fs.writeFileSync(
    path.join(project, 'package.json'),
    JSON.stringify({name: 'my-app', version: '1.0.0'}),
  );
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('astryx discover --available with no source', () => {
  it('explains what discover sources are and where to find packages', async () => {
    const {status, stdout} = await runCli(['discover', '--available'], {
      cwd: project,
    });

    expect(status).toBe(0);
    expect(stdout).toContain('No discover source is configured.');
    expect(stdout).toContain('discover sources');
    expect(stdout).toContain('npm search @astryxdesign');
    expect(stdout).toContain('docs cli/integrations');
    // Must not show the old misleading message
    expect(stdout).not.toContain('Add integration package names');
  });

  it('returns an empty list with configured=false in --json', async () => {
    const {status, stdout} = await runCli(
      ['discover', '--available', '--json'],
      {cwd: project},
    );

    expect(status).toBe(0);
    const result = JSON.parse(stdout);
    expect(result.type).toBe('discover.list');
    expect(result.data).toEqual([]);
    expect(result.meta).toEqual({configured: false});
  });
});

describe('astryx discover with nothing configured', () => {
  it('shows the config snippet and a pointer to npm and docs', async () => {
    const {status, stdout} = await runCli(['discover'], {cwd: project});

    expect(status).toBe(0);
    expect(stdout).toContain('No integrations configured.');
    expect(stdout).toContain("integrations: ['@scope/your-integration']");
    expect(stdout).toContain('npm search @astryxdesign');
    expect(stdout).toContain('docs cli/integrations');
  });
});
