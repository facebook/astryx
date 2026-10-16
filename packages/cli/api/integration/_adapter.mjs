// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The integration subject's access to the environment (INV21): reading
 * one package's component docs and sources with the project's own TypeScript.
 *
 * @input a loaded integration and the directory the command runs in
 * @output the reports the integration checks attach to their results
 * @position api/integration (internal; not exported from ./api)
 */

import {discoverValidIntegrationComponents} from '../../foundation/discovery/component-discovery.mjs';
import {comparePropDocs} from '../../foundation/discovery/prop-drift.mjs';

/**
 * Each component doc's props compared with the component's TypeScript props,
 * read with the project's own compiler (spec:AST-039 FR12). Without one, the
 * report says the comparison was skipped.
 * @param {any} integration a loaded integration
 * @param {string} cwd
 * @returns {Promise<import('../../foundation/discovery/prop-drift.mjs').PropDriftReport>}
 */
export async function integrationPropDrift(integration, cwd) {
  const packageDir = /** @type {{__packageDir?: string}} */ (integration)
    .__packageDir;
  const {components} = await discoverValidIntegrationComponents(integration);
  return comparePropDocs(components, {
    packageDir: packageDir ?? cwd,
    resolveFrom: [cwd, packageDir],
  });
}
