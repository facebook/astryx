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
 *
 * Because every user-authored module flows through here, this is also where
 * the project-code gate lives: importing a module executes it, which is the
 * right trade in a workspace the operator trusts and the wrong one in CI,
 * triage, or agent runs over arbitrary checkouts. ASTRYX_NO_PROJECT_CODE=1
 * keeps the whole CLI on built-in data — config loading skips cleanly
 * (Project.load checks the gate first) and any other user-module import
 * fails with an error that names the variable. Modules under the CLI's own
 * package root are shipped code, not project code, and always load.
 */

import * as path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath, pathToFileURL} from 'node:url';
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
 * True unless this invocation opted out of executing code found in the
 * workspace (ASTRYX_NO_PROJECT_CODE=1).
 */
export function projectCodeAllowed() {
  return process.env.ASTRYX_NO_PROJECT_CODE !== '1';
}

// The CLI's own package root. Modules under it (assets/docs topics, shipped
// templates, command modules) are shipped code, not project code — the gate
// must not touch them, or "runs on built-in data" would break the built-ins.
const CLI_PACKAGE_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
);

/**
 * True when `file` is one of the CLI's own shipped modules.
 * @param {string} file
 */
export function isCliShippedPath(file) {
  const resolved = path.resolve(file);
  return (
    resolved === CLI_PACKAGE_ROOT ||
    resolved.startsWith(CLI_PACKAGE_ROOT + path.sep)
  );
}

/**
 * True when importing `file` would execute project code this invocation has
 * opted out of: the gate is on and the module is not one the CLI ships.
 * Every loader that does not go through {@link importUserModule} (the theme
 * compiler's jiti, the JSX-capable template jiti) asks this before loading.
 * @param {string} file absolute path
 */
export function isProjectCodeGated(file) {
  return !projectCodeAllowed() && !isCliShippedPath(file);
}

/**
 * The one-line refusal every gated loader reports.
 * @param {string} file
 */
export function projectCodeGateMessage(file) {
  return `ASTRYX_NO_PROJECT_CODE=1 — refusing to load ${file}; unset the variable to let astryx run modules from this workspace`;
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
 * Under ASTRYX_NO_PROJECT_CODE=1 this refuses everything except the CLI's own
 * shipped modules — importing executes the module — before any loader runs.
 *
 * @param {string} file absolute path
 * @param {{fresh?: boolean}} [options]
 * @returns {Promise<Record<string, unknown>>}
 */
export async function importUserModule(file, {fresh = false} = {}) {
  if (isProjectCodeGated(file)) {
    throw new Error(projectCodeGateMessage(file));
  }
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
