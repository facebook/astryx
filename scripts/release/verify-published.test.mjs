// Copyright (c) Meta Platforms, Inc. and affiliates.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {expect, it} from 'vitest';
import {comparePackageTrees} from './verify-published.mjs';

function tree(entries) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-package-parity-'));
  for (const [file, contents] of Object.entries(entries)) {
    const absolute = path.join(root, file);
    fs.mkdirSync(path.dirname(absolute), {recursive: true});
    fs.writeFileSync(absolute, contents);
  }
  return root;
}

it('accepts byte-identical package trees', () => {
  const local = tree({'package.json': '{}\n', 'dist/index.js': 'export {};\n'});
  const published = tree({
    'package.json': '{}\n',
    'dist/index.js': 'export {};\n',
  });
  expect(comparePackageTrees(local, published)).toEqual([]);
});

it('reports missing, unexpected, and changed package bytes', () => {
  const local = tree({
    'package.json': '{}\n',
    'dist/index.js': 'local\n',
    'dist/only-local.js': 'local\n',
  });
  const published = tree({
    'package.json': '{}\n',
    'dist/index.js': 'published\n',
    'dist/only-published.js': 'published\n',
  });
  expect(comparePackageTrees(local, published)).toEqual([
    'published package differs at dist/index.js',
    'published package is missing dist/only-local.js',
    'published package has unexpected dist/only-published.js',
  ]);
});
