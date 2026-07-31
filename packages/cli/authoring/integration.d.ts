// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Back-compat shim for the `@astryxdesign/cli/integration` type import. The
 * integration MANIFEST type now lives in `./integration/type`; this re-export
 * keeps existing references resolving. Removed by the PR 2 import-path codemod.
 *
 * `AstryxIntegrationIssue` is NOT part of the authoring surface — it is an
 * internal CLI validation type. It is defined here (not in `./integration/type`
 * and not re-exported from the `./index` barrel) so the existing
 * `authoring/integration` imports keep resolving until PR 2/3 relocate it to a
 * validation home.
 */
export type * from './integration/type';

/** An issue surfaced by an integration (internal CLI validation type). */
export interface AstryxIntegrationIssue {
  code: string;
  severity: 'warning' | 'error';
  message: string;
}
