// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.server.ts
 * @input Imports the server shell from ButtonShell.tsx and the types from
 *   Button.tsx and index.ts
 * @output Exports Button, ButtonProps, ButtonVariant, ButtonSize,
 *   ButtonVariantMap: the same names as index.ts
 * @position The `react-server` entry of `@astryxdesign/core/Button`. A Server
 *   Component's import resolves here; every other import resolves index.ts.
 *
 * SYNC: When modified, update index.ts (the two entries export the same
 * names) and the `./Button` entry of /packages/core/package.json.
 */

export type {ButtonVariantMap} from './index';
export {Button} from './ButtonShell';
export type {ButtonProps, ButtonVariant, ButtonSize} from './Button';
