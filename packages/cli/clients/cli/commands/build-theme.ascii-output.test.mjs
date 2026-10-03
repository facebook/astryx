// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Human output of the `theme` command group stays plain ASCII.
 *
 * Covers every theme-build line family that carried a glyph or typographic
 * punctuation: success, warning, error, notice, and font-help lines of a
 * standalone build; `--check` in both states; a batch build and check; a
 * family build and check; the quoted-glob suggestion; and a palette preview.
 * Each case also asserts its ASCII marker, so a line that stops printing
 * cannot pass the ASCII check vacuously.
 */

import {describe, it, expect, beforeAll, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {ensureCoreBuilt} from './ensure-core-built.mjs';
import {runCli} from '../../../test-utils/run-cli.mjs';
import {ERROR_CODES} from '../../../foundation/response/error-codes.mjs';

// Under the CLI package so fixtures resolve `@astryxdesign/core/theme`.
const CLI_ROOT = path.resolve(import.meta.dirname, '../../..');

const OCEAN = `import {defineTheme} from '@astryxdesign/core/theme';
export const oceanTheme = defineTheme({
  name: 'ocean',
  typography: {body: {family: 'Inter'}},
  tokens: {'--color-background-body': '#ffffff'},
  components: {
    progressbar: {base: {color: 'red'}},
  },
});
`;
const CALM = `import {defineTheme} from '@astryxdesign/core/theme';
import {oceanTheme} from './ocean.mjs';
export const oceanCalmTheme = defineTheme({
  name: 'ocean-calm',
  extends: oceanTheme,
  tokens: {'--color-background-body': '#eeeeee'},
});
`;
const PRIVATE_VAR = `import {defineTheme} from '@astryxdesign/core/theme';
export const privateVarTheme = defineTheme({
  name: 'private-var',
  components: {
    field: {base: {'--_field-radius': '8px'}},
  },
});
`;

/** @type {string} */
let dir;

beforeAll(() => {
  ensureCoreBuilt();
}, 200_000);

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(CLI_ROOT, '.tmp-theme-ascii-'));
  fs.writeFileSync(path.join(dir, 'package.json'), '{"type":"module"}\n');
  fs.writeFileSync(path.join(dir, 'ocean.mjs'), OCEAN);
  fs.writeFileSync(path.join(dir, 'ocean-calm.mjs'), CALM);
  fs.writeFileSync(path.join(dir, 'private-var.mjs'), PRIVATE_VAR);
});

afterEach(() => {
  fs.rmSync(dir, {recursive: true, force: true});
});

/** @param {{stdout: string, stderr: string}} result */
function nonAscii(result) {
  return [
    ...new Set(`${result.stdout}${result.stderr}`.match(/[\u0080-\uffff]/g)),
  ];
}

/** @param {string[]} args */
function run(args) {
  return runCli(['theme', ...args], dir);
}

describe('theme command human output is plain ASCII', () => {
  it('a successful standalone build: ok, warning, notice, and font help lines', async () => {
    const result = await run(['build', 'ocean.mjs']);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain('[ok] ocean.css');
    expect(result.stderr).toContain('[warn] Deprecated component target');
    expect(result.stdout).toContain('note: Font "Inter"');
    expect(result.stdout).toContain('[note] Theme "ocean" names fonts');
    expect(nonAscii(result)).toEqual([]);
  });

  it('a private-variable error fails before writing outputs in every mode', async () => {
    for (const args of [
      ['build', 'private-var.mjs'],
      ['build', 'private-var.mjs', '--check'],
    ]) {
      const result = await run(args);
      expect(result.code).toBe(1);
      expect(result.stderr).toContain('private var "--_field-radius"');
      expect(nonAscii(result)).toEqual([]);
    }

    const json = await runCli(
      ['--json', 'theme', 'build', 'private-var.mjs'],
      dir,
    );
    expect(json.code).toBe(1);
    const envelope = JSON.parse(json.stdout);
    expect(envelope.code).toBe(ERROR_CODES.ERR_THEME_INVALID);
    expect(envelope.error).toContain('private var "--_field-radius"');

    for (const extension of ['css', 'js', 'd.ts']) {
      expect(fs.existsSync(path.join(dir, `private-var.${extension}`))).toBe(
        false,
      );
    }
  });

  it('--check, up to date and stale', async () => {
    await run(['build', 'ocean.mjs']);
    const upToDate = await run(['build', 'ocean.mjs', '--check']);
    expect(upToDate.code).toBe(0);
    expect(upToDate.stdout).toContain('[ok] Theme outputs are up to date');
    expect(nonAscii(upToDate)).toEqual([]);

    fs.appendFileSync(path.join(dir, 'ocean.css'), '/* drift */\n');
    const stale = await run(['build', 'ocean.mjs', '--check']);
    expect(stale.code).toBe(1);
    expect(stale.stderr).toContain('[fail] 1 theme output(s) are out of date');
    expect(nonAscii(stale)).toEqual([]);
  });

  it('a batch build and check', async () => {
    const built = await run(['build', 'ocean.mjs', 'ocean-calm.mjs']);
    expect(built.code).toBe(0);
    expect(built.stdout).toContain('[ok] Built 2 themes.');
    expect(nonAscii(built)).toEqual([]);

    const checked = await run([
      'build',
      'ocean.mjs',
      'ocean-calm.mjs',
      '--check',
    ]);
    expect(checked.code).toBe(0);
    expect(checked.stdout).toContain('[ok] Checked 2 themes.');
    expect(nonAscii(checked)).toEqual([]);
  });

  it('a family build and a stale family check', async () => {
    const familyArgs = [
      'build',
      '--family',
      'ocean.mjs',
      'ocean-calm.mjs',
      '--family-key',
      'ocean-family',
    ];
    const built = await run(familyArgs);
    expect(built.code).toBe(0);
    expect(built.stdout).toContain('[ok] ocean-family.css');
    expect(nonAscii(built)).toEqual([]);

    fs.rmSync(path.join(dir, 'ocean-family.js'));
    const stale = await run([...familyArgs, '--check']);
    expect(stale.code).toBe(1);
    expect(stale.stderr).toContain('[fail] 1 theme family output(s)');
    expect(nonAscii(stale)).toEqual([]);
  });

  it('the suggestion for a quoted glob', async () => {
    const result = await run(['build', 'themes/*.mjs']);

    expect(result.code).toBe(1);
    expect(result.stderr).toContain('globs are expanded by your shell');
    expect(nonAscii(result)).toEqual([]);
  });

  it('a palette candidate preview', async () => {
    fs.writeFileSync(
      path.join(dir, 'palette.config.json'),
      JSON.stringify({
        modeStrategy: 'dark-only',
        stops: [10, 50, 90],
        families: [{id: 'blue', seed: '#0074e2'}],
      }),
    );
    const result = await run(['palette', 'generate', 'palette.config.json']);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain('1 families, 3 stops, dark');
    expect(nonAscii(result)).toEqual([]);
  });
});
