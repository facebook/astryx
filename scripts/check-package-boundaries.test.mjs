// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Verifies the package boundary check.
 * @input Temporary repository trees with core and native source files.
 * @output Confirms core never imports native, and that no file anywhere under
 *   packages/native/ imports or reads core outside the listed build-time
 *   exceptions (AST-082 FR16).
 * @position Regression coverage for scripts/check-package-boundaries.js,
 *   which `pnpm check:repo` runs.
 */

import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {afterEach, describe, expect, it} from 'vitest';

const require = createRequire(import.meta.url);
const {
  findViolations,
  NATIVE_CORE_EXCEPTIONS,
} = require('./check-package-boundaries.js');

const roots = [];

function tree(files) {
  const root = mkdtempSync(path.join(tmpdir(), 'astryx-boundaries-'));
  roots.push(root);
  for (const [file, content] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(root, file)), {recursive: true});
    writeFileSync(path.join(root, file), content);
  }
  return root;
}

const files = violations => violations.map(violation => violation.file);

afterEach(() => {
  for (const root of roots.splice(0)) {
    rmSync(root, {recursive: true, force: true});
  }
});

describe('package boundaries', () => {
  it('pass on this repository', () => {
    expect(findViolations(path.resolve(import.meta.dirname, '..'))).toEqual([]);
  });

  it('fail when core imports native', () => {
    const root = tree({
      'packages/core/src/Button/Button.tsx':
        "import {Button} from '@astryxdesign/native';\n",
    });
    expect(files(findViolations(root))).toEqual([
      'packages/core/src/Button/Button.tsx',
    ]);
  });

  it('fail on a core import in any native folder, including a new one', () => {
    const root = tree({
      'packages/native/src/index.ts': "import '@astryxdesign/core';\n",
      'packages/native/scripts/generate.mjs':
        "import {Button} from '@astryxdesign/core/Button';\n",
      'packages/native/kotlin-android-1/scripts/theme.mjs':
        "const core = await import('@astryxdesign/core/theme');\n",
      'packages/native/swift-ios-1/tools/relative.cjs':
        "require('../../../core/src/index.ts');\n",
    });
    expect(files(findViolations(root)).sort()).toEqual([
      'packages/native/kotlin-android-1/scripts/theme.mjs',
      'packages/native/scripts/generate.mjs',
      'packages/native/src/index.ts',
      'packages/native/swift-ios-1/tools/relative.cjs',
    ]);
  });

  it("allow the theme generator's two core theme entries only in scripts/", () => {
    const root = tree({
      'packages/native/scripts/swift-ios-theme.mjs': [
        "const {defineTheme} = await import('@astryxdesign/core/theme');",
        "const {resolveThemeTokens} = await import('@astryxdesign/core/theme/tokens');",
      ].join('\n'),
      'packages/native/src/theme/theme.ts':
        "import {defineTheme} from '@astryxdesign/core/theme';\n",
    });
    expect(files(findViolations(root))).toEqual([
      'packages/native/src/theme/theme.ts',
    ]);
    expect(NATIVE_CORE_EXCEPTIONS.imports).toEqual([
      {
        directory: 'packages/native/scripts',
        specifiers: [
          '@astryxdesign/core/theme',
          '@astryxdesign/core/theme/tokens',
        ],
      },
    ]);
  });

  it("allow reading core's package as data only through the listed loader", () => {
    const reader = [
      'export const CORE_ROOT = path.join(',
      '  PACKAGE_ROOT,',
      "  'node_modules',",
      "  '@astryxdesign',",
      "  'core',",
      ');',
    ].join('\n');
    const root = tree({
      'packages/native/scripts/core-docs.mjs': reader,
      'packages/native/swift-ios-1/scripts/tokens.mjs': reader,
      'packages/native/src/read.ts':
        "readFileSync('node_modules/@astryxdesign/core/src/Button/Button.doc.mjs');\n",
    });
    expect(files(findViolations(root)).sort()).toEqual([
      'packages/native/src/read.ts',
      'packages/native/swift-ios-1/scripts/tokens.mjs',
    ]);
    expect(NATIVE_CORE_EXCEPTIONS.dataReaders).toEqual([
      'packages/native/scripts/core-docs.mjs',
    ]);
  });

  it('skip installed dependencies, build output, and Swift build state', () => {
    const root = tree({
      'packages/native/node_modules/@astryxdesign/core/index.js':
        "import './src/index.js';\nimport '@astryxdesign/core/theme';\n",
      'packages/native/dist/index.js': "import '@astryxdesign/core';\n",
      'packages/native/swift-ios-1/.build/plugin.mjs':
        "import '@astryxdesign/core';\n",
    });
    expect(findViolations(root)).toEqual([]);
  });
});
