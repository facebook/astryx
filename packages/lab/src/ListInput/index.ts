// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports ListInput and public types from ListInput.tsx
 * @output Public ListInput entry point for @astryxdesign/lab
 * @position Component barrel; re-exported by /packages/lab/src/index.ts
 *
 * SYNC: When modified, update /packages/lab/src/ListInput/ListInput.tsx.
 */

export {ListInput} from './ListInput';
export type {
  ListInputChange,
  ListInputColumn,
  ListInputProps,
  ListInputRenderContext,
  ListInputValueContext,
} from './ListInput';
