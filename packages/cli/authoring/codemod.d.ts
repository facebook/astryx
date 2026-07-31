// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Back-compat shim for `@astryxdesign/cli/codemod` type imports. The codemod
 * authoring + runner types now live in `./codemod/type`; this re-export keeps
 * existing references (including the `CodemodTransform` imports in the codemod
 * transforms + runner infra) resolving. Removed by the PR 2 import-path codemod.
 */
export type * from './codemod/type';
