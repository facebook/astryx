// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file End-to-end probes for the ASTRYX_NO_PROJECT_CODE gate.
 *
 * Unit tests on importUserModule prove the loader refuses; these prove the
 * COMMANDS do — a checkout module plants a global on execution, the real CLI
 * runs against the fixture, and the global must still be unset afterwards.
 * `astryx doctor` (which re-imports the config for its own diagnostics) and
 * `astryx component` (which imports checkout doc modules) each had a loader
 * that bypassed the gate when it was first added.
 */

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {runCli} from '../../../test-utils/run-cli.mjs';

let tmpDir;

beforeEach(() => {
  // Repo-local temp dir: Vite blocks dynamic import from /tmp.
  tmpDir = fs.mkdtempSync(path.join(process.cwd(), '.astryx-no-project-code-'));
  process.env.ASTRYX_NO_PROJECT_CODE = '1';
});

afterEach(() => {
  delete process.env.ASTRYX_NO_PROJECT_CODE;
  delete globalThis.__astryxDoctorProbe;
  delete globalThis.__astryxDocProbe;
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('ASTRYX_NO_PROJECT_CODE end-to-end', () => {
  it('astryx doctor reports the config without executing it', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({name: 'consumer'}),
    );
    fs.writeFileSync(
      path.join(tmpDir, 'astryx.config.mjs'),
      `globalThis.__astryxDoctorProbe = true;\nexport default {integrations: []};\n`,
    );

    const {stdout, stderr} = await runCli(['doctor'], tmpDir);

    expect(globalThis.__astryxDoctorProbe).toBeUndefined();
    expect(`${stdout}\n${stderr}`).toContain('ASTRYX_NO_PROJECT_CODE');
  });

  it('astryx component does not execute a checkout doc module', async () => {
    // A repo-layout checkout: findCoreDir resolves packages/core from cwd, and
    // the doc-view path would import Button.doc.mjs from it.
    const buttonDir = path.join(tmpDir, 'packages', 'core', 'src', 'Button');
    fs.mkdirSync(buttonDir, {recursive: true});
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({name: 'consumer'}),
    );
    fs.writeFileSync(
      path.join(buttonDir, 'Button.doc.mjs'),
      `globalThis.__astryxDocProbe = true;\nexport const docs = {name: 'Button', usage: {description: 'x'}};\n`,
    );

    await runCli(['component', 'Button'], tmpDir);

    expect(globalThis.__astryxDocProbe).toBeUndefined();
  });
});
