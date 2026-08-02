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
import {spawn, spawnSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {ensureCoreBuilt} from './ensure-core-built.mjs';
import {runCli} from '../../../test-utils/run-cli.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_BIN = path.resolve(__dirname, '../bin/astryx.mjs');

/** Poll until `predicate()` is true or the timeout elapses. */
async function waitFor(predicate, {timeout = 20000, interval = 100} = {}) {
  const start = Date.now();
  for (;;) {
    if (predicate()) return true;
    if (Date.now() - start > timeout) return false;
    await new Promise(r => setTimeout(r, interval));
  }
}

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

  it('carries ERR_THEME_ICON_UNRESOLVED in the --json envelope', async () => {
    const project = path.join(tmpDir, 'project');
    writeIconTheme(project);

    const result = await runCli(
      ['--json', 'theme', 'build', 'src/icotheme.ts', '--out', 'dist/theme.css'],
      project,
    );

    expect(result.code).not.toBe(0);
    const envelope = JSON.parse(result.stdout);
    expect(envelope.code).toBe('ERR_THEME_ICON_UNRESOLVED');
    expect(envelope.error).toContain(`'./icons'`);
  });

  it('watch mode survives an unresolved icon import and recovers on the next change', async () => {
    const project = path.join(tmpDir, 'project');
    writeIconTheme(project);
    const companion = path.join(project, 'dist', 'icons.mjs');
    fs.mkdirSync(path.join(project, 'dist'), {recursive: true});
    fs.writeFileSync(companion, `export const myIcons = { close: 'x' };\n`);

    const themeFile = path.join(project, 'src', 'icotheme.ts');
    const cssFile = path.join(project, 'dist', 'theme.css');
    const child = spawn(
      process.execPath,
      [CLI_BIN, 'theme', 'build', 'src/icotheme.ts', '--out', 'dist/theme.css', '--watch'],
      {cwd: project, env: {...process.env, FORCE_COLOR: '0'}},
    );
    let output = '';
    child.stdout.on('data', d => (output += d.toString()));
    child.stderr.on('data', d => (output += d.toString()));

    try {
      // Initial build succeeds (companion present) and the watcher arms.
      expect(await waitFor(() => fs.existsSync(cssFile))).toBe(true);
      expect(await waitFor(() => /Watching/i.test(output))).toBe(true);

      // Break the world: companion gone, then trigger a rebuild. fs.watch
      // delivery is best-effort under load, so re-touch until the error
      // shows up (idempotent write).
      fs.rmSync(companion);
      const touched =
        `import { myIcons } from './icons';\n` +
        `export default { name: 'icotheme', tokens: { '--color-bg': '#010203' }, icons: myIcons };\n`;
      fs.writeFileSync(themeFile, touched);
      const errored = await waitFor(() => {
        if (output.includes('no module satisfies')) return true;
        try {
          fs.writeFileSync(themeFile, touched);
        } catch {
          // Dir mid-teardown; the next poll retries.
        }
        return false;
      });
      expect(errored).toBe(true);
      // The failed rebuild is contained — the watcher is still alive.
      expect(child.exitCode).toBe(null);

      // Heal the world: companion back, change the theme again — the next
      // rebuild must go green.
      fs.writeFileSync(companion, `export const myIcons = { close: 'x' };\n`);
      const healed =
        `import { myIcons } from './icons';\n` +
        `export default { name: 'icotheme', tokens: { '--color-bg': '#0a0b0c' }, icons: myIcons };\n`;
      fs.writeFileSync(themeFile, healed);
      const recovered = await waitFor(() => {
        try {
          if (fs.readFileSync(cssFile, 'utf-8').includes('#0a0b0c')) return true;
        } catch {
          // CSS mid-write; fall through to re-touch.
        }
        try {
          fs.writeFileSync(themeFile, healed);
        } catch {
          // Retried on the next poll.
        }
        return false;
      });
      expect(recovered).toBe(true);
    } finally {
      child.kill('SIGINT');
    }
  }, 60_000);
});
