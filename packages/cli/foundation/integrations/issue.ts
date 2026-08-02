// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The integration validation issue type.
 *
 * Surfaced by both the foundation-level project loader
 * (`foundation/config/project.mjs`, during `Project.load`) and the api-level
 * `validateIntegration`, so it lives in the shared foundation layer. It is NOT
 * part of the authoring surface — an integration author never writes one; it is
 * an internal diagnostic the CLI produces about a loaded integration.
 */

/** An issue surfaced while loading or validating an integration. */
export interface AstryxIntegrationIssue {
  code: string;
  severity: 'warning' | 'error';
  message: string;
}
