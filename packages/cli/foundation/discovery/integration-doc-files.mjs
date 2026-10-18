// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The doc files an integration package ships, by root: exactly the
 * docs each root's reader serves, so the doc type check covers every doc the
 * CLI serves and nothing it does not.
 *
 * - components: the doc each component discovery records (the first per
 *   name; a `hidden` doc is not served);
 * - templates: the doc of each template template discovery serves;
 * - docs: the file of each topic, namespace and placed guide docs discovery
 *   serves, and each topic's and guide's `zh` and `dense` overlay that a docs
 *   read applies;
 * - themes: each theme's descriptor, as theme discovery resolves it. A themes
 *   root that discovery cannot read serves no theme, and is listed with the
 *   reason.
 * A doc a reader rejects (one that does not load, or a second doc for one
 * name) is reported by that reader's own check, not here. A file two readers
 * serve goes to the deepest root.
 *
 * @input A loaded integration and its resolved roots.
 * @output DocFile entries for checkDocTypes, each with the root it belongs to,
 *   and the roots a reader could not read.
 * @position Read by `astryx doctor integration validate` before it checks
 *   each doc against its authoring type.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {OVERLAY_LANGUAGES, overlayPath} from '../doc-compiler/read.mjs';
import {discoverIntegrationComponents} from './component-discovery.mjs';
import {discoverIntegrationDocs} from './docs-discovery.mjs';
import {discoverIntegrationTemplatesForOne} from './template-adapter.mjs';
import {discoverThemeDirectory} from './theme-discovery.mjs';
import {rootProblem} from '../integrations/validate-contributions.mjs';

/** @typedef {import('./doc-types.mjs').DocFile} DocFile */
/** @typedef {import('./doc-types.mjs').DocRoot} DocRoot */

/**
 * Every doc file the readers of an integration's roots serve, each assigned
 * to the deepest root that holds it, and each root a reader could not read.
 * @param {any} integration a loaded integration
 * @returns {Promise<{files: DocFile[], unread: Array<{path: string, reason: string}>}>}
 */
export async function integrationDocFiles(integration) {
  const {components, templates, docs, themes} = integration ?? {};
  /** @type {Array<[DocRoot, string, string[]]>} */
  const read = [];
  /** @type {Array<{path: string, reason: string}>} */
  const unread = [];
  // A root `validate` already reports (missing, a file, unreadable) is left
  // to that issue. A reader that fails inside a root, such as on a folder it
  // cannot read, leaves the root listed with the reason.
  /** @type {(root: string | undefined, label: string, files: () => Promise<Array<[DocRoot, string[]]>>) => Promise<void>} */
  const take = async (root, label, files) => {
    if (!root || rootProblem(root)) return;
    try {
      for (const [kind, list] of await files()) read.push([kind, root, list]);
    } catch (err) {
      unread.push({
        path: root,
        reason: `the ${label} root does not load, so no doc in it was checked: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  };
  await take(components, 'components', async () => [
    [
      'components',
      discoverIntegrationComponents(integration).map(c => c.docPath),
    ],
  ]);
  await take(templates, 'templates', async () => [
    [
      'templates',
      (await discoverIntegrationTemplatesForOne(integration)).templates.map(
        t => t.docPath,
      ),
    ],
  ]);
  await take(docs, 'docs', async () => {
    const found = await discoverIntegrationDocs(integration);
    // Topics and placed guides are read with their overlays; a namespace
    // names its file `<package name>/<path in the root>`.
    const withOverlays = [
      ...found.records.map(record => record.path),
      ...found.guides.map(guide => guide.ref.topicFile),
    ];
    const prefix = `${integration.name}/`;
    const namespaces = found.namespaces.map(entry =>
      path.join(
        /** @type {string} */ (docs),
        ...(entry.source.startsWith(prefix)
          ? entry.source.slice(prefix.length)
          : entry.source
        ).split('/'),
      ),
    );
    return [
      ['docs', [...withOverlays, ...namespaces]],
      [
        'docs-overlay',
        withOverlays.flatMap(file =>
          OVERLAY_LANGUAGES.map(lang => overlayPath(file, lang)).filter(
            overlay => fs.existsSync(overlay),
          ),
        ),
      ],
    ];
  });
  await take(themes, 'themes', async () => [
    [
      'themes',
      discoverThemeDirectory(
        /** @type {string} */ (themes),
        integration?.name ?? 'the package',
      ).map(theme => theme.docPath),
    ],
  ]);
  /** @type {Map<string, {root: DocRoot, dir: string}>} */
  const owners = new Map();
  for (const [root, dir, files] of read) {
    for (const file of files) {
      const owner = owners.get(file);
      if (!owner || dir.length > owner.dir.length) {
        owners.set(file, {root, dir});
      }
    }
  }
  return {
    files: [...owners]
      .map(([file, {root}]) => ({path: file, root}))
      .sort((a, b) => a.path.localeCompare(b.path)),
    unread,
  };
}
