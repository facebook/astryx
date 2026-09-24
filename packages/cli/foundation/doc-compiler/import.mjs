// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Doc module importers: how the doc reader and discovery execute an
 *   authored doc file.
 *
 * @input An absolute path to a `.doc.{ts,mjs,js}` (or legacy template) file.
 * @output The module's namespace object.
 * @position Called by ./read.mjs, which hands what comes back to the compiler,
 *   and by discovery, which reads a contributed topic's name and relationships
 *   to build the catalog. Doc files also run outside these importers: each CLI
 *   command imports its own self-docs statically for its help text, and the
 *   README script imports them at build time. ./doc-loads.test.mjs lists, site
 *   by site, every use of these importers and every other place the CLI runs
 *   anything but its static imports of other CLI code (a static doc import is
 *   one); a new site fails it.
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
