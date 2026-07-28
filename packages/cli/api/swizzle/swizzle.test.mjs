// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {rewriteImports, swizzle} from './swizzle.mjs';

// api/swizzle/ -> up 3 = packages/cli, up 4 = repo root (has packages/core).
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

describe('rewriteImports', () => {
  it('rewrites ../theme/tokens to @astryxdesign/core/theme', () => {
    const input = `import { tokens } from '../theme/tokens.stylex';`;
    const result = rewriteImports(input);
    expect(result).toBe(`import { tokens } from '@astryxdesign/core/theme';`);
  });

  it('rewrites ../utils/mergeProps to @astryxdesign/core/utils', () => {
    const input = `import { mergeProps } from '../utils/mergeProps';`;
    const result = rewriteImports(input);
    expect(result).toBe(`import { mergeProps } from '@astryxdesign/core/utils';`);
  });

  it('leaves same-level relative imports untouched', () => {
    const input = `import { helper } from './helper';`;
    const result = rewriteImports(input);
    expect(result).toBe(`import { helper } from './helper';`);
  });

  it('rewrites export from statements', () => {
    const input = `export { foo } from '../hooks/useLayout';`;
    const result = rewriteImports(input);
    expect(result).toBe(`export { foo } from '@astryxdesign/core/hooks';`);
  });

  it('handles double quotes', () => {
    const input = `import { tokens } from "../theme/tokens.stylex";`;
    const result = rewriteImports(input);
    expect(result).toBe(`import { tokens } from "@astryxdesign/core/theme";`);
  });

  it('handles multiple imports in one file', () => {
    const input = [
      `import { tokens } from '../theme/tokens.stylex';`,
      `import { mergeProps } from '../utils/mergeProps';`,
      `import { helper } from './helper';`,
    ].join('\n');

    const result = rewriteImports(input);
    expect(result).toBe(
      [
        `import { tokens } from '@astryxdesign/core/theme';`,
        `import { mergeProps } from '@astryxdesign/core/utils';`,
        `import { helper } from './helper';`,
      ].join('\n'),
    );
  });
});

/**
 * Path-aware rewriting. Without `componentDir`/`rootDir` the rewrite can only
 * guess: it strips one `../` and keeps the first segment, which is right for a
 * FLAT layout (core, integrations, `docs: './src'` with `src/<Name>/`) and
 * produces `<owner>/..` for anything deeper. Given the two directories it
 * resolves the import for real, so nested layouts rewrite correctly and imports
 * escaping the package are reported instead of mangled.
 */
describe('rewriteImports — resolved against the owner package', () => {
  const core = {componentDir: '/pkg/src/Button', rootDir: '/pkg/src'};
  const nested = {
    componentDir: '/pkg/src/components/AppShell',
    rootDir: '/pkg/src',
  };

  it('is byte-identical to the flat rewrite for a core-shaped layout', () => {
    const input = [
      `import { tokens } from '../theme/tokens.stylex';`,
      `import { mergeProps } from '../utils/mergeProps';`,
      `import { deep } from '../utils/nested/deep';`,
      `import { bare } from '../theme';`,
      `import { helper } from './helper';`,
    ].join('\n');

    expect(rewriteImports(input, '@astryxdesign/core', core)).toBe(
      rewriteImports(input, '@astryxdesign/core'),
    );
  });

  it('resolves a multi-level escape instead of emitting <owner>/..', () => {
    const input = `import two from '../../theme/two';`;
    // Flat guess: '@ext/widgets/..' — not a module specifier at all.
    expect(rewriteImports(input, '@ext/widgets')).toContain('@ext/widgets/..');
    expect(rewriteImports(input, '@ext/widgets', nested)).toBe(
      `import two from '@ext/widgets/theme';`,
    );
  });

  it('names the subpath from the package root, not from the component', () => {
    const input = `import one from '../shared/one';`;
    expect(rewriteImports(input, '@ext/widgets', nested)).toBe(
      `import one from '@ext/widgets/components';`,
    );
  });

  it('leaves an import that escapes the package untouched', () => {
    const input = `import three from '../../../pkgroot';`;
    expect(rewriteImports(input, '@ext/widgets', nested)).toBe(input);
  });

  it('reports every import it could not resolve', () => {
    const unresolved = [];
    const input = [
      `import a from '../../../out';`,
      `import b from '../theme/ok';`,
      `import c from '../../../../way/out';`,
    ].join('\n');

    rewriteImports(input, '@ext/widgets', {
      ...nested,
      onUnresolved: s => unresolved.push(s),
    });
    expect(unresolved).toEqual(['../../../out', '../../../../way/out']);
  });
});

describe('swizzle() API', () => {
  it('no component → swizzle.list of core components', async () => {
    const r = await swizzle(undefined, {cwd: REPO});
    expect(r.type).toBe('swizzle.list');
    expect(Array.isArray(r.data)).toBe(true);
    expect(r.data).toContain('Button');
  });

  it('--list → swizzle.list even with a component arg', async () => {
    const r = await swizzle('Button', {cwd: REPO, list: true});
    expect(r.type).toBe('swizzle.list');
  });

  it('unknown component → AstryxError ERR_UNKNOWN_COMPONENT with suggestions', async () => {
    await expect(swizzle('NotARealComponent99', {cwd: REPO})).rejects.toMatchObject({
      code: 'ERR_UNKNOWN_COMPONENT',
    });
  });
});
