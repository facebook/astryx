// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated types for the `integration init` command — source of truth
 * for the API response receipt and options.
 */

/**
 * @typedef {object} IntegrationInitOptions
 * @property {string} [name] Package name (e.g. `@acme/astryx-widgets`). Default: directory name.
 * @property {boolean} [dryRun] Preview what would change without writing files or installing.
 * @property {boolean} [noInstall] Skip the dependency install step.
 */

/**
 * @typedef {object} IntegrationInitData
 * @property {string} name Resolved package name.
 * @property {boolean} packageCreated Whether package.json was created (vs. updated).
 * @property {string[]} fieldsAdded Names of package.json fields that were added.
 * @property {boolean} installed Whether dev dependencies were installed.
 * @property {boolean} dryRun Whether this was a dry run.
 * @property {string[]} notes Informational notes for the author (e.g. missing exports map on an existing package).
 */

/**
 * @typedef {object} IntegrationInitResponse
 * @property {'integration.init'} type
 * @property {IntegrationInitData} data
 */

export {};
