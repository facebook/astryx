// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Doc module importers: how the doc reader and discovery execute an
 *   authored doc file.
 *
 * @input An absolute path to a `.doc.{ts,mjs,js}` (or legacy template) file.
 * @output The module's namespace object: the one a plain import of the file
 *   gives, until the file changes; then the edited file's, read once and
 *   shared until its next change. A long-running process (a docs site's
 *   search, an agent harness) thereby sees an edit to a doc file it already
 *   read. Only the doc file's own edits count: a module it imports stays as
 *   first loaded.
 * @position Called by ./read.mjs, which hands what comes back to the compiler,
 *   and by discovery, which reads a contributed topic's name and relationships
 *   to build the catalog. Doc files also run outside these importers: each CLI
 *   command imports its own self-docs statically for its help text, and the
 *   README script imports them at build time. ./doc-loads.test.mjs lists, site
 *   by site, every use of these importers and every other place the CLI runs
 *   anything but its static imports of other CLI code (a static doc import is
 *   one); a new site fails it. It catches every ordinary way of running code,
 *   whatever the local names; deliberate obfuscation is out of scope.
 */

import {pathToFileURL} from 'node:url';
import {createJiti} from 'jiti';
import {importUserModule} from '../fs/module-loader.mjs';
import {fileStamp, recordContentRead} from '../fs/read-record.mjs';

/** @type {ReturnType<typeof createJiti> | undefined} */
let jsxJiti;

/**
 * Each doc file imported in this process: its stamp at the last import and,
 * once it changed, the module imported for that change.
 * @type {Map<string, {stamp: string, changed?: Promise<any>}>}
 */
const imported = new Map();

/** Numbers each fresh native import's URL, so it names a new module. */
let changes = 0;

/**
 * Import `file` with `load` until it changes, then once with `loadFresh` for
 * each change, sharing that module until the next one. The file counts as
 * read by the running operation (see ../fs/read-record.mjs).
 * @param {string} file
 * @param {(file: string) => Promise<any>} load
 * @param {(file: string) => Promise<any>} loadFresh
 * @returns {Promise<any>}
 */
function importCurrent(file, load, loadFresh) {
  recordContentRead(file);
  const stamp = fileStamp(file);
  const seen = imported.get(file);
  if (!seen) {
    imported.set(file, {stamp});
    return load(file);
  }
  if (seen.stamp === stamp) return seen.changed ?? load(file);
  const changed = loadFresh(file);
  imported.set(file, {stamp, changed});
  return changed;
}

/**
 * The file's URL, naming a new module for each change.
 * @param {string} file
 * @returns {string}
 */
function freshUrl(file) {
  const url = pathToFileURL(file);
  url.searchParams.set('astryx-doc', String(++changes));
  return url.href;
}

/**
 * Import a component, hook, topic, or self-doc module: `.ts` through jiti,
 * anything else natively.
 * @param {string} file
 * @returns {Promise<any>}
 */
export function importDocModule(file) {
  return importCurrent(file, importUserModule, changed =>
    importUserModule(changed, {fresh: true}),
  );
}

/**
 * How core and external template docs have always been imported: `.ts`
 * through a JSX-aware jiti, anything else natively.
 * @param {string} file
 * @returns {Promise<any>}
 */
export function importTemplateModule(file) {
  return importCurrent(
    file,
    first => {
      if (first.endsWith('.ts')) {
        jsxJiti ??= createJiti(import.meta.url, {jsx: true});
        return jsxJiti.import(first);
      }
      return import(`file://${first}`);
    },
    changed =>
      changed.endsWith('.ts')
        ? createJiti(import.meta.url, {jsx: true, moduleCache: false}).import(
            changed,
          )
        : import(freshUrl(changed)),
  );
}

/**
 * Import a module natively, by file URL: how the docs API, search, and the
 * unchecked component and hook readers have always imported docs.
 * @param {string} file
 * @returns {Promise<any>}
 */
export function importNativeModule(file) {
  return importCurrent(
    file,
    first => import(pathToFileURL(first).href),
    changed => import(freshUrl(changed)),
  );
}
