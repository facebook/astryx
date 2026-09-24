// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Verify that previews build only for Vercel preview deployments.
 * @input Small Storybook and Sandbox export fixtures in a temporary directory.
 * @output Assertions for environment gating, exported routes/assets, and missing exports.
 * @position Focused build-script regression tests, runnable with node --test.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {afterEach, test} from 'node:test';
import nextConfig from '../next.config.mjs';
import {buildPreviews, stagePreviews} from './build-previews.mjs';

const directories = [];

afterEach(() => {
  for (const directory of directories.splice(0)) {
    fs.rmSync(directory, {recursive: true, force: true});
  }
});

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-previews-'));
  directories.push(root);
  return {
    root,
    storybook: path.join(root, 'apps/storybook/dist'),
    sandbox: path.join(root, 'apps/sandbox/out'),
    publicDir: path.join(root, 'apps/docsite/public'),
  };
}

function file(root, name, content) {
  const target = path.join(root, name);
  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.writeFileSync(target, content);
}

test('stages both exported HTML trees and assets, replacing stale copies', () => {
  const {storybook, sandbox, publicDir} = fixture();
  file(
    storybook,
    'index.html',
    '<html><head></head><body>storybook home</body></html>',
  );
  file(storybook, 'iframe.html', 'storybook frame');
  file(storybook, 'assets/preview.js', 'storybook asset');
  file(sandbox, 'index.html', 'sandbox home');
  file(sandbox, 'pages/example/index.html', 'nested sandbox route');
  file(sandbox, '_next/static/chunks/app.js', 'sandbox asset');
  file(sandbox, 'template-assets/card.png', 'template asset');
  file(publicDir, 'storybook/stale.html', 'old storybook');
  file(publicDir, 'sandbox/stale.html', 'old sandbox');
  file(publicDir, 'favicon.svg', 'docsite asset');

  stagePreviews(storybook, sandbox, publicDir);

  for (const [name, expected] of [
    ['storybook/iframe.html', 'storybook frame'],
    ['storybook/assets/preview.js', 'storybook asset'],
    ['sandbox/index.html', 'sandbox home'],
    ['sandbox/pages/example/index.html', 'nested sandbox route'],
    ['sandbox/_next/static/chunks/app.js', 'sandbox asset'],
    ['sandbox/template-assets/card.png', 'template asset'],
    ['favicon.svg', 'docsite asset'],
  ]) {
    assert.equal(fs.readFileSync(path.join(publicDir, name), 'utf8'), expected);
  }
  const storybookHTML = fs.readFileSync(
    path.join(publicDir, 'storybook/index.html'),
    'utf8',
  );
  const [, baseHref] = storybookHTML.match(/<base href="([^"]+)" \/>/) ?? [];
  assert.equal(baseHref, '/storybook/');
  assert.equal(
    new URL(
      './sb-manager/runtime.js',
      new URL(baseHref, 'https://example.com/storybook'),
    ).pathname,
    '/storybook/sb-manager/runtime.js',
  );
  assert.equal(
    fs.readFileSync(path.join(storybook, 'index.html'), 'utf8'),
    '<html><head></head><body>storybook home</body></html>',
  );
  assert.equal(
    fs.existsSync(path.join(publicDir, 'storybook/stale.html')),
    false,
  );
  assert.equal(
    fs.existsSync(path.join(publicDir, 'sandbox/stale.html')),
    false,
  );
});

test('routes exported HTML while leaving public files ahead of the rewrites', async () => {
  const rewrites = await nextConfig.rewrites();
  assert.deepEqual(rewrites, [
    {source: '/blog/:slug.txt', destination: '/blog/txt/:slug'},
    {source: '/storybook', destination: '/storybook/index.html'},
    {source: '/sandbox', destination: '/sandbox/index.html'},
    {source: '/sandbox/:path*', destination: '/sandbox/:path*/index.html'},
  ]);
});

