// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.server.ts
 * @input Imports the server shell from IconButtonShell.tsx
 * @output Exports IconButton, IconButtonProps: the same names as index.ts
 * @position The `react-server` entry of `@astryxdesign/core/IconButton`.
 *
 * SYNC: When modified, update index.ts and the `./IconButton` entry of
 * /packages/core/package.json.
 */

export {IconButton} from './IconButtonShell';
export type {IconButtonProps} from './IconButton';
