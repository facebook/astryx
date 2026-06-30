// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Shared module-loading + conventional-file-discovery primitives.
 *
 * Both config loading and integration loading need to (a) import a
 * user-authored module (`.ts` via jiti, `.mjs`/`.js` via native dynamic
 * import) and (b) find conventional files by basename in a fixed
 * load-precedence order. These helpers centralize that so the two callers stay
 * in lockstep.
 *
 * `loadModuleWithSchema` builds on these primitives to provide the single
 * load/validation boundary shared by config, integration, codemod, and
 * template discovery: import the module, take its default export, and validate
 * it against the expected zod schema.
 */

import * as path from 'node:path';
import {pathToFileURL} from 'node:url';
import * as fs from 'node:fs';
import {createJiti} from 'jiti';
import {formatZodError} from './config-schema.mjs';

let jitiInstance;
function getJiti() {
  if (!jitiInstance) {
    jitiInstance = createJiti(import.meta.url);
  }
  return jitiInstance;
}

/**
 * Import a user-authored module. `.ts` is loaded via jiti; `.mjs`/`.js` via
 * native dynamic import (file:// URL). Returns the full module namespace.
 * @param {string} file absolute path
 * @returns {Promise<Record<string, unknown>>}
 */
export async function importUserModule(file) {
  if (file.endsWith('.ts')) {
    return await getJiti().import(file);
  }
  return await import(pathToFileURL(file).href);
}

/**
 * Return the conventional files (by basename, in the given precedence order)
 * that exist directly in `dir`, as absolute paths. Never throws.
 * @param {string} dir
 * @param {string[]} basenames precedence-ordered
 * @returns {string[]} absolute paths of present files, in basenames order
 */
export function findPresentFiles(dir, basenames) {
  return basenames
    .filter(name => fs.existsSync(path.join(dir, name)))
    .map(name => path.join(dir, name));
}

/**
 * Import a user-authored module, take its default export, and validate it
 * against a zod schema. This is the single load/validation boundary for all
 * user-authored modules (config, integration, codemod, template): execute the
 * module, take the default export, validate it against the expected schema.
 * Throws a clear, readable error if the default export is missing or fails
 * validation.
 *
 * @template {import('zod').ZodType} S
 * @param {string} file absolute path
 * @param {S} schema
 * @param {{label?: string}} [opts] label used in error messages
 * @returns {Promise<import('zod').infer<S>>} parsed + typed value
 */
export async function loadModuleWithSchema(file, schema, {label} = {}) {
  const mod = await importUserModule(file);
  const exported = mod?.default;
  const result = schema.safeParse(exported);
  if (!result.success) {
    throw new Error(formatZodError(label ?? file, result.error));
  }
  return result.data;
}
