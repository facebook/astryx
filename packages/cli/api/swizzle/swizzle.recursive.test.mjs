// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file swizzle nested-source coverage — a component whose source spans
 * subdirectories (e.g. Table/plugins) must eject whole, and the imports inside
 * those nested files must be rewritten relative to their own location.
 *
 * Fixtures are synthetic core trees under os.tmpdir() so `findCoreDir` resolves
 * without touching the repo and nothing is written inside `process.cwd()`.
 */

import {describe, it, expect, beforeAll, afterAll} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {rewriteImports, swizzle} from './swizzle.mjs';

/** Absolute path of the synthetic repo root for this file's fixtures. */
let root;
/** `<root>/packages/core/src` */
let src;

/** @param {string} rel @param {string} content */
function write(rel, content) {
  const abs = path.join(root, ...rel.split('/'));
  fs.mkdirSync(path.dirname(abs), {recursive: true});
  fs.writeFileSync(abs, content);
}

/** Every file actually present under `dir`, as posix-relative paths. */
function walk(dir, rel = '') {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...walk(path.join(dir, e.name), r));
    else out.push(r);
  }
  return out.sort();
}

beforeAll(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-swizzle-nested-'));
  src = path.join(root, 'packages', 'core', 'src');

  // A component shaped like Table: entry file re-exporting a nested tree.
  write(
    'packages/core/src/Widget/index.ts',
    [
      `export {useAlpha} from './parts/alpha/useAlpha';`,
      `export {useBeta} from './parts/beta/useBeta';`,
      `import {tokens} from '../theme/tokens.stylex';`,
      `export {tokens};`,
    ].join('\n'),
  );
  write('packages/core/src/Widget/types.ts', `export type Id = string;`);
  write(
    'packages/core/src/Widget/Widget.tsx',
    `import {mergeProps} from '../utils/mergeProps';\nexport const Widget = () => null;\n`,
  );

  // Excluded at the top level.
  write('packages/core/src/Widget/Widget.test.tsx', `it('x', () => {});`);
  write('packages/core/src/Widget/Widget.doc.mjs', `export default {};`);
  write('packages/core/src/Widget/README.md', `# Widget`);

  // Excluded by DIRECTORY, not by filename: neither name contains ".test.".
  write('packages/core/src/Widget/__tests__/extra.spec.tsx', `it('y', () => {});`);
  write('packages/core/src/Widget/__snapshots__/Widget.tsx.snap', `exports[\`a\`] = \`b\`;`);

  // Nested source, two levels deep, mixing inside/outside relative imports.
  // StyleX appears ONLY here — proving usesStyleX sees nested files.
  write(
    'packages/core/src/Widget/parts/index.ts',
    `export * from './alpha/useAlpha';`,
  );
  write(
    'packages/core/src/Widget/parts/alpha/useAlpha.ts',
    [
      `import * as stylex from '@stylexjs/stylex';`,
      `import type {Id} from '../../types';`,
      `import {useBeta} from '../beta/useBeta';`,
      `import {Widget} from '../..';`,
      `import {tokens} from '../../../theme/tokens.stylex';`,
      `import {mergeProps} from '../../../utils/mergeProps';`,
      `export const useAlpha = () => ({stylex, tokens, mergeProps, useBeta, Widget});`,
      `export type {Id};`,
    ].join('\n'),
  );
  write('packages/core/src/Widget/parts/alpha/useAlpha.test.ts', `it('z', () => {});`);
  write(
    'packages/core/src/Widget/parts/beta/useBeta.ts',
    `export const useBeta = () => null;`,
  );

  // Package-level modules the component reaches out to.
  write('packages/core/src/theme/tokens.stylex.ts', `export const tokens = {};`);
  write('packages/core/src/utils/mergeProps.ts', `export const mergeProps = () => {};`);

  // A component with no nesting at all, to pin the flat path still works.
  write('packages/core/src/Flat/index.ts', `export const Flat = () => null;`);

  // package.json so Project.load() has something ordinary to read.
  write('package.json', JSON.stringify({name: 'fixture', version: '0.0.0'}));
});

afterAll(() => {
  if (root) fs.rmSync(root, {recursive: true, force: true});
});

