// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file packed-consumer.test.mjs
 * @input Packs @astryxdesign/build, installs the tarball with pnpm's isolated
 *   linker, and exercises the public PostCSS helper and Vite plugin
 * @output Proves shipped build integrations resolve only declared package or
 *   consumer dependencies and preserve generated browser compatibility CSS
 * @position Consumer-package regression for @astryxdesign/build
 */

import {execFileSync} from 'node:child_process';
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {afterAll, beforeAll, describe, expect, it} from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(__dirname, '..');

function run(command, args, cwd) {
  try {
    return execFileSync(command, args, {
      cwd,
      encoding: 'utf8',
      env: {...process.env, NODE_PATH: undefined},
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    const stdout = error.stdout?.toString() || '';
    const stderr = error.stderr?.toString() || '';
    throw new Error(
      `${command} ${args.join(' ')} failed in ${cwd}\n${stdout}${stderr}`,
      {cause: error},
    );
  }
}

describe('the packed @astryxdesign/build consumer contract', () => {
  let root;

  beforeAll(() => {
    root = mkdtempSync(path.join(tmpdir(), 'astryx-build-consumer-'));
    const packDir = path.join(root, 'pack');
    const appDir = path.join(root, 'app');
    mkdirSync(packDir);
    mkdirSync(path.join(appDir, 'src'), {recursive: true});

    run('pnpm', ['pack', '--pack-destination', packDir], packageDir);
    const tarball = path.join(
      packDir,
      readdirSync(packDir).find(name => name.endsWith('.tgz')),
    );

    writeFileSync(
      path.join(appDir, 'package.json'),
      JSON.stringify(
        {
          name: 'astryx-build-consumer-contract',
          private: true,
          type: 'module',
          scripts: {build: 'vite build'},
          devDependencies: {
            '@astryxdesign/build': `file:${tarball}`,
            '@babel/core': '7.29.7',
            '@stylexjs/babel-plugin': '0.19.0',
            '@stylexjs/stylex': '0.19.0',
            '@stylexjs/unplugin': '0.19.0',
            postcss: '8.5.25',
            unplugin: '2.3.11',
            vite: '8.1.3',
          },
        },
        null,
        2,
      ),
    );
    writeFileSync(
      path.join(appDir, '.npmrc'),
      'node-linker=isolated\nstrict-peer-dependencies=true\n',
    );
    writeFileSync(
      path.join(appDir, 'pnpm-workspace.yaml'),
      [
        "packages: ['.']",
        'overrides:',
        "  autoprefixer: '10.5.2'",
        "  browserslist: '4.28.4'",
        "  lightningcss: '1.32.0'",
        '',
      ].join('\n'),
    );
    writeFileSync(
      path.join(appDir, 'index.html'),
      '<!doctype html><html><body><script type="module" src="/src/main.js"></script></body></html>\n',
    );
    writeFileSync(
      path.join(appDir, 'src/main.js'),
      [
        "import * as stylex from '@stylexjs/stylex';",
        "const styles = stylex.create({item: {userSelect: 'none'}});",
        'document.body.className = stylex.props(styles.item).className;',
        '',
      ].join('\n'),
    );
    writeFileSync(
      path.join(appDir, 'vite.config.mjs'),
      [
        "import {astryxStylex} from '@astryxdesign/build/vite';",
        'export default {plugins: [...astryxStylex({rootDir: process.cwd()})]};',
        '',
      ].join('\n'),
    );
    writeFileSync(
      path.join(appDir, 'check-postcss.cjs'),
      [
        "const path = require('node:path');",
        "const postcss = require('postcss');",
        "const {postcss: buildPostcss} = require('@astryxdesign/build');",
        "for (const dependency of ['autoprefixer', 'browserslist', 'lightningcss']) {",
        '  try {',
        '    require.resolve(dependency);',
        '    throw new Error(`${dependency} leaked into the consumer root`);',
        '  } catch (error) {',
        "    if (error.code !== 'MODULE_NOT_FOUND') throw error;",
        '  }',
        '}',
        'const config = buildPostcss(__dirname);',
        'const plugins = Object.entries(config.plugins).map(([id, options]) => {',
        '  if (!path.isAbsolute(id)) throw new Error(`unowned PostCSS plugin: ${id}`);',
        '  return require(id)(options);',
        '});',
        "postcss(plugins).process('@stylex;', {from: 'input.css'}).then(() => {",
        "  process.stdout.write('postcss-ok\\n');",
        '});',
        '',
      ].join('\n'),
    );

    run('pnpm', ['install', '--offline', '--ignore-scripts'], appDir);
  }, 120_000);

  afterAll(() => {
    if (root) rmSync(root, {recursive: true, force: true});
  });

  it('loads the public PostCSS helper without undeclared consumer packages', () => {
    const appDir = path.join(root, 'app');
    expect(run(process.execPath, ['check-postcss.cjs'], appDir)).toBe(
      'postcss-ok\n',
    );
  });

  it('keeps the Vite compatibility pass inside the package boundary', () => {
    const appDir = path.join(root, 'app');
    run('pnpm', ['build'], appDir);
    const assetsDir = path.join(appDir, 'dist/assets');
    const cssFile = readdirSync(assetsDir).find(name => name.endsWith('.css'));
    expect(cssFile).toBeDefined();
    expect(readFileSync(path.join(assetsDir, cssFile), 'utf8')).toContain(
      '-webkit-user-select',
    );
  });
});
