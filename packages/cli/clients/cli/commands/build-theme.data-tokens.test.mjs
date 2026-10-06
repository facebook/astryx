// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Verifies `astryx theme build` leaves canonical data-token defaults in
 * `@astryxdesign/core/astryx.css` while preserving theme-owned CSS.
 */

import {describe, it, expect, beforeAll, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {dataTokenDefaults} from '../../../../core/src/theme/domainTokens/dataTokens';
import {ensureCoreBuilt} from './ensure-core-built.mjs';
import {runCli} from '../../../test-utils/run-cli.mjs';

function writeTheme(dir, name, theme) {
  fs.mkdirSync(dir, {recursive: true});
  const file = path.join(dir, `${name}.mjs`);
  fs.writeFileSync(
    file,
    `export default ${JSON.stringify({name, ...theme})};\n`,
  );
  return file;
}

async function buildTheme(tmpDir, name, theme) {
  const project = path.join(tmpDir, 'project');
  const themesDir = path.join(project, 'themes');
  const themeFile = writeTheme(themesDir, name, theme);

  const result = await runCli(
    ['theme', 'build', path.relative(project, themeFile)],
    project,
  );
  expect(result.code).toBe(0);

  return fs.readFileSync(path.join(themesDir, `${name}.css`), 'utf-8');
}

beforeAll(() => {
  ensureCoreBuilt();
}, 200_000);

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-build-theme-data-'));
});
afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('theme build data token output', () => {
  it('omits core defaults while retaining reset and theme layers', async () => {
    const css = await buildTheme(tmpDir, 'charts-untouched', {
      tokens: {'--color-accent': '#0077B6'},
    });

    expect(css).toContain('@layer reset {');
    expect(css).toContain('@layer astryx-theme {');
    expect(css).not.toContain('@layer astryx-base {');
    for (const [name, value] of Object.entries(dataTokenDefaults)) {
      expect(css).not.toContain(`${name}: ${value};`);
    }
  });

  it("keeps only the theme's authored data-token override", async () => {
    const css = await buildTheme(tmpDir, 'charts-override', {
      tokens: {'--color-data-categorical-blue': '#00A3FF'},
    });

    const themeBlock = css.slice(css.indexOf('@layer astryx-theme'));
    expect(themeBlock).toContain('--color-data-categorical-blue: #00A3FF;');
    expect(themeBlock.match(/--color-data-/g)).toHaveLength(1);
    expect(css).not.toContain('@layer astryx-base {');
    expect(themeBlock).not.toContain('--color-data-categorical-orange');
    expect(themeBlock).not.toContain('--color-data-gray-1');
  });
});
