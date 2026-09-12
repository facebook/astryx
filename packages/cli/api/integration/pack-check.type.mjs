// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated types for `astryx integration pack --check`.
 */

/**
 * @typedef {object} IntegrationPackCheckOptions
 * @property {string} [cwd]
 */

/**
 * @typedef {object} IntegrationPackCheckResponse
 * @property {'integration.pack-check'} type
 * @property {PackCheckData} data
 */

/** @typedef {IntegrationPackCheckResponse} PackCheckResponse */

/**
 * @typedef {object} PackCheckData
 * @property {string|null} name
 * @property {string|null} version
 * @property {boolean} packable — true when zero error-severity issues
 * @property {PackCheckTarball|null} tarball
 * @property {PackCheckInventory} inventory
 * @property {{local: import('../../foundation/integrations/contribution-inventory.mjs').ContributionIdentities|null, packed: import('../../foundation/integrations/contribution-inventory.mjs').ContributionIdentities|null}} contributions
 * @property {import('../../foundation/integrations/issue').AstryxIntegrationIssue[]} issues
 */

/**
 * @typedef {object} PackCheckTarball
 * @property {string} filename
 * @property {number} fileCount
 * @property {number} size
 * @property {number} unpackedSize
 */

/**
 * @typedef {object} PackCheckInventory
 * @property {string|null} manifest
 * @property {PackCheckInventoryRoot[]} roots
 * @property {number} expectedFiles
 * @property {number} packedFiles
 */

/**
 * @typedef {object} PackCheckInventoryRoot
 * @property {'themes'|'components'|'templates'|'codemods'|'docs'} kind
 * @property {string} path
 * @property {number} expectedFiles
 * @property {string[]} missingFiles
 * @property {boolean} complete
 */

export {};