describe('rewriteImports — location aware', () => {
  const componentDir = path.join(path.sep, 'pkg', 'src', 'Widget');

  it('keeps the top-level behaviour when no location is given', () => {
    expect(rewriteImports(`import {t} from '../theme/tokens.stylex';`)).toBe(
      `import {t} from '@astryxdesign/core/theme';`,
    );
  });

  it('rewrites an escaping import from a nested file to the owner package', () => {
    const input = `import {t} from '../../../theme/tokens.stylex';`;
    const result = rewriteImports(input, '@astryxdesign/core', {
      componentDir,
      fromDir: path.join(componentDir, 'parts', 'alpha'),
    });
    expect(result).toBe(`import {t} from '@astryxdesign/core/theme';`);
  });

  it('leaves a nested import that stays inside the component untouched', () => {
    const input = `import type {Id} from '../../types';`;
    const result = rewriteImports(input, '@astryxdesign/core', {
      componentDir,
      fromDir: path.join(componentDir, 'parts', 'alpha'),
    });
    // Structure is preserved on copy, so '../../types' still resolves.
    expect(result).toBe(input);
  });

  it('leaves a sibling-subdirectory import untouched', () => {
    const input = `import {useBeta} from '../beta/useBeta';`;
    const result = rewriteImports(input, '@astryxdesign/core', {
      componentDir,
      fromDir: path.join(componentDir, 'parts', 'alpha'),
    });
    expect(result).toBe(input);
  });

  it('leaves an import pointing at the component root itself untouched', () => {
    // '../..' from parts/alpha is the component's own entry. Rewriting it to
    // '<owner>/Widget' would send the eject back to the library it forked.
    const input = `import {Widget} from '../..';`;
    const result = rewriteImports(input, '@astryxdesign/core', {
      componentDir,
      fromDir: path.join(componentDir, 'parts', 'alpha'),
    });
    expect(result).toBe(input);
    expect(result).not.toContain('core/Widget');
  });

  it('leaves an import that escapes the package source root untouched', () => {
    // Never emit '@astryxdesign/core/..' — that resolves to nothing.
    const input = `import {x} from '../../../../outside/x';`;
    const result = rewriteImports(input, '@astryxdesign/core', {
      componentDir,
      fromDir: path.join(componentDir, 'parts', 'alpha'),
    });
    expect(result).toBe(input);
    expect(result).not.toContain('core/..');
  });

  it('honours a non-core owner package for nested files', () => {
    const input = `import {t} from '../../../theme/tokens.stylex';`;
    const result = rewriteImports(input, '@acme/ui', {
      componentDir,
      fromDir: path.join(componentDir, 'parts', 'alpha'),
    });
    expect(result).toBe(`import {t} from '@acme/ui/theme';`);
  });
});

