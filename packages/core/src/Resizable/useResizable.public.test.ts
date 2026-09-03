// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useResizable.public.test.ts
 * @input Public useResizable configuration types
 * @output Compile-time assertions on the bound vocabulary
 * @position Testing; pins the public type surface of AST-010 FR13/API3
 *
 * These assertions are about what the COMPILER accepts. The runtime parser is
 * covered in useResizable.test.ts, and it stays authoritative for anything a
 * type cannot express — a percentage above 100, a negative, a non-finite.
 */

import {describe, expectTypeOf, it} from 'vitest';
import type {
  ResizableLength,
  ResizableSize,
  UseResizableSingleConfig,
} from './useResizable';

describe('ResizableSize (AST-010 FR13/API3)', () => {
  it('accepts the released spellings', () => {
    expectTypeOf<333>().toMatchTypeOf<ResizableSize>();
    expectTypeOf<'333px'>().toMatchTypeOf<ResizableSize>();
    expectTypeOf<'40%'>().toMatchTypeOf<ResizableSize>();
    expectTypeOf<ResizableLength>().toMatchTypeOf<ResizableSize>();
  });

  it('accepts min() and max() over lengths', () => {
    expectTypeOf<'max(40%, 333px)'>().toMatchTypeOf<ResizableSize>();
    expectTypeOf<'min(400px, 10%)'>().toMatchTypeOf<ResizableSize>();
    expectTypeOf<'max(333px, 40%)'>().toMatchTypeOf<ResizableSize>();
  });

  it('accepts one level of nesting', () => {
    expectTypeOf<'max(20%, min(500px, 60%))'>().toMatchTypeOf<ResizableSize>();
    expectTypeOf<'min(max(100px, 10%), 400px)'>().toMatchTypeOf<ResizableSize>();
  });

  it('rejects units and functions outside the grammar', () => {
    expectTypeOf<'banana'>().not.toMatchTypeOf<ResizableSize>();
    expectTypeOf<'40vw'>().not.toMatchTypeOf<ResizableSize>();
    expectTypeOf<'20rem'>().not.toMatchTypeOf<ResizableSize>();
    expectTypeOf<'calc(100% - 3rem)'>().not.toMatchTypeOf<ResizableSize>();
    expectTypeOf<'clamp(100px, 40%, 500px)'>().not.toMatchTypeOf<ResizableSize>();
    expectTypeOf<'var(--w)'>().not.toMatchTypeOf<ResizableSize>();
    expectTypeOf<'max(40%, 20rem)'>().not.toMatchTypeOf<ResizableSize>();
    // Unclosed, and a bare function with nothing to choose between.
    expectTypeOf<'max(40%, 333px'>().not.toMatchTypeOf<ResizableSize>();
    expectTypeOf<'max(40%)'>().not.toMatchTypeOf<ResizableSize>();
  });

  it('rejects nesting past the documented depth', () => {
    expectTypeOf<
      'max(10%, min(20%, max(30%, 40px)))'
    >().not.toMatchTypeOf<ResizableSize>();
  });
});

describe('bound configuration (AST-010 API4)', () => {
  it('accepts an expression as either bound', () => {
    const floor: UseResizableSingleConfig = {minSize: 'max(40%, 333px)'};
    const ceiling: UseResizableSingleConfig = {maxSize: 'min(400px, 10%)'};
    expectTypeOf(floor).toMatchTypeOf<UseResizableSingleConfig>();
    expectTypeOf(ceiling).toMatchTypeOf<UseResizableSingleConfig>();
  });

  it('keeps the released pixel-alias callsites compiling', () => {
    const released: UseResizableSingleConfig = {
      defaultSize: 200,
      minSizePx: 100,
      maxSizePx: 400,
    };
    expectTypeOf(released).toMatchTypeOf<UseResizableSingleConfig>();
  });

  it('still lets one bound migrate while the other keeps its alias', () => {
    const mixed: UseResizableSingleConfig = {
      minSize: 'max(40%, 333px)',
      maxSizePx: 960,
    };
    expectTypeOf(mixed).toMatchTypeOf<UseResizableSingleConfig>();
  });

  it('still rejects both spellings of one bound', () => {
    // @ts-expect-error -- minSize and minSizePx are mutually exclusive
    const conflict: UseResizableSingleConfig = {
      minSize: 'max(40%, 333px)',
      minSizePx: 100,
    };
    void conflict;
  });

  it('leaves defaultSize on its released wide type', () => {
    // `defaultSize` shipped as `number | string` and stays that way, so a
    // computed string still compiles. It resolves an expression once, exactly
    // as it already resolves `'50%'` once — same grammar, same one-time
    // resolution, no special case.
    const released: UseResizableSingleConfig = {defaultSize: '50%'};
    const computed: UseResizableSingleConfig = {
      defaultSize: `${40}%` as string,
    };
    expectTypeOf(released).toMatchTypeOf<UseResizableSingleConfig>();
    expectTypeOf(computed).toMatchTypeOf<UseResizableSingleConfig>();
  });
});
