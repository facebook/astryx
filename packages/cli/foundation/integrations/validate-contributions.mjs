// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file On-disk contribution checks for a LOADED integration.
 *
 * These validators live in foundation rather than beside the
 * `validate-integration` command because foundation itself needs them:
 * `Project` collects integration issues while assembling components/templates,
 * and `integration-warnings` nudges about them on ordinary commands. Keeping
 * them here means those callers no longer reach up into `api/`.
 *
 * The manifest schema is NOT re-validated here — `loadIntegrations` already did
 * that and throws otherwise. What is re-checked is the on-disk contributions
 * (roots + codemods/templates/components), because those regress independently
 * of the manifest: a deleted directory, a template that lost its source file.
 *
 * @input a loaded-integration-shaped object (absolute contribution roots + identity)
 * @output AstryxIntegrationIssue[]
 * @position packages/cli/foundation/integrations — shared contribution validators
 */

import * as fs from 'node:fs';
import {discoverIntegrationCodemods} from '../../assets/codemods/integration-discovery.mjs';
import {discoverIntegrationTemplatesForOne} from '../discovery/template-adapter.mjs';
import * as componentDiscovery from '../discovery/component-discovery.mjs';
import {discoverIntegrationDocs} from '../discovery/docs-discovery.mjs';

/**
 * @typedef {import('./issue').AstryxIntegrationIssue} Issue
 * @typedef {import('./integrations.mjs').LoadedIntegration} LoadedIntegration
 */

/** @param {string} code @param {string} message @returns {Issue} */
export function issueError(code, message) {
  return {code, severity: 'error', message};
}

/**
 * Verify each declared contribution root exists on disk. A declared-but-missing
 * root is a `missing_root` error.
 * @param {{components?: string, templates?: string, codemods?: string, docs?: string}} resolved
 *   absolute resolved roots (undefined when not declared)
 * @param {Issue[]} issues
 */
function checkRoots(resolved, issues) {
  const kinds = /** @type {const} */ (['components', 'templates', 'codemods', 'docs']);
  for (const kind of kinds) {
    const root = resolved[kind];
    if (root == null) continue;
    if (!fs.existsSync(root)) {
      issues.push(
        issueError(
          'missing_root',
          `Declared ${kind} root does not exist on disk: ${root}`,
        ),
      );
    }
  }
}

/**
 * Validate the integration's codemods via the landed discovery. Discovery is
 * strict (throws on bad export / duplicate id); we convert any throw into an
 * `invalid_codemod` error.
 * @param {LoadedIntegration} integration loaded-integration-shaped object
 * @param {Issue[]} issues
 */
async function checkCodemods(integration, issues) {
  if (!integration.codemods || !fs.existsSync(integration.codemods)) return;
  try {
    await discoverIntegrationCodemods([integration]);
  } catch (err) {
    issues.push(issueError('invalid_codemod', /** @type {any} */ (err).message));
  }
}

/**
 * Validate the integration's templates via the landed discovery. Per-template
 * problems are reported as `invalid_template` errors.
 * @param {LoadedIntegration} integration loaded-integration-shaped object
 * @param {Issue[]} issues
 */
async function checkTemplates(integration, issues) {
  if (!integration.templates || !fs.existsSync(integration.templates)) return;
  try {
    const {errors} = await discoverIntegrationTemplatesForOne(integration);
    for (const e of errors) {
      issues.push(issueError('invalid_template', e.message));
    }
  } catch (err) {
    issues.push(issueError('invalid_template', /** @type {any} */ (err).message));
  }
}

/**
 * Validate the integration's components via the landed ownership discovery.
 * Feature-detected: if the component-ownership export isn't present in this
 * build (sibling PR not yet merged), component validation is skipped rather
 * than hard-failing.
 *
 * `discoverIntegrationComponents` returns ownership records and does not throw
 * on a missing same-stem source — it records `sourcePath: null`. We surface
 * each such record as an `invalid_component` error.
 * @param {LoadedIntegration} integration loaded-integration-shaped object
 * @param {Issue[]} issues
 */
async function checkComponents(integration, issues) {
  if (!integration.components || !fs.existsSync(integration.components)) return;
  const discover = componentDiscovery.discoverIntegrationComponents;
  if (typeof discover !== 'function') return; // feature not present yet
  try {
    const records = (await discover(integration)) ?? [];
    for (const record of records) {
      if (record?.sourcePath == null) {
        issues.push(
          issueError(
            'invalid_component',
            `Component "${record?.name}" is missing its same-stem source file ${record?.name}.tsx.`,
          ),
        );
      }
    }
  } catch (err) {
    issues.push(issueError('invalid_component', /** @type {any} */ (err).message));
  }
}

/**
 * Validate the integration's doc topics via the landed discovery. A doc that
 * cannot be loaded, is not a usable topic, or collides with a sibling is
 * reported as an `invalid_doc` error.
 *
 * Only per-file problems are visible here: a topic that collides with another
 * PACKAGE's, or names a `replaces`/`extends` target that does not exist, can
 * only be judged once every integration is resolved together, so those are
 * raised by `Project.docs()` instead.
 *
 * @param {LoadedIntegration} integration loaded-integration-shaped object
 * @param {Issue[]} issues
 */
async function checkDocs(integration, issues) {
  if (!integration.docs || !fs.existsSync(integration.docs)) return;
  try {
    const {errors} = await discoverIntegrationDocs(integration);
    for (const e of errors) {
      issues.push(issueError('invalid_doc', e.message));
    }
  } catch (err) {
    issues.push(issueError('invalid_doc', /** @type {any} */ (err).message));
  }
}

/**
 * Run every contribution validator against a loaded-integration-shaped object.
 * @param {LoadedIntegration} integration
 * @param {Issue[]} issues
 */
async function runContributionChecks(integration, issues) {
  await checkCodemods(integration, issues);
  await checkTemplates(integration, issues);
  await checkComponents(integration, issues);
  await checkDocs(integration, issues);
}

/**
 * Validate an already-LOADED integration (as produced by `loadIntegrations` —
 * absolute contribution roots plus identity) and return its issues. This is the
 * reuse seam for everyday commands that have already loaded the configured
 * integrations and want the SAME validators that `validate-integration` runs,
 * without re-resolving the manifest from disk.
 *
 * @param {LoadedIntegration} loaded loaded-integration-shaped object
 * @returns {Promise<Issue[]>}
 */
export async function validateLoadedIntegration(loaded) {
  /** @type {Issue[]} */
  const issues = [];
  if (!loaded || typeof loaded !== 'object') return issues;
  // A manifest that threw on import (or failed the schema) carries a load-error
  // marker and no contribution roots, so every check below would find nothing
  // and report a clean integration — which is how a stale manifest used to go
  // silently invisible. The load error IS the issue.
  if (loaded.__loadError) {
    return [issueError('integration_error', loaded.__loadError)];
  }
  checkRoots(
    {
      components: loaded.components,
      templates: loaded.templates,
      codemods: loaded.codemods,
      docs: loaded.docs,
    },
    issues,
  );
  await runContributionChecks(loaded, issues);
  return issues;
}