describe('swizzle() — nested component source', () => {
  it('copies the whole nested tree, preserving structure', async () => {
    const out = './out-tree';
    const r = await swizzle('Widget', {cwd: root, output: out});
    const dir = path.join(root, 'out-tree', 'Widget');

    expect(walk(dir)).toEqual([
      'Widget.tsx',
      'index.ts',
      'parts/alpha/useAlpha.ts',
      'parts/beta/useBeta.ts',
      'parts/index.ts',
      'types.ts',
    ]);
    expect(r.data.component).toBe('Widget');
  });

  it('reports nested files with posix separators, and the count matches disk', async () => {
    const r = await swizzle('Widget', {cwd: root, output: './out-report'});
    const onDisk = walk(path.join(root, 'out-report', 'Widget'));

    expect([...r.data.files].sort()).toEqual(onDisk);
    expect(r.data.filesCopied).toBe(onDisk.length);
    expect(r.data.files).toContain('parts/alpha/useAlpha.ts');
    expect(r.data.files.every(f => !f.includes('\\'))).toBe(true);
  });

  it('excludes tests, docs and README at every level', async () => {
    await swizzle('Widget', {cwd: root, output: './out-excl'});
    const files = walk(path.join(root, 'out-excl', 'Widget'));

    expect(files).not.toContain('Widget.test.tsx');
    expect(files).not.toContain('Widget.doc.mjs');
    expect(files).not.toContain('README.md');
    // Nested test file — the top-level-only filter never saw this one.
    expect(files).not.toContain('parts/alpha/useAlpha.test.ts');
  });

  it('does not copy __tests__ / __snapshots__ directories, nor leave them empty', async () => {
    await swizzle('Widget', {cwd: root, output: './out-dirs'});
    const dir = path.join(root, 'out-dirs', 'Widget');

    expect(walk(dir)).not.toContain('__tests__/extra.spec.tsx');
    expect(walk(dir)).not.toContain('__snapshots__/Widget.tsx.snap');
    expect(fs.existsSync(path.join(dir, '__tests__'))).toBe(false);
    expect(fs.existsSync(path.join(dir, '__snapshots__'))).toBe(false);
  });

  it('rewrites nested imports by the nested file own location', async () => {
    await swizzle('Widget', {cwd: root, output: './out-imports'});
    const nested = fs.readFileSync(
      path.join(root, 'out-imports', 'Widget', 'parts', 'alpha', 'useAlpha.ts'),
      'utf-8',
    );

    expect(nested).toContain(`from '@astryxdesign/core/theme'`);
    expect(nested).toContain(`from '@astryxdesign/core/utils'`);
    // Inside the component — must survive untouched.
    expect(nested).toContain(`from '../../types'`);
    expect(nested).toContain(`from '../beta/useBeta'`);
    // The component's own entry, reached from a nested file.
    expect(nested).toContain(`from '../..'`);
    expect(nested).not.toContain('core/..');
    expect(nested).not.toContain('core/Widget');
  });

  it('every ./-relative specifier in the eject resolves on disk', async () => {
    // The issue acceptance criterion: no dangling re-export.
    await swizzle('Widget', {cwd: root, output: './out-resolve'});
    const dir = path.join(root, 'out-resolve', 'Widget');

    for (const rel of walk(dir)) {
      const content = fs.readFileSync(path.join(dir, ...rel.split('/')), 'utf-8');
      for (const m of content.matchAll(/from\s+['"](\.[^'"]*)['"]/g)) {
        const target = path.resolve(path.dirname(path.join(dir, ...rel.split('/'))), m[1]);
        const found = ['.ts', '.tsx', '/index.ts', '/index.tsx', ''].some(ext =>
          fs.existsSync(target + ext),
        );
        expect(found, `${rel} → ${m[1]} does not resolve`).toBe(true);
      }
    }
  });

  it('detects a nested collision and refuses without --overwrite', async () => {
    const out = './out-collide';
    await swizzle('Widget', {cwd: root, output: out});
    // Only the nested file survives — the pre-flight must still see it.
    fs.rmSync(path.join(root, 'out-collide', 'Widget', 'index.ts'));

    await expect(swizzle('Widget', {cwd: root, output: out})).rejects.toMatchObject({
      code: 'ERR_FILE_EXISTS',
    });
  });

  it('--overwrite replaces nested files', async () => {
    const out = './out-force';
    await swizzle('Widget', {cwd: root, output: out});
    const nested = path.join(root, 'out-force', 'Widget', 'parts', 'alpha', 'useAlpha.ts');
    fs.writeFileSync(nested, '// clobbered');

    await swizzle('Widget', {cwd: root, output: out, overwrite: true});
    expect(fs.readFileSync(nested, 'utf-8')).not.toBe('// clobbered');
  });

  it('flags usesStyleX when only a nested file imports StyleX', async () => {
    const r = await swizzle('Widget', {cwd: root, output: './out-stylex'});
    expect(r.data.usesStyleX).toBe(true);
  });

  it('still handles a component with no subdirectories', async () => {
    const r = await swizzle('Flat', {cwd: root, output: './out-flat'});
    expect(r.data.files).toEqual(['index.ts']);
    expect(r.data.filesCopied).toBe(1);
  });

  it('does not follow symlinked subdirectories', async () => {
    const linkParent = path.join(src, 'Linked');
    fs.mkdirSync(linkParent, {recursive: true});
    fs.writeFileSync(path.join(linkParent, 'index.ts'), `export const Linked = 1;`);
    const secret = path.join(root, 'secret');
    fs.mkdirSync(secret, {recursive: true});
    fs.writeFileSync(path.join(secret, 'leak.ts'), `export const leak = 1;`);
    try {
      fs.symlinkSync(secret, path.join(linkParent, 'sub'), 'dir');
    } catch {
      return; // symlinks unavailable (e.g. unprivileged Windows) — nothing to assert
    }

    await swizzle('Linked', {cwd: root, output: './out-link'});
    const files = walk(path.join(root, 'out-link', 'Linked'));
    expect(files).toEqual(['index.ts']);
    expect(files).not.toContain('sub/leak.ts');
  });
});
