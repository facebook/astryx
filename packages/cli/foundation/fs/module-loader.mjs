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
 * `loadModuleWithParser` builds on these primitives to provide the single
 * load/validation boundary shared by config, integration, codemod, and
 * template discovery: import the module, take its default export, and hand it
 * to the authoring parser (which seals its own zod schema).
 */

import * as path from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import * as fs from 'node:fs';
import {createJiti} from 'jiti';

/** @type {ReturnType<typeof createJiti> | undefined} */
let jitiInstance;
let freshImportNonce = 0;
const requireFromHere = createRequire(import.meta.url);
function getJiti() {
  if (!jitiInstance) {
    jitiInstance = createJiti(import.meta.url);
  }
  return jitiInstance;
}

/**
 * Node treats `.js` as ESM only inside the nearest package scope whose
 * package.json declares `"type": "module"`; no package.json defaults to
 * CommonJS.
 * @param {string} file
 * @returns {boolean}
 */
function isCommonJsFile(file) {
  let dir = path.dirname(file);
  for (;;) {
    const packageJson = path.join(dir, 'package.json');
    if (fs.existsSync(packageJson)) {
      try {
        return JSON.parse(fs.readFileSync(packageJson, 'utf-8')).type !== 'module';
      } catch {
        return true;
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) return true;
    dir = parent;
  }
}

/**
 * Import a user-authored module. `.ts` is loaded via jiti; `.mjs`/`.js` use
 * native dynamic import for ordinary cached reads. A fresh `.ts` read uses a
 * no-cache jiti instance. A fresh CommonJS `.js` read evicts and reloads through
 * `require`; an ESM `.js` or `.mjs` read uses a cache-busted file URL. The
 * nearest package.json `type` decides `.js`, matching Node's package scopes.
 * Normal loads retain module caching. `fresh` is an explicit migration-only
 * escape hatch for rereading files that a codemod changed during this process.
 *
 * @param {string} file absolute path
 * @param {{fresh?: boolean}} [options]
 * @returns {Promise<Record<string, unknown>>}
 */
export async function importUserModule(file, {fresh = false} = {}) {
  if (fresh && file.endsWith('.ts')) {
    return await createJiti(import.meta.url, {moduleCache: false}).import(file);
  }
  if (fresh && file.endsWith('.js') && isCommonJsFile(file)) {
    const resolved = requireFromHere.resolve(file);
    delete requireFromHere.cache[resolved];
    const value = requireFromHere(file);
    if (
      value != null &&
      typeof value === 'object' &&
      value.__esModule === true &&
      Object.prototype.hasOwnProperty.call(value, 'default')
    ) {
      return value;
    }
    return {
      ...(value != null && typeof value === 'object' ? value : {}),
      default: value,
    };
  }
  if (file.endsWith('.ts')) {
    return await getJiti().import(file);
  }
  const url = pathToFileURL(file);
  if (fresh) {
    url.searchParams.set('astryx-fresh', String(++freshImportNonce));
  }
  return await import(url.href);
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
 * through an authoring parser. This is the single load/validation boundary for
 * all user-authored modules (config, integration, codemod, template): execute
 * the module, take the default export, and hand it to the parser, which returns
 * the typed value or throws a clear, readable error. Zod stays sealed inside
 * the parser — this boundary never touches it.
 *
 * @template T
 * @param {string} file absolute path
 * @param {(input: unknown, label?: string) => T} parse an authoring parser
 *   (parseConfig, parseIntegration, parseCodemod, parseTemplate)
 * @param {{label?: string, fresh?: boolean}} [opts] label used in error messages;
 *   `fresh` bypasses the module cache after an in-process codemod write
 * @returns {Promise<T>} parsed + typed value
 */
export async function loadModuleWithParser(
  file,
  parse,
  {label, fresh = false} = {},
) {
  const mod = await importUserModule(file, {fresh});
  return parse(mod?.default, label ?? file);
}
