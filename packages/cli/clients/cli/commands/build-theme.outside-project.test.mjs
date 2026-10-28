// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx theme build` outside any project, as a separate process.
 *
 * A theme in a folder with no Core installed (an empty folder, a fresh clone)
 * imports `defineTheme` from Core all the same: the build hands its imports
 * the Core the CLI answers with, as a new project with that Core would build
 * it (spec AST-081 FR3). The CLI runs as its own process, without the
 * `NODE_PATH` a pnpm script sets (it reaches the repository's packages): in
 * the test runner, or with that path, the theme's import would find the
 * repository's Core, which a real run outside a project cannot.
 */

import {afterEach, beforeAll, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {ensureCoreBuilt} from './ensure-core-built.mjs';

const CLI_BIN = fileURLToPath(new URL('../bin/astryx.mjs', import.meta.url));

/** @param {string[]} args @param {string} cwd */
function runCliProcess(args, cwd) {
  const {NODE_PATH: _repositoryPackages, ...env} = process.env;
  const result = spawnSync(process.execPath, [CLI_BIN, ...args], {
    cwd,
    encoding: 'utf-8',
    timeout: 60_000,
    env,
  });
  if (result.error) throw result.error;
  return result;
}

beforeAll(() => {
  ensureCoreBuilt();
}, 200_000);

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-theme-outside-'));
});
afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('theme build outside any project', () => {
  for (const ext of ['mjs', 'ts']) {
    it(`builds a .${ext} theme that imports defineTheme from Core, with the Core the CLI answers with`, () => {
      fs.writeFileSync(
        path.join(tmpDir, `outside.${ext}`),
        "import {defineTheme} from '@astryxdesign/core/theme';\n" +
          "export default defineTheme({name: 'outside', tokens: {'--color-background': '#123456'}});\n",
      );
      const result = runCliProcess(
        ['theme', 'build', `outside.${ext}`],
        tmpDir,
      );
      expect(result.status, result.stderr + result.stdout).toBe(0);
      expect(
        fs.readFileSync(path.join(tmpDir, 'outside.css'), 'utf8'),
      ).toContain('#123456');
    });
  }

  it('still fails a module that defines no theme', () => {
    fs.writeFileSync(
      path.join(tmpDir, 'none.mjs'),
      'export const notATheme = 42;\n',
    );
    const result = runCliProcess(['theme', 'build', 'none.mjs'], tmpDir);
    expect(result.status).toBe(1);
    expect(result.stderr + result.stdout).toMatch(
      /Could not find a defineTheme\(\) result/,
    );
  });
});
