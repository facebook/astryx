// Copyright (c) Meta Platforms, Inc. and affiliates.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {afterEach, test} from 'node:test';

import {buildStorybookPreview, stageStorybook} from './build-previews.mjs';

const roots = [];
function fixture() {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), 'astryx-storybook-preview-'),
  );
  roots.push(root);
  const source = path.join(root, 'apps/storybook/dist');
  const destination = path.join(root, 'apps/docsite/public/storybook');
  fs.mkdirSync(path.join(source, 'assets'), {recursive: true});
  fs.writeFileSync(
    path.join(source, 'index.html'),
    '<html><head></head><body>Storybook</body></html>',
  );
  fs.writeFileSync(path.join(source, 'assets/manager.js'), 'manager bytes');
  return {root, source, destination};
}
afterEach(() => {
  for (const root of roots.splice(0))
    fs.rmSync(root, {recursive: true, force: true});
});

test('stages a complete Storybook under a stable /storybook/ asset base', () => {
  const {source, destination} = fixture();
  fs.mkdirSync(destination, {recursive: true});
  fs.writeFileSync(path.join(destination, 'stale.js'), 'old');
  stageStorybook(source, destination);
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

test('rejects an incomplete or incompatible export before touching staged bytes', () => {
  const {source, destination} = fixture();
  fs.mkdirSync(destination, {recursive: true});
  fs.writeFileSync(path.join(destination, 'index.html'), 'old');
  for (const html of [null, 'not HTML', '<head><base href="/other/"></head>']) {
    if (html === null) fs.rmSync(path.join(source, 'index.html'));
    else fs.writeFileSync(path.join(source, 'index.html'), html);
    assert.throws(
      () => stageStorybook(source, destination),
      /Storybook (?:build has no index.html|index.html must have a head)/,
    );
    assert.equal(
      fs.readFileSync(path.join(destination, 'index.html'), 'utf8'),
      'old',
    );
  }
});

test('only preview/canary Vercel builds create the Storybook route', () => {
  const {root, destination} = fixture();
  const calls = [];
  buildStorybookPreview('preview', root, (command, args, options) => {
    calls.push({command, args, options});
  });
  assert.deepEqual(
    calls.map(({command, args}) => [command, args]),
    [['pnpm', ['-F', '@astryxdesign/storybook', 'build']]],
  );
  assert.equal(fs.existsSync(path.join(destination, 'index.html')), true);
  for (const env of ['production', 'development', undefined]) {
    buildStorybookPreview(env, root, () => {
      throw new Error('should not run');
    });
    assert.equal(fs.existsSync(destination), false);
  }
});

test('reports captured build output on a failed Storybook build', () => {
  const {root} = fixture();
  assert.throws(
    () =>
      buildStorybookPreview('preview', root, () => {
        throw Object.assign(new Error('command failed'), {
          stdout: 'building',
          stderr: 'failed to compile',
        });
      }),
    /Storybook preview build failed:\nbuilding\nfailed to compile/,
  );
});
