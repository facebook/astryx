// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {rewriteImports, swizzle} from './swizzle.mjs';

// api/swizzle/ -> up 3 = packages/cli, up 4 = repo root (has packages/core).
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

describe('rewriteImports', () => {
  it('preserves the theme token subpath (StyleX module is a dedicated export)', () => {
    const input = `import { tokens } from '../theme/tokens.stylex';`;
    const result = rewriteImports(input);
    expect(result).toBe(
      `import { tokens } from '@astryxdesign/core/theme/tokens.stylex';`,
    );
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
    expect(result).toBe(
      `import { tokens } from "@astryxdesign/core/theme/tokens.stylex";`,
    );
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
        `import { tokens } from '@astryxdesign/core/theme/tokens.stylex';`,
        `import { mergeProps } from '@astryxdesign/core/utils';`,
        `import { helper } from './helper';`,
      ].join('\n'),
    );
  });

  it('rewrites a dynamic import() of a sibling component', () => {
    const input = `const T = lazy(() => import('../Tooltip/Tooltip'));`;
    expect(rewriteImports(input)).toBe(
      `const T = lazy(() => import('@astryxdesign/core/Tooltip'));`,
    );
  });

  it('rewrites a two-levels-up asset import to a valid subpath (never /..)', () => {
    const input = `import en from '../../locales/en.json' with {type: 'json'};`;
    const out = rewriteImports(input);
    expect(out).not.toContain('@astryxdesign/core/..');
    expect(out).toBe(
      `import en from '@astryxdesign/core/locales/en.json' with {type: 'json'};`,
    );
  });

  it('vendors a create-only .stylex import locally when ctx is provided', () => {
    const vendoredStylex = new Map();
    const input = `import { s } from '../Layer/layerAnimations.stylex';`;
    const result = rewriteImports(input, '@astryxdesign/core', {vendoredStylex});
    expect(result).toBe(
      `import { s } from './layerAnimations.stylex';`,
    );
    expect(vendoredStylex.size).toBe(1);
    expect(vendoredStylex.get('../Layer/layerAnimations.stylex')).toBe(
      'Layer/layerAnimations.stylex',
    );
  });

  it('falls back to barrel for create-only .stylex without ctx', () => {
    const input = `import { s } from '../Layer/layerAnimations.stylex';`;
    expect(rewriteImports(input)).toBe(
      `import { s } from '@astryxdesign/core/Layer';`,
    );
  });

  it('keeps defineVars .stylex imports as Core deep exports (not vendored)', () => {
    const vendoredStylex = new Map();
    const input = `import { interactionOverlayStyles } from '../utils/interactionOverlay.stylex';`;
    const result = rewriteImports(input, '@astryxdesign/core', {vendoredStylex});
    expect(result).toBe(
      `import { interactionOverlayStyles } from '@astryxdesign/core/utils/interactionOverlay.stylex';`,
    );
    // defineVars modules are NOT vendored
    expect(vendoredStylex.size).toBe(0);
  });

  it('keeps focusOutline.stylex as a Core deep export', () => {
    const vendoredStylex = new Map();
    const input = `import { focusOutlineProps } from '../utils/focusOutline.stylex';`;
    const result = rewriteImports(input, '@astryxdesign/core', {vendoredStylex});
    expect(result).toBe(
      `import { focusOutlineProps } from '@astryxdesign/core/utils/focusOutline.stylex';`,
    );
    expect(vendoredStylex.size).toBe(0);
  });

  it('vendors Layout/container.stylex locally (create-only)', () => {
    const vendoredStylex = new Map();
    const input = `import { container } from '../Layout/container.stylex';`;
    const result = rewriteImports(input, '@astryxdesign/core', {vendoredStylex});
    expect(result).toBe(
      `import { container } from './container.stylex';`,
    );
    expect(vendoredStylex.size).toBe(1);
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

describe('swizzle vendors .stylex dependencies for compilable output', () => {
  it('swizzle Button vendors its cross-directory .stylex imports', async () => {
    const outputName = '.astryx-swizzle-vendor-test-' + Date.now();
    try {
      const r = await (await import('./swizzle.mjs')).swizzle('Button', {
        cwd: REPO,
        output: outputName,
      });
      expect(r.type).toBe('swizzle.copy');
      const outDir = path.join(REPO, outputName, 'Button');
      const files = fs.readdirSync(outDir);
      // Should have vendored .stylex files alongside the component
      const vendored = files.filter(f => f.endsWith('.stylex.ts') && !f.startsWith('Button'));
      expect(vendored.length).toBeGreaterThan(0);
      // Each vendored file should exist and contain StyleX
      for (const v of vendored) {
        const content = fs.readFileSync(path.join(outDir, v), 'utf-8');
        expect(content).toContain('stylex');
      }
      // The main Button file should import them locally
      const buttonContent = fs.readFileSync(
        path.join(outDir, 'Button.tsx'),
        'utf-8',
      );
      // Should NOT have deep @astryxdesign/core paths for create-only modules
      expect(buttonContent).not.toMatch(/@astryxdesign\/core\/Icon\/IconSize\.stylex/);
      expect(buttonContent).not.toMatch(/@astryxdesign\/core\/Layout\/edgeCompensation\.stylex/);
      // Should have local ./foo.stylex for vendored create-only modules
      expect(buttonContent).toContain("from './IconSize.stylex'");
      expect(buttonContent).toContain("from './edgeCompensation.stylex'");
      // Should KEEP Core deep export for defineVars modules (theme overrides)
      expect(buttonContent).toContain("from '@astryxdesign/core/utils/interactionOverlay.stylex'");
      expect(buttonContent).toContain("from '@astryxdesign/core/utils/focusOutline.stylex'");
    } finally {
      fs.rmSync(path.join(REPO, outputName), {recursive: true, force: true});
    }
  });
});
