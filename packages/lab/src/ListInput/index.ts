// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports ListInput component and types from ListInput.tsx
 * @output Exports ListInput, ListInputProps, ListInputColumn, ListInputChange,
 *   ListInputRenderContext, ListInputValueContext
 * @position Component entry point; re-exported by /packages/lab/src/index.ts
 *
 * SYNC: When modified, update this header and
 * /packages/lab/src/ListInput/ListInput.doc.mjs
 */

export {ListInput} from './ListInput';
export type {
  ListInputProps,
  ListInputColumn,
  ListInputChange,
  ListInputRenderContext,
  ListInputValueContext,
} from './ListInput';
