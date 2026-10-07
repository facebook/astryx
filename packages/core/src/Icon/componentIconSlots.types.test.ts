// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file componentIconSlots.types.test.ts
 * @input Consumer-shaped TypeScript sources compiled against the public
 *   `@astryxdesign/core/Icon` and `@astryxdesign/core/theme` entry modules
 * @output Vitest failures when component icon slot augmentation stops reaching
 *   the public types, or when an undeclared slot type-checks
 * @position Type-level guard for the slot types declared in ./index.ts. The
 *   in-package tests augment `./index` program-wide, so only a separate
 *   program can show what a consumer sees with and without augmentation.
 *
 * Module augmentation only widens an interface declared in the module the
 * specifier resolves to. Each scenario here is compiled as its own program,
 * importing the public subpaths exactly as a consumer package does. Source
 * re-exports can hide a misplaced declaration from that check, so the first
 * test also pins the declaration itself to the public entry module.
 */

import {describe, expect, it} from 'vitest';
import {readdirSync, readFileSync} from 'node:fs';
import {join} from 'node:path';
import ts from 'typescript';

const CORE_ROOT = join(__dirname, '..', '..');

/** Type-check one consumer file; return its diagnostics as `line: message`. */
function typecheck(source: string): string[] {
  const fileName = join(CORE_ROOT, '__consumer__', 'consumer.tsx');
  const options: ts.CompilerOptions = {
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    target: ts.ScriptTarget.ES2022,
    lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'],
    types: [],
    paths: {'@astryxdesign/core/*': [join(CORE_ROOT, 'src/*/index.ts')]},
  };
  const host = ts.createCompilerHost(options);
  const readFile = host.readFile.bind(host);
  const fileExists = host.fileExists.bind(host);
  const getSourceFile = host.getSourceFile.bind(host);
  host.readFile = f => (f === fileName ? source : readFile(f));
  host.fileExists = f => f === fileName || fileExists(f);
  host.getSourceFile = (f, languageVersion, ...rest) =>
    f === fileName
      ? ts.createSourceFile(f, source, languageVersion, true, ts.ScriptKind.TSX)
      : getSourceFile(f, languageVersion, ...rest);

  const program = ts.createProgram([fileName], options, host);
  expect(program.getOptionsDiagnostics()).toEqual([]);
  return ts
    .getPreEmitDiagnostics(program)
    .filter(d => d.file?.fileName === fileName)
    .map(d => {
      const {line} = d.file!.getLineAndCharacterOfPosition(d.start ?? 0);
      return `${line + 1}: ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`;
    });
}

/** Files under src/Icon that declare `interface ComponentIconSlotMap`. */
function slotMapDeclarations(): {file: string; exported: boolean}[] {
  const found: {file: string; exported: boolean}[] = [];
  for (const file of readdirSync(__dirname)) {
    if (!/\.tsx?$/.test(file) || file.includes('.test.')) {
      continue;
    }
    const sourceFile = ts.createSourceFile(
      file,
      readFileSync(join(__dirname, file), 'utf8'),
      ts.ScriptTarget.Latest,
      true,
    );
    for (const statement of sourceFile.statements) {
      if (
        ts.isInterfaceDeclaration(statement) &&
        statement.name.text === 'ComponentIconSlotMap'
      ) {
        found.push({
          file,
          exported:
            statement.modifiers?.some(
              m => m.kind === ts.SyntaxKind.ExportKeyword,
            ) ?? false,
        });
      }
    }
  }
  return found;
}

describe('component icon slot types (consumer view)', () => {
  it('declares the slot map in the public entry module, not a re-export', () => {
    expect(slotMapDeclarations()).toEqual([{file: 'index.ts', exported: true}]);
  });

  it('rejects an undeclared slot when nothing augments the map', () => {
    const errors = typecheck(`
import {defineTheme} from '@astryxdesign/core/theme';
import {getComponentIconName} from '@astryxdesign/core/Icon';
import type {ComponentIconMap} from '@astryxdesign/core/Icon';

export const empty: ComponentIconMap = {};
export const theme = defineTheme({name: 'a', componentIcons: {}});
export const bad = defineTheme({
  name: 'b',
  componentIcons: {'undeclared-widget-role': 'success'},
});
export const badNull: ComponentIconMap = {'undeclared-widget-role': null};
export const badCall = getComponentIconName('undeclared-widget-role', 'close');
`);

    expect(errors.map(e => e.split(':')[0])).toEqual(['10', '12', '13']);
  }, 30_000);

  it('accepts slots a package declares by augmenting the public Icon module', () => {
    const errors = typecheck(`
import {defineTheme} from '@astryxdesign/core/theme';
import {
  getComponentIcon,
  getComponentIconName,
  useComponentIcon,
  type ComponentIconMap,
  type ComponentIconSlotName,
  type IconName,
} from '@astryxdesign/core/Icon';

declare module '@astryxdesign/core/Icon' {
  interface ComponentIconSlotMap {
    'brand-card-dismiss': true;
  }
}

export const slot: ComponentIconSlotName = 'brand-card-dismiss';
export const theme = defineTheme({
  name: 'brand',
  componentIcons: {'brand-card-dismiss': 'close'},
});
export const hidden: ComponentIconMap = {'brand-card-dismiss': null};
export const name: IconName | null = getComponentIconName('brand-card-dismiss', 'close', theme);
export const node = getComponentIcon('brand-card-dismiss', null, 'brand');
export function useDismiss() {
  return useComponentIcon('brand-card-dismiss', 'close');
}

export const undeclared = defineTheme({
  name: 'typo',
  componentIcons: {'brand-card-dismis': 'close'},
});
export const notShared: IconName = 'brand-card-dismiss';
export const artwork: ComponentIconMap = {'brand-card-dismiss': 'brand-x'};
export const element: ComponentIconMap = {'brand-card-dismiss': <svg />};
export const extension: ComponentIconMap = {'brand-card-dismiss': 'richtext:bold'};
export const extensionFallback = getComponentIcon('brand-card-dismiss', 'richtext:bold');
`);

    expect(errors).toEqual([
      expect.stringMatching(/^32: .*'brand-card-dismis'/),
      expect.stringMatching(/^34: .*'"brand-card-dismiss"'.*'IconName'/),
      expect.stringMatching(/^35: .*'"brand-x"'.*'IconName \| null/),
      expect.stringMatching(/^36: .*'Element'.*'IconName \| null/),
      expect.stringMatching(/^37: .*'"richtext:bold"'.*'IconName \| null/),
      expect.stringMatching(/^38: .*'"richtext:bold"'.*'IconName \| null'/),
    ]);
  }, 30_000);
});
