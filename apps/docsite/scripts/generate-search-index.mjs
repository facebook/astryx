// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Writes public/search-index.json: what the site's search panel
 * searches, so its answers are the CLI's.
 *
 * The panel runs the CLI's own search (`searchCatalog` from
 * `@astryxdesign/cli/search`) in the browser. This script exports the
 * catalog that search ranks (`gatherSearchCatalog` from
 * `@astryxdesign/cli/api`), from the CLI this site builds with, keeps the
 * packages this build documents, and ships it with the site's link tables
 * (src/generated/searchLinks.json, written by generate-data.mjs). Every
 * search change in the CLI reaches the site on its next build; nothing here
 * ranks.
 *
 * Run after generate-data.mjs (pnpm generate runs the generators in order).
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {gatherSearchCatalog} from '@astryxdesign/cli/api';
import {getTarget} from './resolve-content-root.mjs';
import {readAdmittedIntegrationPackages} from '../src/lib/integrationTargets.mjs';
import {
  SEARCH_INDEX_FILE,
  checkSearchIndex,
  cliPackageVersion,
  documentedCatalog,
} from './lib/search-index.mjs';

const DOCSITE_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const GENERATED = path.join(DOCSITE_ROOT, 'src', 'generated');

const admitted = readAdmittedIntegrationPackages(GENERATED, getTarget());
const catalog = documentedCatalog(
  await gatherSearchCatalog({cwd: DOCSITE_ROOT}),
  admitted,
);
const links = JSON.parse(
  fs.readFileSync(path.join(GENERATED, 'searchLinks.json'), 'utf-8'),
);
const index = {catalog, links};
checkSearchIndex(index, cliPackageVersion());

const out = path.join(DOCSITE_ROOT, SEARCH_INDEX_FILE);
fs.writeFileSync(out, JSON.stringify(index));
console.log(
  `Generated ${SEARCH_INDEX_FILE}: ${catalog.all.length} entries from @astryxdesign/cli ${catalog.version}, ${Math.round(fs.statSync(out).size / 1024)}KB`,
);
