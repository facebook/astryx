// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file End-to-end regression tests for the icon-registry import in
 * `astryx theme build` output (#4620, #4621).
 *
 * The API contract is pinned in api/theme/build/build.icons.test.mjs; these
 * two tests pin the CLI surface: the exit code and message when the emitted
 * import cannot be satisfied, and — the part only a spawned Node process can
 * prove — that the module the build writes actually loads under Node ESM
 * when the compiled companion is present.
 */

import {describe, it, expect, beforeAll, beforeEach, afterEach} from 'vitest';
import {spawnSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {pathToFileURL} from 'node:url';
import {ensureCoreBuilt} from './ensure-core-built.mjs';
import {runCli} from '../../test-utils/run-cli.mjs';

beforeAll(() => {
  ensureCoreBuilt();
}, 200_000);

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-build-theme-icons-'));
});
afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

function writeIconTheme(project) {
  const srcDir = path.join(project, 'src');
  fs.mkdirSync(srcDir, {recursive: true});
  fs.writeFileSync(
    path.join(srcDir, 'icons.ts'),
    `export const myIcons = { close: 'x' };\n`,
  );
  fs.writeFileSync(
    path.join(srcDir, 'icotheme.ts'),
    `import { myIcons } from './icons';\n` +
      `export default { name: 'icotheme', tokens: { '--color-bg': '#fff' }, icons: myIcons };\n`,
  );
}

describe('theme build icon import (e2e)', () => {
  it('fails with a clear error when nothing in the out dir satisfies the import (#4621)', async () => {
    const project = path.join(tmpDir, 'project');
    writeIconTheme(project);

    const result = await runCli(
      ['theme', 'build', 'src/icotheme.ts', '--out', 'dist/theme.css'],
      project,
    );

    expect(result.code).not.toBe(0);
    expect(result.stderr + result.stdout).toContain(`'./icons'`);
    // Nothing half-built left behind.
    expect(fs.existsSync(path.join(project, 'dist'))).toBe(false);
  });

  it('emits a module Node can actually load when the compiled companion exists (#4620)', async () => {
    const project = path.join(tmpDir, 'project');
    writeIconTheme(project);
    fs.mkdirSync(path.join(project, 'dist'), {recursive: true});
    fs.writeFileSync(
      path.join(project, 'dist', 'icons.mjs'),
      `export const myIcons = { close: 'x' };\n`,
    );

    const result = await runCli(
      ['theme', 'build', 'src/icotheme.ts', '--out', 'dist/theme.css'],
      project,
    );
    expect(result.code).toBe(0);

    const builtUrl = pathToFileURL(path.join(project, 'dist', 'icotheme.js'));
    const probe = spawnSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `const m = await import(${JSON.stringify(builtUrl.href)});` +
          `if (m.icothemeTheme?.name !== 'icotheme') throw new Error('bad theme export');` +
          `if (m.myIcons?.close !== 'x') throw new Error('bad registry export');`,
      ],
      {encoding: 'utf8'},
    );
    expect(probe.stderr).toBe('');
    expect(probe.status).toBe(0);
  });
});
