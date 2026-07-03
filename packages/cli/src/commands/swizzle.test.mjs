// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {rewriteImports} from './swizzle.mjs';

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

describe('rewriteImports (location-aware, nested files)', () => {
  const componentDir = '/repo/packages/core/src/Table';
  const nestedDir = '/repo/packages/core/src/Table/plugins/pagination';

  it('rewrites imports that escape the component from a nested file', () => {
    const input = `import { spacingVars } from '../../../theme/tokens.stylex';`;
    const result = rewriteImports(input, '@astryxdesign/core', {
      fromDir: nestedDir,
      componentDir,
    });
    expect(result).toBe(
      `import { spacingVars } from '@astryxdesign/core/theme';`,
    );
  });

  it('rewrites escaping sibling-component imports from a nested file', () => {
    const input = `import { Pagination } from '../../../Pagination';`;
    const result = rewriteImports(input, '@astryxdesign/core', {
      fromDir: nestedDir,
      componentDir,
    });
    expect(result).toBe(`import { Pagination } from '@astryxdesign/core/Pagination';`);
  });

  it('leaves intra-component imports from a nested file relative', () => {
    // '../../types' from Table/plugins/pagination resolves to Table/types,
    // which is copied alongside — it must stay relative, not become
    // '@astryxdesign/core/..'.
    const input = `import type { TablePlugin } from '../../types';`;
    const result = rewriteImports(input, '@astryxdesign/core', {
      fromDir: nestedDir,
      componentDir,
    });
    expect(result).toBe(`import type { TablePlugin } from '../../types';`);
  });

  it('leaves nested-sibling imports relative', () => {
    const input = `import { useTableSelection } from '../selection/useTableSelection';`;
    const result = rewriteImports(input, '@astryxdesign/core', {
      fromDir: nestedDir,
      componentDir,
    });
    expect(result).toBe(
      `import { useTableSelection } from '../selection/useTableSelection';`,
    );
  });

  it('matches legacy behavior for top-level files (fromDir === componentDir)', () => {
    const input = `import { tokens } from '../theme/tokens.stylex';`;
    const result = rewriteImports(input, '@astryxdesign/core', {
      fromDir: componentDir,
      componentDir,
    });
    expect(result).toBe(`import { tokens } from '@astryxdesign/core/theme';`);
  });
});
