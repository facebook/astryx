// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Fails the build when public/search-index.json was not written by the
 * @astryxdesign/cli this site builds with, so the panel never ranks with
 * another release's catalog.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  SEARCH_INDEX_FILE,
  checkSearchIndex,
  cliPackageVersion,
} from './lib/search-index.mjs';

const DOCSITE_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const file = path.join(DOCSITE_ROOT, SEARCH_INDEX_FILE);
if (!fs.existsSync(file)) {
  throw new Error(`${SEARCH_INDEX_FILE} is missing: run pnpm generate.`);
}
checkSearchIndex(
  JSON.parse(fs.readFileSync(file, 'utf-8')),
  cliPackageVersion(),
);
console.log(`${SEARCH_INDEX_FILE}: matches the CLI this site builds with.`);
