// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Public re-export of the `validate-integration` command's types. Source of
 * truth is colocated in api/integration/validate-integration.type.mjs;
 * `AstryxIntegrationIssue` stays shared in types/integration.d.ts.
 */

export type {
  ValidateIntegrationOptions,
  ValidateIntegrationResponse,
} from '../api/integration/validate-integration.type.mjs';
