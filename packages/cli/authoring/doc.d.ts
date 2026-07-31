// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Back-compat shim for `@astryxdesign/cli/doc` type imports. The doc vocabulary
 * now lives in `./doctypes/types`; this re-export keeps existing references
 * resolving. Removed by the PR 2 import-path codemod.
 */
export type * from './doctypes/types';
