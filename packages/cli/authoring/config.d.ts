// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Back-compat shim for the `@astryxdesign/cli/config` type import. The config
 * types now live in `./config/type`; this re-export keeps existing
 * `import('.../authoring/config').AstryxConfig` references resolving. Removed by
 * the PR 2 import-path codemod.
 */
export type * from './config/type';
