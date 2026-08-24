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

/** Minimal, well-formed staged index.mjs for one transform. */
function stagedIndex(name, importName) {
  return (
    `// Copyright (c) Meta Platforms, Inc. and affiliates.\n\n` +
    `import ${importName}, {meta as ${importName}Meta} from './${name}.mjs';\n\n` +
    `export default [\n  {name: '${name}', transform: ${importName}, meta: ${importName}Meta},\n];\n`
  );
}

describe('promoteCodemodNext', () => {
  it('does nothing when only the next README exists', async () => {
    const {root, transforms} = scaffold();
    fs.writeFileSync(path.join(transforms, 'next', 'README.md'), '# Next\n');

    const result = await promoteCodemodNext({root});

    expect(result.promoted).toEqual([]);
    expect(result.registryUpdated).toBe(false);
    expect(result.message).toContain('no staged codemods');
  });

  it('does nothing when next/ holds only the re-seeded empty manifest', async () => {
    // The state every release leaves behind: README + an index.mjs exporting
    // []. A release with no codemods must not promote that placeholder into a
    // version folder or register a tier with no transforms.
    const {root, transforms} = scaffold({version: '0.4.1'});
    fs.writeFileSync(path.join(transforms, 'next', 'README.md'), '# Next\n');
    fs.writeFileSync(
      path.join(transforms, 'next', 'index.mjs'),
      '// Copyright (c) Meta Platforms, Inc. and affiliates.\n\nexport default [];\n',
    );

    const result = await promoteCodemodNext({root});

    expect(result.promoted).toEqual([]);
    expect(result.registryUpdated).toBe(false);
    expect(result.message).toContain('no staged codemods');
    expect(fs.existsSync(path.join(transforms, 'v0.4.1'))).toBe(false);
    expect(
      fs.readFileSync(
        path.join(root, 'packages/cli/assets/codemods/registry.mjs'),
        'utf8',
      ),
    ).not.toContain('0.4.1');
  });

  it('promotes staged files into the current package version and registers it', async () => {
    const {root, transforms} = scaffold({version: '0.4.0'});
    fs.writeFileSync(path.join(transforms, 'next', 'README.md'), '# Next\n');
    fs.writeFileSync(
      path.join(transforms, 'next', 'index.mjs'),
      stagedIndex('rename-thing', 'renameThing'),
    );
    fs.writeFileSync(
      path.join(transforms, 'next', 'rename-thing.mjs'),
      'export default function transform() {}\nexport const meta = {};\n',
    );

    const result = await promoteCodemodNext({root});

    expect(result.version).toBe('0.4.0');
    expect(result.promoted.map(entry => entry.to).sort()).toEqual([
      'packages/cli/assets/codemods/transforms/v0.4.0/index.mjs',
      'packages/cli/assets/codemods/transforms/v0.4.0/rename-thing.mjs',
    ]);
    expect(result.registryUpdated).toBe(true);
    // next/ keeps its README and is re-seeded with an empty manifest.
    expect(fs.existsSync(path.join(transforms, 'next', 'README.md'))).toBe(
      true,
    );
    expect(
      fs.readFileSync(path.join(transforms, 'next', 'index.mjs'), 'utf8'),
    ).toContain('export default [];');
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

  it('requires a next index manifest when staged transforms exist', async () => {
    const {root, transforms} = scaffold();
    fs.writeFileSync(
      path.join(transforms, 'next', 'rename-thing.mjs'),
      'export default function transform() {}\n',
    );

    await expect(promoteCodemodNext({root})).rejects.toThrow(
      /next\/index\.mjs/,
    );
  });

  it('merges staged codemods into a pre-existing version folder (seeded by an earlier codemod PR)', async () => {
    const {root, transforms} = scaffold({version: '0.3.0'});
    // Pre-existing v0.3.0 folder from a codemod PR that merged earlier.
    const vdir = path.join(transforms, 'v0.3.0');
    fs.mkdirSync(path.join(vdir, '__tests__'), {recursive: true});
    fs.writeFileSync(
      path.join(vdir, 'existing-codemod.mjs'),
      'export default function transform() {}\nexport const meta = {};\n',
    );
    fs.writeFileSync(
      path.join(vdir, 'index.mjs'),
      stagedIndex('existing-codemod', 'existingCodemod'),
    );
    fs.writeFileSync(
      path.join(vdir, '__tests__', 'existing-codemod.test.mjs'),
      'export default {};\n',
    );
    // Newly staged codemod in next/.
    fs.mkdirSync(path.join(transforms, 'next', '__tests__'), {recursive: true});
    fs.writeFileSync(path.join(transforms, 'next', 'README.md'), '# Next\n');
    fs.writeFileSync(
      path.join(transforms, 'next', 'new-codemod.mjs'),
      'export default function transform() {}\nexport const meta = {};\n',
    );
    fs.writeFileSync(
      path.join(transforms, 'next', 'index.mjs'),
      stagedIndex('new-codemod', 'newCodemod'),
    );
    fs.writeFileSync(
      path.join(transforms, 'next', '__tests__', 'new-codemod.test.mjs'),
      'export default {};\n',
    );

    const result = await promoteCodemodNext({root});
    expect(result.mergedIntoExisting).toBe(true);

    // Both transforms + both tests now live in v0.3.0.
    expect(fs.existsSync(path.join(vdir, 'existing-codemod.mjs'))).toBe(true);
    expect(fs.existsSync(path.join(vdir, 'new-codemod.mjs'))).toBe(true);
    expect(
      fs.existsSync(path.join(vdir, '__tests__', 'existing-codemod.test.mjs')),
    ).toBe(true);
    expect(
      fs.existsSync(path.join(vdir, '__tests__', 'new-codemod.test.mjs')),
    ).toBe(true);

    // Merged manifest lists BOTH transforms (existing first, then new).
    const merged = fs.readFileSync(path.join(vdir, 'index.mjs'), 'utf8');
    expect(merged).toMatch(/name: ['"]existing-codemod['"]/);
    expect(merged).toMatch(/name: ['"]new-codemod['"]/);
    expect(merged.search(/['"]existing-codemod['"]/)).toBeLessThan(
      merged.search(/['"]new-codemod['"]/),
    );

    // next/ drained (README kept, manifest reset, staged files gone).
    expect(
      fs.existsSync(path.join(transforms, 'next', 'new-codemod.mjs')),
    ).toBe(false);
    expect(fs.existsSync(path.join(transforms, 'next', 'README.md'))).toBe(
      true,
    );

    // registry already had 0.3.0 — not double-added.
    expect(result.registryUpdated).toBe(false);
  });

  it('de-duplicates a staged transform whose name already exists in the version folder', async () => {
    const {root, transforms} = scaffold({version: '0.3.0'});
    const vdir = path.join(transforms, 'v0.3.0');
    fs.mkdirSync(vdir, {recursive: true});
    fs.writeFileSync(
      path.join(vdir, 'index.mjs'),
      stagedIndex('shared-name', 'sharedA'),
    );
    fs.writeFileSync(path.join(transforms, 'next', 'README.md'), '# Next\n');
    fs.writeFileSync(
      path.join(transforms, 'next', 'index.mjs'),
      stagedIndex('shared-name', 'sharedB'),
    );

    const result = await promoteCodemodNext({root});
    const merged = fs.readFileSync(path.join(vdir, 'index.mjs'), 'utf8');
    // Only ONE entry for the shared name.
    expect(merged.match(/name: ['"]shared-name['"]/g)).toHaveLength(1);
    expect(result.mergedIntoExisting).toBe(true);
  });

  it('still refuses to overwrite a same-named transform file in the version folder', async () => {
    const {root, transforms} = scaffold({version: '0.4.0'});
    fs.mkdirSync(path.join(transforms, 'v0.4.0'), {recursive: true});
    fs.writeFileSync(
      path.join(transforms, 'v0.4.0', 'collide.mjs'),
      'export default function transform() {}\n',
    );
    fs.writeFileSync(path.join(transforms, 'next', 'README.md'), '# Next\n');
    fs.writeFileSync(
      path.join(transforms, 'next', 'index.mjs'),
      stagedIndex('collide', 'collide'),
    );
    fs.writeFileSync(
      path.join(transforms, 'next', 'collide.mjs'),
      'export default function transform() {}\n',
    );

    await expect(promoteCodemodNext({root})).rejects.toThrow(
      /refusing to overwrite/,
    );
  });
});
