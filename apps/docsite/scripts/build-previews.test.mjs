// Copyright (c) Meta Platforms, Inc. and affiliates.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {afterEach, test} from 'node:test';

import {
  buildPreviews,
  stageSandbox,
  stageStorybook,
} from './build-previews.mjs';

const roots = [];
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-static-preview-'));
  roots.push(root);
  const storybook = path.join(root, 'apps/storybook/dist');
  const sandbox = path.join(root, 'apps/sandbox/out');
  const publicDir = path.join(root, 'apps/docsite/public');
  fs.mkdirSync(path.join(storybook, 'assets'), {recursive: true});
  fs.writeFileSync(
    path.join(storybook, 'index.html'),
    '<html><head></head><body>Storybook</body></html>',
  );
  fs.writeFileSync(path.join(storybook, 'assets/manager.js'), 'manager bytes');
  for (const dir of [
    '',
    '404',
    'pages/motion-lab/bugs',
    'templates/login-sso',
  ]) {
    fs.mkdirSync(path.join(sandbox, dir), {recursive: true});
    fs.writeFileSync(path.join(sandbox, dir, 'index.html'), `<p>${dir}</p>`);
  }
  fs.writeFileSync(path.join(sandbox, '404.html'), 'not found');
  fs.mkdirSync(path.join(sandbox, 'assets'), {recursive: true});
  fs.mkdirSync(path.join(sandbox, 'template-assets'), {recursive: true});
  fs.writeFileSync(path.join(sandbox, 'assets/app.js'), 'app');
  fs.writeFileSync(path.join(sandbox, 'assets/app.css'), 'styles');
  fs.writeFileSync(path.join(sandbox, 'template-assets/logo.svg'), '<svg/>');
  fs.writeFileSync(
    path.join(sandbox, 'templates/login-sso/embed.html'),
    'embed',
  );
  return {root, storybook, sandbox, publicDir};
}
afterEach(() => {
  for (const root of roots.splice(0))
    fs.rmSync(root, {recursive: true, force: true});
});

test('stages complete Storybook under a stable /storybook/ asset base', () => {
  const {storybook, publicDir} = fixture();
  const destination = path.join(publicDir, 'storybook');
  fs.mkdirSync(destination, {recursive: true});
  fs.writeFileSync(path.join(destination, 'stale.js'), 'old');
  stageStorybook(storybook, destination);
  assert.match(
    fs.readFileSync(path.join(destination, 'index.html'), 'utf8'),
    /<base href="\/storybook\/" \/>/,
  );
  assert.equal(
    fs.readFileSync(path.join(destination, 'assets/manager.js'), 'utf8'),
    'manager bytes',
  );
  assert.equal(fs.existsSync(path.join(destination, 'stale.js')), false);
});

test('stages physical Sandbox routes, embeds and assets without a fallback', () => {
  const {sandbox, publicDir} = fixture();
  const destination = path.join(publicDir, 'sandbox');
  fs.mkdirSync(destination, {recursive: true});
  fs.writeFileSync(path.join(destination, 'stale.html'), 'old');
  stageSandbox(sandbox, destination);
  for (const relative of [
    'index.html',
    '404.html',
    '404/index.html',
    'pages/motion-lab/bugs/index.html',
    'templates/login-sso/embed.html',
    'template-assets/logo.svg',
    'assets/app.js',
    'assets/app.css',
  ]) {
    assert.equal(
      fs.readFileSync(path.join(destination, relative), 'utf8'),
      fs.readFileSync(path.join(sandbox, relative), 'utf8'),
    );
  }
  assert.equal(fs.existsSync(path.join(destination, 'stale.html')), false);
  assert.equal(
    fs.existsSync(path.join(destination, 'unknown/index.html')),
    false,
  );
});

test('rejects incomplete exports before touching staged bytes', () => {
  const {storybook, sandbox, publicDir} = fixture();
  for (const [source, stage, missing, message] of [
    [
      storybook,
      stageStorybook,
      'index.html',
      /Storybook build has no index.html/,
    ],
    [
      sandbox,
      stageSandbox,
      '404/index.html',
      /Sandbox build has no 404\/index.html/,
    ],
  ]) {
    const destination = path.join(publicDir, 'staged');
    fs.mkdirSync(destination, {recursive: true});
    fs.writeFileSync(path.join(destination, 'index.html'), 'old');
    fs.rmSync(path.join(source, missing));
    assert.throws(() => stage(source, destination), message);
    assert.equal(
      fs.readFileSync(path.join(destination, 'index.html'), 'utf8'),
      'old',
    );
  }
});

test('only preview/canary builds create either static tree', () => {
  const {root, publicDir} = fixture();
  const calls = [];
  buildPreviews('preview', root, (command, args, options) => {
    calls.push({command, args, options});
  });
  assert.deepEqual(
    calls.map(({command, args}) => [command, args]),
    [
      ['pnpm', ['-F', '@astryxdesign/storybook', 'build']],
      ['pnpm', ['-F', '@astryxdesign/sandbox', 'build']],
    ],
  );
  assert.equal(calls[1].options.env.SANDBOX_BASE_PATH, '/sandbox');
  for (const name of ['storybook', 'sandbox'])
    assert.equal(fs.existsSync(path.join(publicDir, name, 'index.html')), true);
  for (const env of ['production', 'development', undefined]) {
    buildPreviews(env, root, () => {
      throw new Error('should not run');
    });
    for (const name of ['storybook', 'sandbox'])
      assert.equal(fs.existsSync(path.join(publicDir, name)), false);
  }
});

test('Next keeps generated Sandbox route rewrites preview-only and never uses a catch-all', async () => {
  const configPath = path.resolve(import.meta.dirname, '../next.config.mjs');
  const previous = process.env.VERCEL_ENV;
  try {
    process.env.VERCEL_ENV = 'preview';
    const {default: preview} = await import(`${configPath}?preview`);
    assert.equal(preview.skipTrailingSlashRedirect, true);
    assert.deepEqual((await preview.rewrites()).afterFiles.slice(-2), [
      {source: '/sandbox', destination: '/sandbox/index.html'},
      {source: '/sandbox/:path+', destination: '/sandbox/:path+/index.html'},
    ]);
    process.env.VERCEL_ENV = 'production';
    const {default: production} = await import(`${configPath}?production`);
    assert.equal(production.skipTrailingSlashRedirect, false);
    assert.equal(
      (await production.rewrites()).afterFiles.some(rule =>
        rule.source.startsWith('/sandbox'),
      ),
      false,
    );
  } finally {
    if (previous === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = previous;
  }
});

test('failed preview builds do not leave cached static trees', () => {
  const {root, publicDir} = fixture();
  buildPreviews('preview', root, () => {});
  assert.throws(
    () =>
      buildPreviews('preview', root, (_command, args) => {
        if (args[1] === '@astryxdesign/sandbox')
          throw Object.assign(new Error('command failed'), {
            stdout: 'building',
            stderr: 'failed to compile',
          });
      }),
    /Sandbox preview build failed:\nbuilding\nfailed to compile/,
  );
  for (const name of ['storybook', 'sandbox'])
    assert.equal(fs.existsSync(path.join(publicDir, name)), false);
});