test('preview builds both exports with the sandbox paths before docsite build', () => {
  const {root, storybook, sandbox, publicDir} = fixture();
  file(
    storybook,
    'index.html',
    '<html><head></head><body>storybook home</body></html>',
  );
  file(sandbox, 'index.html', 'sandbox home');
  const calls = [];

  buildPreviews('preview', root, (command, args, options) => {
    calls.push({command, args, options});
  });

  assert.deepEqual(
    calls.map(({command, args, options}) => [command, args, options.cwd]),
    [
      ['pnpm', ['-F', '@astryxdesign/storybook', 'build'], root],
      ['pnpm', ['-F', '@astryxdesign/sandbox', 'build'], root],
    ],
  );
  assert.equal(calls[1].options.env.SANDBOX_BASE_PATH, '/sandbox');
  assert.equal(
    calls[1].options.env.SANDBOX_TEMPLATE_ASSETS_BASE_PATH,
    '/sandbox/template-assets',
  );
  assert.match(
    fs.readFileSync(path.join(publicDir, 'storybook/index.html'), 'utf8'),
    /<base href="\/storybook\/" \/>/,
  );
  assert.equal(
    fs.readFileSync(path.join(publicDir, 'sandbox/index.html'), 'utf8'),
    'sandbox home',
  );

  const {buildCommand} = JSON.parse(
    fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'),
  );
  assert.match(
    buildCommand,
    /pnpm build && node apps\/docsite\/scripts\/build-previews\.mjs && pnpm -F @astryxdesign\/docsite build/,
  );
});

test('production, development, and unset Vercel environments remove cached previews without building them', () => {
  for (const deploymentEnv of ['production', 'development', undefined]) {
    const {root, storybook, sandbox, publicDir} = fixture();
    file(storybook, 'index.html', 'storybook export');
    file(sandbox, 'index.html', 'sandbox export');
    file(publicDir, 'storybook/index.html', 'cached storybook');
    file(publicDir, 'sandbox/index.html', 'cached sandbox');
    file(publicDir, 'favicon.svg', 'docsite asset');

    buildPreviews(deploymentEnv, root, () => {
      throw new Error('Production must not build previews');
    });

    assert.equal(fs.existsSync(path.join(publicDir, 'storybook')), false);
    assert.equal(fs.existsSync(path.join(publicDir, 'sandbox')), false);
    assert.equal(
      fs.readFileSync(path.join(publicDir, 'favicon.svg'), 'utf8'),
      'docsite asset',
    );
  }
});

test('rejects Storybook HTML without a safe base insertion point before replacing exports', () => {
  for (const index of [
    'not HTML',
    '<html><head><base href="/other/" /></head></html>',
  ]) {
    const {storybook, sandbox, publicDir} = fixture();
    file(storybook, 'index.html', index);
    file(sandbox, 'index.html', 'new sandbox');
    file(publicDir, 'storybook/index.html', 'old storybook');
    file(publicDir, 'sandbox/index.html', 'old sandbox');

    assert.throws(
      () => stagePreviews(storybook, sandbox, publicDir),
      /Storybook index.html must have a head without a base element/,
    );
    assert.equal(
      fs.readFileSync(path.join(publicDir, 'storybook/index.html'), 'utf8'),
      'old storybook',
    );
    assert.equal(
      fs.readFileSync(path.join(publicDir, 'sandbox/index.html'), 'utf8'),
      'old sandbox',
    );
  }
});

test('rejects an incomplete export before replacing either staged copy', () => {
  for (const missing of ['storybook', 'sandbox']) {
    const {storybook, sandbox, publicDir} = fixture();
    file(storybook, 'index.html', 'new storybook');
    file(sandbox, 'index.html', 'new sandbox');
    fs.rmSync(
      path.join(missing === 'storybook' ? storybook : sandbox, 'index.html'),
    );
    file(publicDir, 'storybook/index.html', 'old storybook');
    file(publicDir, 'sandbox/index.html', 'old sandbox');

    assert.throws(
      () => stagePreviews(storybook, sandbox, publicDir),
      new RegExp(
        `${missing === 'storybook' ? 'Storybook' : 'Sandbox'} build has no index.html`,
      ),
    );
    assert.equal(
      fs.readFileSync(path.join(publicDir, 'storybook/index.html'), 'utf8'),
      'old storybook',
    );
    assert.equal(
      fs.readFileSync(path.join(publicDir, 'sandbox/index.html'), 'utf8'),
      'old sandbox',
    );
  }
});
