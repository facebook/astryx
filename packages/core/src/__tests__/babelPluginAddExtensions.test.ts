// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Guards the build-time babel plugin that rewrites extensionless relative
 * specifiers to fully-specified ESM paths in dist (issue #4569: dynamic
 * `import()` specifiers were passed through untouched, so the published
 * "type": "module" dist broke strict-ESM consumers like Rspack and Node).
 *
 * The plugin resolves specifiers against the importing file's real directory
 * (fs.existsSync on .ts/.tsx/index siblings), so the file/directory cases run
 * against a temp fixture tree, and one case pins the exact in-repo bug site
 * (Text.tsx lazily importing ../Tooltip/Tooltip).
 */
import fs from 'node:fs';
import os from 'node:os';
import {createRequire} from 'node:module';
import path from 'node:path';
import {describe, it, expect, beforeAll, afterAll} from 'vitest';

const require = createRequire(__filename);
const babel = require('@babel/core');
const addExtensions = require('../../babel-plugin-add-extensions.cjs');

/** Transform a snippet exactly as build:esm does for `filename`. */
function transform(
  code: string,
  filename: string,
  parserOpts?: Record<string, unknown>,
): string {
  const result = babel.transformSync(code, {
    filename,
    configFile: false,
    babelrc: false,
    plugins: [addExtensions],
    ...(parserOpts ? {parserOpts} : {}),
  });
  return result?.code ?? '';
}

const textTsx = path.resolve(__dirname, '../Text/Text.tsx');

let fixtureDir: string;
let entry: string;

beforeAll(() => {
  fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), 'add-extensions-'));
  fs.writeFileSync(path.join(fixtureDir, 'mod.ts'), 'export const x = 1;\n');
  fs.mkdirSync(path.join(fixtureDir, 'dir'));
  fs.writeFileSync(
    path.join(fixtureDir, 'dir', 'index.ts'),
    'export const y = 2;\n',
  );
  // `both` exists as a file AND a directory-with-index — the file must win.
  fs.writeFileSync(path.join(fixtureDir, 'both.ts'), 'export const b = 3;\n');
  fs.mkdirSync(path.join(fixtureDir, 'both'));
  fs.writeFileSync(
    path.join(fixtureDir, 'both', 'index.ts'),
    'export const bi = 4;\n',
  );
  // The importing file itself never needs to exist — the plugin only uses
  // its dirname as the resolution base.
  entry = path.join(fixtureDir, 'entry.ts');
});

afterAll(() => {
  fs.rmSync(fixtureDir, {recursive: true, force: true});
});

describe('babel-plugin-add-extensions', () => {
  describe('dynamic import()', () => {
    it('appends .js to a dynamic import() of a relative file', () => {
      // The exact shape of the LazyXDSTooltip sites in Text/Heading/Timestamp.
      const code = transform(
        "const LazyXDSTooltip = lazy(async () => import('../Tooltip/Tooltip').then(mod => ({default: mod.Tooltip})));",
        textTsx,
      );
      expect(code).toMatch(/import\(['"]\.\.\/Tooltip\/Tooltip\.js['"]\)/);
    });

    it('rewrites a dynamic import() of a directory to its index.js', () => {
      const code = transform("const p = import('./dir');", entry);
      expect(code).toMatch(/import\(['"]\.\/dir\/index\.js['"]\)/);
    });

    it('leaves a dynamic import() that already has an extension alone', () => {
      const code = transform("const p = import('./mod.js');", entry);
      expect(code).toMatch(/import\(['"]\.\/mod\.js['"]\)/);
    });

    it('leaves a dynamic import() of a bare specifier alone', () => {
      const code = transform("const p = import('react');", entry);
      expect(code).toMatch(/import\(['"]react['"]\)/);
    });

    it('leaves a dynamic import() of a non-literal specifier alone', () => {
      const code = transform('const p = (s) => import(s);', entry);
      expect(code).toContain('import(s)');
    });

    it('leaves a dynamic import() of a template literal alone', () => {
      const code = transform(
        'const p = (n) => import(`./locales/${n}`);',
        entry,
      );
      expect(code).toContain('import(`./locales/${n}`)');
    });

    it('rewrites ImportExpression nodes (Babel 8 / createImportExpressions parse)', () => {
      const code = transform("const p = import('./mod');", entry, {
        createImportExpressions: true,
      });
      expect(code).toMatch(/import\(['"]\.\/mod\.js['"]\)/);
    });

    it('prefers the file over a same-named directory index', () => {
      const code = transform("const p = import('./both');", entry);
      expect(code).toMatch(/import\(['"]\.\/both\.js['"]\)/);
    });

    it("rewrites a dynamic import of '.' to './index.js'", () => {
      const code = transform("const p = import('.');", entry);
      expect(code).toMatch(/import\(['"]\.\/index\.js['"]\)/);
    });

    it('rewrites every dynamic import in a file', () => {
      const code = transform(
        "const a = import('./mod');\nconst b = import('./dir');",
        entry,
      );
      expect(code).toMatch(/import\(['"]\.\/mod\.js['"]\)/);
      expect(code).toMatch(/import\(['"]\.\/dir\/index\.js['"]\)/);
    });

    it('leaves a dynamic import() of a skipped extension alone', () => {
      const code = transform("const p = import('./data.json');", entry);
      expect(code).toMatch(/import\(['"]\.\/data\.json['"]\)/);
    });

    it('does not touch call expressions that are not import()', () => {
      const code = transform(
        "myImport('./mod');\nregistry.import('./mod');",
        entry,
      );
      expect(code).toContain("myImport('./mod')");
      expect(code).toContain("registry.import('./mod')");
    });
  });

  describe('static declarations (pre-existing behavior)', () => {
    it('appends .js to a static import of a relative file', () => {
      const code = transform("import {x} from './mod';", entry);
      expect(code).toMatch(/from ['"]\.\/mod\.js['"]/);
    });

    it('rewrites a static import of a directory to its index.js', () => {
      const code = transform("import {y} from './dir';", entry);
      expect(code).toMatch(/from ['"]\.\/dir\/index\.js['"]/);
    });

    it('appends .js to a re-export specifier', () => {
      const code = transform("export {x} from './mod';", entry);
      expect(code).toMatch(/from ['"]\.\/mod\.js['"]/);
    });

    it('appends .js to an export * specifier', () => {
      const code = transform("export * from './mod';", entry);
      expect(code).toMatch(/from ['"]\.\/mod\.js['"]/);
    });

    it("rewrites the '.' self-reference to './index.js'", () => {
      const code = transform("export * from '.';", entry);
      expect(code).toMatch(/from ['"]\.\/index\.js['"]/);
    });

    it('leaves bare specifiers alone', () => {
      const code = transform("import {lazy} from 'react';", entry);
      expect(code).toMatch(/from ['"]react['"]/);
    });

    it('appends .js even when no source sibling exists (fallback branch)', () => {
      const code = transform("import {z} from './does-not-exist';", entry);
      expect(code).toMatch(/from ['"]\.\/does-not-exist\.js['"]/);
    });

    it('leaves declarations without a source untouched', () => {
      const code = transform('export const a = 1;', entry);
      expect(code).toContain('export const a = 1;');
    });
  });
});
