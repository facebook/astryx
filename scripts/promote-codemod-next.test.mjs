// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Unit tests for codemod next-folder promotion.
 */

import {afterEach, describe, expect, it} from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {promoteCodemodNext} from './promote-codemod-next.mjs';

let tmpDir;

afterEach(() => {
  if (tmpDir) fs.rmSync(tmpDir, {recursive: true, force: true});
  tmpDir = undefined;
});

function scaffold({version = '0.4.0'} = {}) {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-codemod-next-'));
  fs.mkdirSync(path.join(tmpDir, 'packages/core'), {recursive: true});
  fs.writeFileSync(
    path.join(tmpDir, 'packages/core/package.json'),
    JSON.stringify({name: '@astryxdesign/core', version}, null, 2) + '\n',
  );
  const transforms = path.join(
    tmpDir,
    'packages/cli/assets/codemods/transforms',
  );
  fs.mkdirSync(path.join(transforms, 'next'), {recursive: true});
  fs.writeFileSync(
    path.join(tmpDir, 'packages/cli/assets/codemods/registry.mjs'),
    "const registry = new Map([\n  ['0.3.0', () => import('./transforms/v0.3.0/index.mjs')],\n]);\n",
  );
  return {root: tmpDir, transforms};
}

describe('promoteCodemodNext', () => {
  it('does nothing when only the next README exists', () => {
    const {root, transforms} = scaffold();
    fs.writeFileSync(path.join(transforms, 'next', 'README.md'), '# Next\n');

    const result = promoteCodemodNext({root});

    expect(result.promoted).toEqual([]);
    expect(result.registryUpdated).toBe(false);
    expect(result.message).toContain('no staged codemods');
  });

  it('promotes staged files into the current package version and registers it', () => {
    const {root, transforms} = scaffold({version: '0.4.0'});
    fs.writeFileSync(path.join(transforms, 'next', 'README.md'), '# Next\n');
    fs.writeFileSync(
      path.join(transforms, 'next', 'index.mjs'),
      'export default [];\n',
    );
    fs.writeFileSync(
      path.join(transforms, 'next', 'rename-thing.mjs'),
      'export default function transform() {}\n',
    );

    const result = promoteCodemodNext({root});

    expect(result.version).toBe('0.4.0');
    expect(result.promoted.map(entry => entry.to).sort()).toEqual([
      'packages/cli/assets/codemods/transforms/v0.4.0/index.mjs',
      'packages/cli/assets/codemods/transforms/v0.4.0/rename-thing.mjs',
    ]);
    expect(result.registryUpdated).toBe(true);
    expect(fs.existsSync(path.join(transforms, 'next', 'README.md'))).toBe(
      true,
    );
    expect(fs.existsSync(path.join(transforms, 'next', 'index.mjs'))).toBe(
      false,
    );
    expect(fs.existsSync(path.join(transforms, 'v0.4.0', 'index.mjs'))).toBe(
      true,
    );
    expect(
      fs.readFileSync(
        path.join(root, 'packages/cli/assets/codemods/registry.mjs'),
        'utf8',
      ),
    ).toContain("['0.4.0', () => import('./transforms/v0.4.0/index.mjs')]");
  });

  it('requires a next index manifest when staged transforms exist', () => {
    const {root, transforms} = scaffold();
    fs.writeFileSync(
      path.join(transforms, 'next', 'rename-thing.mjs'),
      'export default function transform() {}\n',
    );

    expect(() => promoteCodemodNext({root})).toThrow(/next\/index\.mjs/);
  });

  it('refuses to overwrite an existing version-folder file', () => {
    const {root, transforms} = scaffold({version: '0.4.0'});
    fs.writeFileSync(
      path.join(transforms, 'next', 'index.mjs'),
      'export default [];\n',
    );
    fs.mkdirSync(path.join(transforms, 'v0.4.0'), {recursive: true});
    fs.writeFileSync(
      path.join(transforms, 'v0.4.0', 'index.mjs'),
      'export default [];\n',
    );

    expect(() => promoteCodemodNext({root})).toThrow(/refusing to overwrite/);
  });
});
