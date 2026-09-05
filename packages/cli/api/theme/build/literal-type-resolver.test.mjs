// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import {
  createLiteralTypeResolver,
  findComponentSourceFile,
} from './literal-type-resolver.mjs';

let root;

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-literal-types-'));
});

afterEach(() => {
  fs.rmSync(root, {recursive: true, force: true});
});

function write(relative, source) {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, source);
  return file;
}

describe('module-aware literal type resolution', () => {
  it('resolves local aliases composed from finite string and number unions', async () => {
    const owner = write(
      'Avatar.tsx',
      `type Named = 'sm' | 'md';
       type Numeric = 16 | 24;
       export type AvatarSize = Named | Numeric;`,
    );
    const resolver = await createLiteralTypeResolver();

    expect(resolver.resolve('AvatarSize', owner)).toEqual([
      'sm',
      'md',
      '16',
      '24',
    ]);
  });

  it('follows named imports through a directory barrel re-export', async () => {
    write('avatar/Avatar.ts', `export type AvatarSize = 'sm' | 'lg';`);
    write('avatar/index.ts', `export type {AvatarSize} from './Avatar';`);
    const owner = write(
      'group/AvatarGroup.tsx',
      `import type {AvatarSize} from '../avatar';
       export interface Props {size?: AvatarSize}`,
    );
    const resolver = await createLiteralTypeResolver();

    expect(resolver.resolve('AvatarSize', owner)).toEqual(['sm', 'lg']);
  });

  it('follows aliased named re-exports and imports', async () => {
    write('types.ts', `export type InternalSize = 'small' | 'large';`);
    write(
      'public.ts',
      `export type {InternalSize as PublicSize} from './types';`,
    );
    const owner = write(
      'consumer.ts',
      `import type {PublicSize as ComponentSize} from './public';`,
    );
    const resolver = await createLiteralTypeResolver();

    expect(resolver.resolve('ComponentSize', owner)).toEqual([
      'small',
      'large',
    ]);
  });

  it('uses a sibling file before a same-named directory index', async () => {
    write('types.ts', `export type Size = 'file-a' | 'file-b';`);
    write(
      'types/index.ts',
      `export type Size = 'directory-a' | 'directory-b';`,
    );
    const owner = write('consumer.ts', `import type {Size} from './types';`);
    const resolver = await createLiteralTypeResolver();

    expect(resolver.resolve('Size', owner)).toEqual(['file-a', 'file-b']);
  });

  it('applies TypeScript extension substitution before a sibling JavaScript file', async () => {
    write('types.ts', `export type Size = 'source-a' | 'source-b';`);
    write('types.js', `export const Size = 'runtime';`);
    const owner = write('consumer.ts', `import type {Size} from './types.js';`);
    const resolver = await createLiteralTypeResolver();

    expect(resolver.resolve('Size', owner)).toEqual(['source-a', 'source-b']);
  });

  it('uses jsx, mjs, and cjs extension-specific substitutions', async () => {
    write('jsx-module.ts', `export type Size = 'wrong-ts-a' | 'wrong-ts-b';`);
    write('jsx-module.tsx', `export type Size = 'jsx-a' | 'jsx-b';`);
    write('module.ts', `export type Size = 'wrong-ts-a' | 'wrong-ts-b';`);
    write('module.mts', `export type Size = 'esm-a' | 'esm-b';`);
    write('common.cts', `export type Size = 'cjs-a' | 'cjs-b';`);
    const jsxOwner = write(
      'jsx-consumer.ts',
      `import type {Size} from './jsx-module.jsx';`,
    );
    const esmOwner = write(
      'esm-consumer.ts',
      `import type {Size} from './module.mjs';`,
    );
    const cjsOwner = write(
      'cjs-consumer.ts',
      `import type {Size} from './common.cjs';`,
    );
    const resolver = await createLiteralTypeResolver();

    expect(resolver.resolve('Size', jsxOwner)).toEqual(['jsx-a', 'jsx-b']);
    expect(resolver.resolve('Size', esmOwner)).toEqual(['esm-a', 'esm-b']);
    expect(resolver.resolve('Size', cjsOwner)).toEqual(['cjs-a', 'cjs-b']);
  });

  it('does not resolve extensionless imports to mts or cts files', async () => {
    write('module.mts', `export type Size = 'esm-a' | 'esm-b';`);
    write('common.cts', `export type Density = 'cjs-a' | 'cjs-b';`);
    const owner = write(
      'consumer.ts',
      `import type {Size} from './module';
       import type {Density} from './common';`,
    );
    const resolver = await createLiteralTypeResolver();

    expect(resolver.resolve('Size', owner)).toBeNull();
    expect(resolver.resolve('Density', owner)).toBeNull();
  });

  it('honors a directory package types entry instead of index.ts', async () => {
    write('types/package.json', JSON.stringify({types: './public.d.ts'}));
    write('types/public.d.ts', `export type Size = 'public-a' | 'public-b';`);
    write('types/index.ts', `export type Size = 'index-a' | 'index-b';`);
    const owner = write('consumer.ts', `import type {Size} from './types';`);
    const resolver = await createLiteralTypeResolver();

    expect(resolver.resolve('Size', owner)).toEqual(['public-a', 'public-b']);
  });

  it('uses a sibling TypeScript file before directory package metadata', async () => {
    write('types.ts', `export type Size = 'file-a' | 'file-b';`);
    write('types/package.json', JSON.stringify({main: './index.js'}));
    write('types/index.ts', `export type Size = 'index-a' | 'index-b';`);
    const owner = write('consumer.ts', `import type {Size} from './types';`);
    const resolver = await createLiteralTypeResolver();

    expect(resolver.resolve('Size', owner)).toEqual(['file-a', 'file-b']);
  });

  it('honors a directory package main entry through TypeScript resolution', async () => {
    write('types/package.json', JSON.stringify({main: './index.js'}));
    write('types/index.ts', `export type Size = 'index-a' | 'index-b';`);
    const owner = write('consumer.ts', `import type {Size} from './types';`);
    const resolver = await createLiteralTypeResolver();

    expect(resolver.resolve('Size', owner)).toEqual(['index-a', 'index-b']);
  });

  it('honors imported aliases instead of matching the imported name globally', async () => {
    write('compact.ts', `export type Size = 'sm' | 'md';`);
    write('display.ts', `export type Size = 'hero' | 'billboard';`);
    const compactOwner = write(
      'CompactControl.tsx',
      `import type {Size as ControlSize} from './compact';`,
    );
    const displayOwner = write(
      'Display.tsx',
      `import type {Size} from './display';`,
    );
    const resolver = await createLiteralTypeResolver();

    expect(resolver.resolve('ControlSize', compactOwner)).toEqual(['sm', 'md']);
    expect(resolver.resolve('Size', displayOwner)).toEqual([
      'hero',
      'billboard',
    ]);
  });

  it('keeps unrelated same-named declarations from invalidating a binding', async () => {
    write('one.ts', `export type Variant = 'one-a' | 'one-b';`);
    write('two.ts', `export type Variant = 'two-a' | 'two-b';`);
    const owner = write('consumer.ts', `import type {Variant} from './one';`);
    const resolver = await createLiteralTypeResolver();

    expect(resolver.resolve('Variant', owner)).toEqual(['one-a', 'one-b']);
  });

  it('returns unresolved for generic aliases and references with arguments', async () => {
    const owner = write(
      'generic.ts',
      `type T = 'outer';
       type Size<T> = T | 'fixed';`,
    );
    const resolver = await createLiteralTypeResolver();

    expect(resolver.resolve('Size', owner)).toBeNull();
    expect(resolver.resolve("Size<'inner'>", owner)).toBeNull();
  });

  it('returns unresolved for aliases colliding with imported bindings', async () => {
    write('types.ts', `export type Imported = 'import-a' | 'import-b';`);
    const owner = write(
      'collision.ts',
      `import type {Imported as Size} from './types';
       type Size = 'local-a' | 'local-b';`,
    );
    const resolver = await createLiteralTypeResolver();

    expect(resolver.resolve('Size', owner)).toBeNull();
  });

  it('returns unresolved for conflicting direct and re-exported names', async () => {
    write('types.ts', `export type Imported = 'import-a' | 'import-b';`);
    write(
      'public.ts',
      `export type Size = 'local-a' | 'local-b';
       export type {Imported as Size} from './types';`,
    );
    const owner = write('consumer.ts', `import type {Size} from './public';`);
    const resolver = await createLiteralTypeResolver();

    expect(resolver.resolve('Size', owner)).toBeNull();
  });

  it('ignores function- and namespace-scoped aliases when resolving module bindings', async () => {
    const exported = write(
      'exported.ts',
      `export type Size = 'top-a' | 'top-b';
       namespace Hidden { export type Size = 'namespace-a' | 'namespace-b'; }
       function shadow() { type Size = 'function-a' | 'function-b'; return null; }`,
    );
    const nestedOnly = write(
      'nested-only.ts',
      `namespace Hidden { export type Size = 'namespace-a' | 'namespace-b'; }
       function shadow() { type Size = 'function-a' | 'function-b'; return null; }`,
    );
    const consumer = write(
      'consumer.ts',
      `import type {Size} from './exported';`,
    );
    const invalidConsumer = write(
      'invalid-consumer.ts',
      `import type {Size} from './nested-only';`,
    );
    const resolver = await createLiteralTypeResolver();

    expect(resolver.resolve('Size', exported)).toEqual(['top-a', 'top-b']);
    expect(resolver.resolve('Size', consumer)).toEqual(['top-a', 'top-b']);
    expect(resolver.resolve('Size', nestedOnly)).toBeNull();
    expect(resolver.resolve('Size', invalidConsumer)).toBeNull();
  });

  it('returns unresolved for cycles, external imports, and non-literal members', async () => {
    const cyclic = write(
      'cyclic.ts',
      `type A = B | 'a';
       type B = A | 'b';`,
    );
    const external = write(
      'external.ts',
      `import type {ReactNode} from 'react';`,
    );
    const open = write('open.ts', `type Open = 'fixed' | string;`);
    const resolver = await createLiteralTypeResolver();

    expect(resolver.resolve('A', cyclic)).toBeNull();
    expect(resolver.resolve('ReactNode', external)).toBeNull();
    expect(resolver.resolve('Open', open)).toBeNull();
  });

  it('rejects parser-recovered or injected doc type strings', async () => {
    const owner = write('types.ts', `type Size = 'sm' | 'md';`);
    const resolver = await createLiteralTypeResolver();

    expect(resolver.resolve('Size trailing garbage', owner)).toBeNull();
    expect(resolver.resolve("'ok' trailing garbage", owner)).toBeNull();
    expect(resolver.resolve("'ok'; type Injected = 'bad'", owner)).toBeNull();
  });

  it('normalizes inline and checker-resolved negative zero identically', async () => {
    const owner = write('types.ts', `type Signed = -0 | -1;`);
    const resolver = await createLiteralTypeResolver();

    expect(resolver.resolve('-0 | -1', owner)).toEqual(['0', '-1']);
    expect(resolver.resolve('Signed', owner)).toEqual(['0', '-1']);
  });

  it('finds colocated and top-level component source owners', () => {
    const coreSrc = path.join(root, 'src');
    const colocatedDoc = write('src/AvatarGroup/AvatarGroup.doc.mjs', '');
    const colocatedSource = write('src/AvatarGroup/AvatarGroup.tsx', '');
    const aggregateDoc = write('src/Text/Heading.doc.mjs', '');
    write('src/Text/index.ts', `export type Heading = 'wrong-barrel';`);
    const topLevelSource = write('src/Heading/Heading.tsx', '');

    expect(findComponentSourceFile(coreSrc, 'AvatarGroup', colocatedDoc)).toBe(
      colocatedSource,
    );
    expect(findComponentSourceFile(coreSrc, 'Heading', aggregateDoc)).toBe(
      topLevelSource,
    );
  });
});
