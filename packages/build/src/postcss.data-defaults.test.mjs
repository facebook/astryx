// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file postcss.data-defaults.test.mjs
 * @input The documented `postcss(rootDir)` config, run over an app that has
 *   the real Core package installed and never imports `dataVars`
 * @output Proves the PostCSS source build emits Core's 56 data-token defaults
 *   once, in the library layer
 * @position Regression test for spec:AST-066 FR3 in @astryxdesign/build
 *
 * The PostCSS helper compiles every module each installed Astryx package
 * publishes, so Core's `theme/dataTokens.stylex.ts` is always among them and
 * its variable group is always emitted. This keeps that true.
 */

import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const require = createRequire(import.meta.url);
const {postcss} = require('./config.js');

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..',
);
const CORE_PACKAGE = path.join(REPO_ROOT, 'packages/core');

let appDir;
let css = '';

beforeAll(async () => {
  appDir = fs.realpathSync(
    fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-postcss-data-')),
  );
  fs.mkdirSync(path.join(appDir, 'node_modules/@astryxdesign'), {
    recursive: true,
  });
  fs.symlinkSync(
    CORE_PACKAGE,
    path.join(appDir, 'node_modules/@astryxdesign/core'),
    'dir',
  );
  fs.mkdirSync(path.join(appDir, 'src'));
  fs.writeFileSync(
    path.join(appDir, 'src/page.tsx'),
    [
      "import * as stylex from '@stylexjs/stylex';",
      "export const styles = stylex.create({page: {color: 'red'}});",
      '',
    ].join('\n'),
  );

  const config = postcss(appDir);
  const [pluginPath, options] = Object.entries(config.plugins)[0];
  const plugin = require(pluginPath)(options);
  const atRule = {
    name: 'stylex',
    params: '',
    replaceWith(next) {
      css = next;
    },
  };
  const root = {walkAtRules: visit => visit(atRule)};
  for (const run of plugin.plugins) {
    await run(root, {
      opts: {from: path.join(appDir, 'src/app.css')},
      messages: [],
    });
  }
}, 120_000);

afterAll(() => {
  if (appDir) fs.rmSync(appDir, {recursive: true, force: true});
});

/** The slice of a stylesheet inside a given top-level layer block. */
function layerBlock(name) {
  const start = css.indexOf(`@layer ${name} {`);
  expect(start, `@layer ${name} is not in the output`).toBeGreaterThan(-1);
  let depth = 0;
  for (let i = css.indexOf('{', start); i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}' && --depth === 0) return css.slice(start, i + 1);
  }
  throw new Error(`@layer ${name} is unterminated`);
}

const dataDefaults = text =>
  text.match(/--color-data-[a-z0-9-]+(?=\s*:)/g) ?? [];

describe('the PostCSS source build', () => {
  it('emits all 56 data-token defaults once, without a dataVars import', () => {
    const all = dataDefaults(css);
    expect(all).toHaveLength(56);
    expect(new Set(all).size).toBe(56);
  });

  it('places them in the library layer, not the product layer', () => {
    const library = layerBlock('astryx-base');
    expect(dataDefaults(library)).toHaveLength(56);
    expect(library).toContain(
      '--color-data-blue-3:light-dark(#2694FE, #2694FE)',
    );
    expect(dataDefaults(layerBlock('product'))).toHaveLength(0);
  });
});
