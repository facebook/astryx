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
