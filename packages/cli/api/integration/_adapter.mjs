// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The integration subject's access to the environment (INV21): reading
 * one package's component docs and sources with the project's own TypeScript.
 *
 * @input a loaded integration and the directory the command runs in
 * @output the reports the integration checks attach to their results
 * @position api/integration (internal; not exported from ./api)
 */

import * as path from 'node:path';
import {
  discoverValidIntegrationComponents,
  docStem,
  forEachIntegrationDoc,
  integrationSourceForDoc,
} from '../../foundation/discovery/component-discovery.mjs';
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
  // Every doc the package ships has its prop tables compared or listed as not
  // compared. A doc discovery leaves out (a hidden one, or one whose source
  // or own file doesn't load) gets a record under its file name. A doc that
  // another with the same stem beside it outranks is the same doc.
  const stems = new Set(
    components.map(c => path.join(path.dirname(c.docPath), docStem(c.docPath))),
  );
  /** @type {typeof components} */
  const left = [];
  forEachIntegrationDoc(integration?.components, (docPath, stem) => {
    const key = path.join(path.dirname(docPath), stem);
    if (stems.has(key)) return;
    stems.add(key);
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
