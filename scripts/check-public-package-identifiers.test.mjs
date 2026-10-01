// Copyright (c) Meta Platforms, Inc. and affiliates.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {expect, it} from 'vitest';
import {scanPackage} from './check-public-package-identifiers.mjs';

function fixture() {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), 'astryx-package-identifiers-'),
  );
  const packageDirectory = path.join(root, 'packages', 'fixture');
  fs.mkdirSync(packageDirectory, {recursive: true});
  fs.writeFileSync(
    path.join(packageDirectory, 'package.json'),
    JSON.stringify({
      name: '@astryxdesign/fixture',
      version: '1.0.0',
      files: ['published.txt'],
    }),
  );
  return {root, packageDirectory};
}

it('scans files npm includes and redacts the matched identifier', () => {
  const {root, packageDirectory} = fixture();
  const identifier = ['D', '123456'].join('');
  fs.writeFileSync(
    path.join(packageDirectory, 'published.txt'),
    `before\n${identifier}\nafter\n`,
  );
  fs.writeFileSync(path.join(packageDirectory, 'ignored.txt'), identifier);

  expect(scanPackage(root, packageDirectory)).toEqual([
    {
      file: 'packages/fixture/published.txt',
      line: 2,
      kind: 'internal diff identifier',
    },
  ]);
});

it('accepts public fixed-width example tokens', () => {
  const {root, packageDirectory} = fixture();
  fs.writeFileSync(
    path.join(packageDirectory, 'published.txt'),
    'REFERENCE1\n',
  );

  expect(scanPackage(root, packageDirectory)).toEqual([]);
});
