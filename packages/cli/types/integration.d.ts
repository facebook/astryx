// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * The integration-manifest authoring surface moved to
 * `@astryxdesign/core/authoring`. `AstryxIntegration` and `createIntegration`
 * are re-exported here so existing `@astryxdesign/cli/integration` type imports
 * keep resolving. `AstryxIntegrationIssue` stays in the CLI — it is an internal
 * validation type, not part of the authoring surface.
 */
export type {AstryxIntegration} from '@astryxdesign/core/authoring';
export {createIntegration} from '@astryxdesign/core/authoring';

/** An issue surfaced by an integration. */
export interface AstryxIntegrationIssue {
  code: string;
  severity: 'warning' | 'error';
  message: string;
}
