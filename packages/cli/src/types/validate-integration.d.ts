// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * validate-integration command JSON responses.
 *
 * Invocation                              -> type discriminator
 * ------------------------------------------------------------
 * astryx --json validate-integration       -> integration.validate
 * astryx --json validate-integration <pkg> -> integration.validate
 */

import type {AstryxIntegrationIssue} from './integration';

/** astryx --json validate-integration [package] */
export interface ValidateIntegrationResponse {
  type: 'integration.validate';
  data: {
    /** Integration package name, or null when no manifest was located. */
    name: string | null;
    /** Integration package version, or null when unavailable. */
    version: string | null;
    issues: AstryxIntegrationIssue[];
  };
}
