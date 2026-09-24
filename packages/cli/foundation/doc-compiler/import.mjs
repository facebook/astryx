// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Doc module importers — the only code that executes an authored doc
 *   file.
 *
 * @input An absolute path to a `.doc.{ts,mjs,js}` (or legacy template) file.
 * @output The module's namespace object.
 * @position Called by ./read.mjs, which compiles what comes back, and by
 *   discovery, which reads a contributed topic's name and relationships to
 *   build the catalog. A test holds every other module to not importing doc
 *   files at all.
 */

import {pathToFileURL} from 'node:url';
import {createJiti} from 'jiti';
import {importUserModule} from '../fs/module-loader.mjs';

/** @type {ReturnType<typeof createJiti> | undefined} */
let jsxJiti;

/**
 * Import a component, hook, topic, or self-doc module: `.ts` through jiti,
 * anything else natively.
 * @param {string} file
 * @returns {Promise<any>}
 */
export function importDocModule(file) {
  return importUserModule(file);
}

/**
 * How core and external template docs have always been imported: `.ts`
 * through a JSX-aware jiti, anything else natively.
 * @param {string} file
 * @returns {Promise<any>}
 */
export function importTemplateModule(file) {
  if (file.endsWith('.ts')) {
    jsxJiti ??= createJiti(import.meta.url, {jsx: true});
    return jsxJiti.import(file);
  }
  return import(`file://${file}`);
}

/**
 * Import a module natively, by file URL: how the docs API, search, and the
 * unchecked component and hook readers have always imported docs.
 * @param {string} file
 * @returns {Promise<any>}
 */
export function importNativeModule(file) {
  return import(pathToFileURL(file).href);
}
