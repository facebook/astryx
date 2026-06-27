// Copyright (c) Meta Platforms, Inc. and affiliates.

import {validateConfig, validateIntegration} from './lib/config-schema.mjs';

/**
 * Type-preserving helpers for Astryx config and integration manifests.
 *
 * These are intentionally tiny runtime identity functions. Their value is the
 * exported TypeScript surface from `@astryxdesign/cli/config`, so config files
 * can get editor/type feedback without coupling to CLI internals.
 */

/**
 * @template {import('./types/config').AstryxConfig} T
 * @param {T} config
 * @returns {T}
 */
export function createConfig(config) {
  validateConfig(config);
  return config;
}

/**
 * @template {import('./types/config').AstryxIntegration} T
 * @param {T} integration
 * @returns {T}
 */
export function createIntegration(integration) {
  validateIntegration(integration);
  return integration;
}
