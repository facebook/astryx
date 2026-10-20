// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The integration subject's access to the environment (INV21): reading
 * one package's component docs and sources with the project's own TypeScript.
 *
 * @input a loaded integration and the directory the command runs in
 * @output the reports the integration checks attach to their results
 * @position api/integration (internal; not exported from ./api)
 */

import {
  discoverValidIntegrationComponents,
  forEachIntegrationDoc,
  integrationSourceForDoc,
} from '../../foundation/discovery/component-discovery.mjs';
import {comparePropDocs} from '../../foundation/discovery/prop-drift.mjs';
import {findCopiedPassages} from '../../foundation/discovery/copied-passages.mjs';

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
  // Every doc the package ships has its prop tables compared or listed as not
  // compared. A doc discovery leaves out (a hidden one, a second doc for one
  // name, or one whose source or own file doesn't load) gets a record under
  // its file name.
  const recorded = new Set(components.map(c => c.docPath));
  /** @type {typeof components} */
  const left = [];
  forEachIntegrationDoc(integration?.components, (docPath, stem) => {
    if (recorded.has(docPath)) return;
    recorded.add(docPath);
    left.push({
      name: stem,
      package: integration.name,
      docPath,
      sourcePath: integrationSourceForDoc(docPath),
      issuesUrl: integration.issuesUrl,
      group: null,
    });
  });
  return comparePropDocs([...components, ...left], {
    packageDir: packageDir ?? cwd,
    resolveFrom: [cwd, packageDir],
  });
}

/**
 * The passages two of a package's topics, or one of them and a Core topic,
 * repeat word for word (architecture:cli-surface DEC-8). Reads the package's
 * topics and Core's guides.
 *
 * @param {Parameters<typeof findCopiedPassages>[0]} discovered the package's
 *   docs, as discoverIntegrationDocs returns them
 */
export function integrationCopiedPassages(discovered) {
  return findCopiedPassages(discovered);
}
